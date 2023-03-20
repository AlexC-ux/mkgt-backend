import { Context, Telegraf } from "telegraf";
import { ITitledDocumentInfo } from 'apps/mkgtru-api/src/types/ITitledDocumentInfo';
import { acccess_roles, PrismaClient, Users } from '@prisma/client';
import { territories } from 'apps/mkgtru-api/src/types/territories';
import axios from "axios";

export interface IBotCommand { 'command': string, 'description': string };

const prisma = new PrismaClient();

const _LINE_BREAK: string = "\n";
const _ROW_BREAK: string = "\n\n";

const _DOCUMENT_ERROR = "Не удалось получить документ с сервера";

const adminChannelName = "@alexcux_dev"

export class TgBot {

    public static botObject: Telegraf;

    static info = {
        started: false,
        changesTimestamp: {
            "kuchin": 0,
            "lublino": 0
        },
    }

    constructor(botToken: string) {
        try {
            TgBot.botObject = new Telegraf(botToken);
            this.setupCommands();
        } catch (error) {
            console.error(error)
        }
    }

    static commands: IBotCommand[] = [
        { 'command': "start", "description": "показать главное меню" },
        { 'command': "help", "description": "показать команды" },
        { 'command': "status", "description": "получение состояния сервера" },
    ];

    static adminCommands: IBotCommand[] = [
        { 'command': "users", "description": "статистика по пользователям" },
        { 'command': "sendAll", "description": "Отправка всем текстового сообщения" },
    ];

