import { Context, Telegraf } from "telegraf";
import { ITitledDocumentInfo } from 'apps/mkgtru-api/src/types/ITitledDocumentInfo';
import { PrismaClient, Users } from '@prisma/client';
import { territories } from 'apps/mkgtru-api/src/types/territories';
import axios from "axios";
const schedule = require('node-schedule');

export interface IBotCommand { 'command': string, 'description': string };

const prisma = new PrismaClient();

const _LINE_BREAK: string = "\n";
const _ROW_BREAK: string = "\n\n";

const _DOCUMENT_ERROR = "Не удалось получить документ с сервера";

export class TgBot {

    public botObject: Telegraf;

    static info = {
        started: false,
        changesTimestamp: {
            "kuchin": 0,
            "lublino": 0
        },
    }

    constructor(botToken: string) {
        try {
            this.botObject = new Telegraf(botToken);
            this.setCommands;
        } catch (error) {
            console.error(error)
        }
    }

    private commands: IBotCommand[] = [
        { 'command': "start", "description": "запуск бота" },
        { 'command': "changes", "description": "получение информации о заменах" },
        { 'command': "status", "description": "получение состояния сервера" },
        { 'command': "practice", "description": "получение расписаний практики" },
        { 'command': "profile", "description": "настройка профиля" },
    ];


    /**
     * Setting commands
     * @date 3/17/2023 - 9:29:40 AM
     *
     * @public
     * @async
     * @returns {*}
     */
    public async setCommands() {
        await this.botObject.telegram.setMyCommands(this.commands);
        //start message - registration
        this.botObject.start(this.onStart)

        //настройка профиля
        this.botObject.command("profile", this.onProfile)

        //Обработка команды замены
        this.botObject.command("changes", this.onChanges)

        //Получение практики
        this.botObject.command("practice", this.onPractice)

        //checking status
        this.botObject.command("status", this.checkStatus)

        //CALLBACKS

        //set lublino callback
        this.botObject.action("ifromlublino", (context) => { this.changeProfileTerrritory(context, "lublino") })

        //set kuchin callback
        this.botObject.action("ifromkuchin", (context) => { this.changeProfileTerrritory(context, "kuchin") })

        this.botObject.action("profile", this.onProfile);
        this.botObject.action("practice", this.onPractice);
        this.botObject.action("changes", this.onChanges);
        this.botObject.action("status", this.checkStatus);

    }


    public async onStart(context: Context) {
        const sender = context.from;
        const user = await TgBot.checkUser(sender.id);
        console.log({ user });
        if (user == null) {
            try {
                const tg = await prisma.telegramAccount.create({
                    data: {
                        name: `${sender.first_name}`,
                        surname: `${sender.last_name}`,
                        telegramId: sender.id,
                        username: `${sender.username}`
                    }
                })
                await prisma.users.create({
                    data: {
                        name: sender.first_name,
                        surname: `${sender.last_name}`,
                        email: null,
                        telegramAccountId: tg.id
                    }
                });
            } catch (error) {
                console.log(typeof error)
                console.log({ error })
            }

        }
        context.sendMessage(`${sender.first_name}, добро пожаловать!${_LINE_BREAK}Если Вы с люблино, то воспользуйтесь командой /profile${_ROW_BREAK}/changes - просмотр замен${_LINE_BREAK}/practice - расписания практики${_ROW_BREAK}Остальные команды можно посмотреть, если ввести в строку сообщения символ косой черты: /`)
    }