    static mainMenu = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: `Показать замены`, callback_data: "changes" },
                    { text: `Расписание практики`, callback_data: "practice" }
                ],
                [
                    { text: `Аудитории`, callback_data: "cabinets" },
                    { text: `Расписания`, callback_data: "timetables" },
                    { text: "Звонки", callback_data: "callstable" }
                ],
                [
                    { text: `Настройки профиля`, callback_data: "profile" }
                ],
                [
                    { text: `Карта прохода к колледжу`, url: "https://yandex.ru/maps/213/moscow/?ll=37.643452%2C55.804215&mode=usermaps&source=constructorLink&um=constructor%3A761f4b5f3ab5e1ef399f9b57ab726d2834ed7dcaca7ef86b4eecefb68759b381&z=16" }
                ],
                [
                    { text: `Информация разработчикам`, callback_data: "developerinfo" }
                ],
            ]
        }
    }
    /**
     * Setting commands
     * @date 3/17/2023 - 9:29:40 AM
     *
     * @public
     * @async
     * @returns {*}
     */
    public async setupCommands() {

        //setting commands list
        await TgBot.botObject.telegram.setMyCommands(TgBot.commands);

        TgBot.botObject.use(this.botMiddleware)

        //start message - registration
        TgBot.botObject.start(this.onStart)

        //set /help answer
        TgBot.botObject.help(this.getHelpMessage)

        //checking status
        TgBot.botObject.command("status", this.checkStatus)

        //set lublino callback
        TgBot.botObject.action("ifromlublino", (context) => { this.changeProfileTerrritory(context, "lublino") })

        //set kuchin callback
        TgBot.botObject.action("ifromkuchin", (context) => { this.changeProfileTerrritory(context, "kuchin") })

        //getting api key
        TgBot.botObject.action("getApiKey", this.getApiKey);

        //getting info for devs
        TgBot.botObject.action("developerinfo", this.getDevInfo);

        //getting profile info
        TgBot.botObject.action("profile", this.onProfile);

        //getting calls table
        TgBot.botObject.action("callstable", this.getCallsTable)

        //getting practise list
        TgBot.botObject.action("practice", this.onPractice);

        //getting changes
        TgBot.botObject.action("changes", this.onChanges);

        //getting server status
        TgBot.botObject.action("status", this.checkStatus);

        //cb for hide msg
        TgBot.botObject.action("showMainMenu", this.showMainMenu);

        //cb for delete msg
        TgBot.botObject.action("deleteCb", this.deleteOnCallback);

        //getting timetables
        TgBot.botObject.action("timetables", this.getTimetables);

        //getting cabinets updates
        TgBot.botObject.action("cabinets", this.getCabinets);

        //getting admin commands
        TgBot.botObject.command("admin", this.getHelpAdminMessage);

        //getting users stistic
        TgBot.botObject.command("users", this.getUsersCount);

        //sending message to all
        TgBot.botObject.command("sendAll", this.sendTextToAll)
    }

    public async onStart(context: Context) {
        const sender = context.from;
        const user = await TgBot.checkUser(sender.id);
        if (user == null) {
            try {
                const tg = await prisma.telegramAccount.create({
                    data: {
                        name: `${sender.first_name}`,
                        surname: sender.last_name || null,
                        telegramId: sender.id,
                        username: sender.username || null
                    }
                })
                await prisma.users.create({
                    data: {
                        name: sender.first_name,
                        surname: sender.last_name || null,
                        email: null,
                        telegramAccountId: tg.id
                    }
                });
            } catch (error) {
                console.log({ error, context })
            }
        }

        await context.sendMessage("🦉").catch(TgBot.catchPollingError)
        context.sendMessage(`${sender.first_name}, добро пожаловать!` +
            _ROW_BREAK +
            `По умолчанию режим работы для студентов с Кучина пер. Если Вы учитесь в Люблино, то воспользуйтесь кнопкой 'Настройки профиля' ниже` +
            _ROW_BREAK +
            `/help покажет список доступных команд`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: `Показать замены`, callback_data: "changes" },
                        { text: `Расписание практики`, callback_data: "practice" }
                    ],
                    [
                        { text: `Аудитории`, callback_data: "cabinets" },
                        { text: `Расписания`, callback_data: "timetables" },
                        { text: "Звонки", callback_data: "callstable" }
                    ],
                    [
                        { text: `Настройки профиля`, callback_data: "profile" }
                    ],
                    [
                        { text: `Карта прохода к колледжу`, url: "https://yandex.ru/maps/213/moscow/?ll=37.643452%2C55.804215&mode=usermaps&source=constructorLink&um=constructor%3A761f4b5f3ab5e1ef399f9b57ab726d2834ed7dcaca7ef86b4eecefb68759b381&z=16" }
                    ],
                    [
                        { text: `Информация разработчикам`, callback_data: "developerinfo" }
                    ],
                ]
            }
        }).catch(TgBot.catchPollingError);
    }

    async getCallsTable(context: Context) {
        context.replyWithDocument({ filename: "Расписание_Звонков.svg", url: "https://mkgt.ru/images/colledge/zvonki.svg" }, {
            reply_markup: {
                inline_keyboard: [[{ text: "Скрыть", callback_data: "deleteCb" }]]
            }
        }).catch(TgBot.catchPollingError);
        context.answerCbQuery().catch(TgBot.catchPollingError);
    }

    async getHelpMessage(context: Context) {
        let result = "Команды бота:";
        TgBot.commands.map((commandElement, index) => {
            result += `${_LINE_BREAK}*${index + 1}\\.* \`/${commandElement.command}\` \\- _${commandElement.description}_`
        })
        context.sendMessage(result, { parse_mode: "MarkdownV2" }).catch(TgBot.catchPollingError)
    }

    async botMiddleware(context: Context, next: () => Promise<any>,) {
        const ignoreChannel = ["/start", "/status", "admin", "users", "sendAll"]
        updateProfile(context);
        const sended: any = context.update;
        const incomingMessage = sended?.message?.text || sended?.callback_query?.data
        console.log(`Collected message ${incomingMessage}`)
        if (await isUserInChannel(context)||ignoreChannel.includes(incomingMessage)) {
            await next();
        }else{
            context.sendMessage(`Бот совершенно бесплатен для пользователей, но в знак поддержки мы просим только подписку на канал разработчика: ${adminChannelName}`)
        }
    }

    //error handler
    static async catchPollingError(error: any, context?: Context) {
        if (
            //skip errrors
            error?.response?.error_code != 403 //if user not found
            &&
            error?.response?.error_code != 400 //if chat not found
            &&
            !error?.toString().includes(`"answerCbQuery" isn't available for "message"`) //if answer callback on message
        ) {
            console.log("ЧТО-ТО НАЕБНУЛОСЬ!")
            console.log(error)
            await prisma.users.findMany({
                select: {
                    tgAccount: {
                        select: {
                            telegramId: true,
                        }
                    }
                },
                where: {
                    role: {
                        in: ["admin"]
                    }
                }
            }).then(admins => {
                admins.forEach(admin => {
                    TgBot.botObject.telegram.sendMessage(admin.tgAccount.telegramId.toString(), `*ERROR LOG* \`\`\`${_LINE_BREAK}${error?.toString() || JSON.stringify(error)}${_LINE_BREAK}\`\`\``, { parse_mode: "MarkdownV2" }).catch(TgBot.catchPollingError);
                });
            })
        }
    };

    async getCabinets(context: Context) {
        const user = await TgBot.checkUser(context.callbackQuery.from.id || context.message.from.id)

        if (!!user) {
            const doc: ITitledDocumentInfo | null = await TgBot.getAPIResponse("/auditories", user.territory)

            if (!!doc) {
                context.editMessageText(`Распределение аудиторий от ${doc.last_modified.ru}`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: "Скачать", url: doc?.links.file },
                                    { text: "Просмотреть", url: doc?.links.views.google_docs },
                                ],
                                [{ text: "Вернуться", callback_data: "showMainMenu" }]
                            ]
                        }
                    }).catch(TgBot.catchPollingError);
                context.answerCbQuery().catch(TgBot.catchPollingError);
            }
            else {
                context.sendMessage(_DOCUMENT_ERROR).catch(TgBot.catchPollingError);
            }
        }
    }

    async getTimetables(context: Context) {
        const user = await TgBot.checkUser(context.callbackQuery.from.id || context.message.from.id)

        if (!!user) {
            const doc: ITitledDocumentInfo[] = await TgBot.getAPIResponse("/timetables", user.territory)
            const buttons = [[]];

            if (!!doc) {
                doc?.map((document, index) => {
                    if (!buttons[index]) {
                        buttons[index] = [];
                    }
                    buttons[index] = [...buttons[index], { text: document.title, url: document.links.views.google_docs }]
                })
                context.editMessageText(`Расписания занятий:`,
                    {
                        reply_markup: {
                            inline_keyboard: [...buttons, [{ text: "Вернуться", callback_data: "showMainMenu" }]]
                        }
                    }).catch(TgBot.catchPollingError);
                context.answerCbQuery().catch(TgBot.catchPollingError);
            }
            else {
                context.sendMessage(_DOCUMENT_ERROR).catch(TgBot.catchPollingError);
            }
        }
    }

    async onProfile(context: Context) {
        const user = await TgBot.checkUser(context.from.id);

        if (!!user) {
            const messageText = "Ваш ранг: " + user.role
                + _ROW_BREAK +
                "Ваше имя: " + user.name
                + _ROW_BREAK +
                "Ваша территория: " + user.territory

            context.editMessageText(messageText,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: `Я с Кучина`, callback_data: "ifromkuchin" },
                                { text: `Я с Люблино`, callback_data: "ifromlublino" },
                            ],
                            [
                                { text: "Вернуться", callback_data: "showMainMenu" }
                            ]
                        ]
                    }
                }
            ).catch(TgBot.catchPollingError);

            context.answerCbQuery().catch(TgBot.catchPollingError);
        }
    }

    async getDevInfo(context: Context) {
        context.editMessageText("Информация разработчикам." +
            _ROW_BREAK +
            "Документация к API: http://45.87.247.20:8080/api-doc",
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Получить ключ доступа", callback_data: 'getApiKey' }],
                        [{ text: "Вернуться", callback_data: "showMainMenu" }]
                    ]
                }
            }).catch(TgBot.catchPollingError);
        context.answerCbQuery().catch(TgBot.catchPollingError);
    }

    async getApiKey(context: Context) {
        const user = await TgBot.checkUser(context.callbackQuery.from.id || context.from.id)
        if (!!user) {
            context.sendMessage("Ваш токен:" + _LINE_BREAK + `||${user.token}||`, {
                parse_mode: "MarkdownV2", reply_markup:
                {
                    inline_keyboard: [
                        [{ text: "Скрыть токен", callback_data: "deleteCb" }]
                    ]
                }
            })
            context.answerCbQuery().catch(TgBot.catchPollingError);
        }
    }

    async onChanges(context: Context) {
        const user = await TgBot.checkUser(context.from.id);

        if (!!user) {
            const doc: ITitledDocumentInfo | null = await TgBot.getAPIResponse("/changes", user.territory);
            console.log({ doc })
            if (!!doc) {
                context.editMessageText(`Замены от ${doc?.last_modified.ru}`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: "Скачать", url: doc?.links.file },
                                    { text: "Просмотреть", url: doc?.links.views.google_docs },
                                ],
                                [
                                    { text: "Вернуться", callback_data: "showMainMenu" }
                                ]
                            ]
                        }
                    }).catch(TgBot.catchPollingError);
                context.answerCbQuery().catch(TgBot.catchPollingError);
            } else {
                context.sendMessage(_DOCUMENT_ERROR).catch(TgBot.catchPollingError);
            }
        }
    }

    async onPractice(context: Context) {
        const user = await TgBot.checkUser(context.from.id);

        if (!!user) {
            const doc: ITitledDocumentInfo[] = await TgBot.getAPIResponse("/practicelist", user.territory)
            const buttons = [[]];

            if (!!doc) {
                doc?.map((document, index) => {
                    if (!buttons[index]) {
                        buttons[index] = [];
                    }
                    buttons[index] = [{ text: document.title, url: document.links.views.google_docs }, ...buttons[index]]
                })
                context.editMessageText(`Расписания практики:`,
                    {
                        reply_markup: {
                            inline_keyboard: [...buttons, [{ text: "Вернуться", callback_data: "showMainMenu" }]]
                        }
                    }).catch(TgBot.catchPollingError);
                context.answerCbQuery().catch(TgBot.catchPollingError);
            }
            else {
                context.sendMessage(_DOCUMENT_ERROR).catch(TgBot.catchPollingError);
            }

        }
    }

    async changeProfileTerrritory(context: Context, terr: territories) {
        try {
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

                context.answerCbQuery(`Вам установлен режим для территории ${terr}`, { show_alert: true }).catch(TgBot.catchPollingError);
                //await context.deleteMessage(context.callbackQuery.message.message_id || context.message.message_id).catch(TgBot.catchPollingError);
                await this.showMainMenu(context);
            }
        } catch (error) { }
    }

    async checkStatus(context: Context) {
        const resp: "OK" | string | null = await TgBot.getAPIResponse("/status")
        try {
            context.sendMessage(resp || "MKGTRU-API IS BROKEN")
        } catch (e) { }
    }

    static async getAPIResponse(path: "/changes" | "/status" | "/practicelist" | "/auditories" | "/timetables", territory?: territories): Promise<any> {
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
        const user = await prisma.users.findFirst({
            include: {
                tgAccount: true,
            },
            where: {
                tgAccount: {
                    telegramId: tgId
                }
            }
        })
        return user;
    }

    private showMainMenu(context: Context) {
        TgBot.botObject.telegram.editMessageText(context.callbackQuery.from.id, context.callbackQuery.message.message_id, context.inlineMessageId, "Главное меню", TgBot.mainMenu).catch(TgBot.catchPollingError);
    }

    private deleteOnCallback(context: Context) {
        TgBot.botObject.telegram.deleteMessage(context.callbackQuery.from.id, context.callbackQuery.message.message_id).catch(TgBot.catchPollingError);
    }

    launchBot() {
        TgBot.info.started = true;
        TgBot.botObject.catch(TgBot.catchPollingError);
        TgBot.botObject.launch();
    }






    private async getUsersCount(context: Context) {

        const user = await TgBot.checkUser(context.callbackQuery?.from?.id || context.from.id)

        if (!!user && user.role == "admin") {
            //кол-во на кучине
            const countKuchin = (await prisma.users.aggregate({
                where: {
                    territory: "kuchin"
                },
                _count: {
                    telegramAccountId: true
                }
            }))._count.telegramAccountId

            //кол-во на люблино
            const countLublino = (await prisma.users.aggregate({
                where: {
                    territory: "lublino"
                },
                _count: {
                    telegramAccountId: true
                }
            }))._count.telegramAccountId

            //кол-во в бд
            const countSummary = (await prisma.users.aggregate({
                _count: {
                    name: true
                }
            }))._count.name

            //кол-во без тг
            const countNoTg = (await prisma.users.aggregate({
                where: {
                    telegramAccountId: null
                },
                _count: {
                    name: true
                }
            }))._count.name

            context.sendMessage(`Кучин: ${countKuchin}${_ROW_BREAK}Люблино: ${countLublino}${_ROW_BREAK}Без ТГ: ${countNoTg}${_ROW_BREAK}Всего: ${countSummary}`)
                .catch(TgBot.catchPollingError);
        }

    }

    async getHelpAdminMessage(context: Context) {
        const user = await TgBot.checkUser(context.from.id)
        if (!!user && user.role == "admin") {
            let result = "Команды для администраторов:";
            TgBot.adminCommands.map((commandElement, index) => {
                result += `${_LINE_BREAK}*${index + 1}\\.* \`/${commandElement.command}\` \\- _${commandElement.description}_`
            })
            context.sendMessage(result, { parse_mode: "MarkdownV2" }).catch(TgBot.catchPollingError)
        }
    }

    async sendTextToAll(context: Context) {
        const user = await TgBot.checkUser(context.from.id)
        if (!!user && user?.role == "admin") {
            const command: string = (<any>context.update).message.text;

            console.log(context.update)

            const text = /\/send[aA]ll((.*\n*)*)/gm.exec(command)[1];



            const users = await prisma.telegramAccount.findMany();

            context.sendMessage(`Рассылка займёт ${Math.floor(users.length * 2 / 60)} минут ${users.length * 2 % 60} секунд`).catch(TgBot.catchPollingError);

            try {
                setTimeout(() => {
                    context.sendMessage("Рассылка выполнена").catch(TgBot.catchPollingError);
                }, 2000 * users.length)
            } catch (error) { }

            users.forEach(async (tgUser, index) => {
                setTimeout(() => {
                    TgBot.botObject.telegram.sendMessage(tgUser.telegramId.toString(), replace(text)).catch(TgBot.catchPollingError);
                }, 2000 * index)

                function replace(text: string): string {
                    let newText = text;

                    newText = newText.replace(/\{username\}/gm, tgUser.name)

                    return newText;
                }
            })
            console.log({ text })
        }



    }
}


async function updateProfile(context: Context) {
    const from: any = context.callbackQuery?.from || context.message?.from;

    if (!!from) {
        console.log({ from })
        prisma.telegramAccount.findUnique({
            where: {
                telegramId: from.id
            },
            include: {
                Users: true
            }
        }).then(async user => {
            if (!!user) {
                const identifer = user.Users[0].identifer;
                if (user.name != from.first_name) {
                    await prisma.users.update({
                        where: {
                            identifer,
                        },
                        data: {
                            name: from.first_name,
                            tgAccount: {
                                update: {
                                    name: from.first_name
                                }
                            }
                        }
                    })
                }

                if (user.surname != from.last_name || null) {
                    await prisma.users.update({
                        where: {
                            identifer,
                        },
                        data: {
                            surname: from.last_name || null,
                            tgAccount: {
                                update: {
                                    surname: from.last_name || null
                                }
                            }
                        }
                    })
                }

                if (user.username != from.username || null) {
                    await prisma.users.update({
                        where: {
                            identifer,
                        },
                        data: {
                            tgAccount: {
                                update: {
                                    username: from.username || null
                                }
                            }
                        }
                    })
                }
            }
        })
    }
}

async function isUserInChannel(context: Context):Promise<boolean> {
    const from: any = context.callbackQuery?.from || context.message?.from || context.inlineQuery?.from || null;
    if (!!from) {
        const userTelegramId = from.id;
        const channeluser = await TgBot.botObject.telegram.getChatMember(adminChannelName, userTelegramId);
        if (!!channeluser) {
            return channeluser.status!="left"
        }else{
            return false
        }
    }else{
        return true
    }
}