    async onProfile(context: Context) {
        const user = await TgBot.checkUser(context.from.id);
        const messageText = "Ваш ранг: " + user.role
            + _ROW_BREAK +
            "Ваше имя: " + user.name
            + _ROW_BREAK +
            "Ваша территория: " + user.territory

        context.reply(messageText,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: `Я с Кучина`, callback_data: "ifromkuchin" },
                            { text: `Я с Люблино`, callback_data: "ifromlublino" },
                        ]
                    ]
                }
            }
        )
    }


    async onChanges(context: Context) {
        const user = await TgBot.checkUser(context.from.id);

        if (!!user) {
            const doc: ITitledDocumentInfo | null = await TgBot.getAPIResponse("/changes", user.territory);
            console.log({ doc })
            if (!!doc) {
                context.sendMessage(`Документ обновлён: ${doc?.last_modified.ru}`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: "Скачать", url: doc?.links.file },
                                    { text: "Просмотреть", url: doc?.links.views.google_docs },
                                ]
                            ]
                        }
                    })
            } else {
                context.sendMessage(_DOCUMENT_ERROR)
            }
        }
    }

    async onPractice(context: Context) {
        {
            const user = await TgBot.checkUser(context.from.id);

            if (!!user) {
                const doc: ITitledDocumentInfo[] = await TgBot.getAPIResponse("/practicelist", user.territory)
                const buttons = [[]];

                if (!!doc) {
                    doc?.map((document, index) => {
                        if (!buttons[index]) {
                            buttons[index] = [];
                        }
                        buttons[index] = [...buttons[index], { text: document.title, url: document.links.views.google_docs }]
                    })

                    context.sendMessage(`Расписания практики:`,
                        {
                            reply_markup: {
                                inline_keyboard: buttons
                            }
                        })
                }
                else {
                    context.sendMessage(_DOCUMENT_ERROR)
                }
            }
        }
    }

    async changeProfileTerrritory(context: Context, terr: territories) {
        const user = await TgBot.checkUser(context?.from.id);

        if (!!user) {
            await prisma.users.update({
                where: {
                    identifer: user.identifer
                },
                data: {
                    territory: terr
                }
            })

            try {
                context.answerCbQuery(`Вам установлен режим для территории ${terr}`, { show_alert: true });
            } catch (error) { }
        }
    }

    async checkStatus(context: Context) {
        const resp: "OK" | string | null = await TgBot.getAPIResponse("/status")
        context.sendMessage(resp || "MKGTRU-API IS BROKEN")
    }

    static async getAPIResponse(path: "/changes" | "/status" | "/practicelist", territory?: territories): Promise<any> {
        const url = `${process.env.MKGT_API_PATH}${path}?territory=${!!territory ? territory : "lublino"}`;
        try {
            const response = (await axios.get(url, { headers: { "authorization": `Bearer ${process.env.ACCESS_TOKEN}` }, timeout: 80000 }));
            console.log({ 'req_to_api': url, status: response.statusText })
            return response.data;
        } catch (error) {
            return null;
        }
    }

    static async checkUser(tgId: number): Promise<Users> {
        const user = await prisma.users.findFirstOrThrow({
            include: {
                tgAccount: true
            },
            where: {
                tgAccount: {
                    telegramId: tgId
                }
            }
        })
        return user;
    }

    private changesChecker = schedule.scheduleJob("*/25 * * * *", this.checkChangesCronJob);

    async checkChangesCronJob() {
        this.checkChanges("lublino");
        this.checkChanges("kuchin");
    }

    private async checkChanges(territory: territories) {
        const changesDocInfo: ITitledDocumentInfo = await TgBot.getAPIResponse("/changes", territory);

        //определение необходимости рассылки
        if (!!changesDocInfo && changesDocInfo.last_modified.timestamp != TgBot.info.changesTimestamp[territory]) {
            TgBot.info.changesTimestamp[territory] = changesDocInfo.last_modified.timestamp;

            const users = await prisma.telegramAccount.findMany({
                select: {
                    telegramId: true,
                    Users: {
                        select: {
                            territory: true
                        }
                    }
                },
                where: {
                    Users: {
                        some: {
                            territory: territory
                        }
                    }
                }
            })
            console.log({ users_to_notif: users?.length, terr: territory })
            users.forEach(user => {
                const tgUserId = user.telegramId.toString();

                try {
                    this.botObject.telegram.sendMessage(tgUserId, `Замены обновлены для территории: ${territory}`)
                } catch (error) { console.log(error) }

            })

        }
        else {
            console.log("changes not updated")
        }
    }

    launchBot() {
        TgBot.info.started = true;
        this.botObject.launch();
    }

    checkContext(context: Context) {
        console.log(context)
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            console.log({ target, propertyKey, descriptor });
        };
    }
}