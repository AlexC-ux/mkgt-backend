import { PrismaClient, territories, Users } from "@prisma/client";
import { ITitledDocumentInfo } from "apps/mkgtru-api/src/types/ITitledDocumentInfo";
import { Context } from "telegraf";
import { Scenes } from "telegraf";
import { TgBot } from "../telegram-bot";
import { AKADEMICALSPRAVKA_WIZARD_SCENE_ID } from "./spravkiScenes/akademicalSpravkaWizardScene";
import { ATTESTATCOPY_WIZARD_SCENE_ID } from "./spravkiScenes/attestatCopyWizardScene";
import { EDUCATION_WIZARD_SCENE_ID } from "./spravkiScenes/educationPeriodSpravkaScene";
import { VOENKOMAT_WIZARD_SCENE_ID } from "./spravkiScenes/voenkomatSpravkaScene";

const prisma = new PrismaClient();

var cuid = require('cuid');

const _LINE_BREAK: string = "\n";
const _ROW_BREAK: string = "\n\n";

const _DOCUMENT_ERROR = "Не удалось получить документ с сервера";

const adminChannelName = "@alexcux_dev"

export const NEVIGATION_SCENE_ID = 'main_navigation_scene';

export const navigationScene = new Scenes.BaseScene<any>(NEVIGATION_SCENE_ID);

let accessStartPayload = {
    code: cuid(),
    time: Date.now(),
    interval:60000
};

setInterval(() => {
    accessStartPayload.time = Date.now();
    accessStartPayload.code = cuid();
}, accessStartPayload.interval)

navigationScene.use(botMiddleware)

//start message - registration
navigationScene.start(onStart)
navigationScene.enter(showMainMenu)

//set /help answer
navigationScene.help(getHelpMessage)

//checking status
navigationScene.command("status", checkStatus)

//getting invite link
navigationScene.command("link", getLink)

//set lublino callback
navigationScene.action("ifromlublino", (context) => { changeProfileTerrritory(context, "lublino") })

//set kuchin callback
navigationScene.action("ifromkuchin", (context) => { changeProfileTerrritory(context, "kuchin") })

//getting api key
navigationScene.action("getApiKey", getApiKey);

//getting info for devs
navigationScene.action("developerinfo", getDevInfo);

//getting profile info
navigationScene.action("profile", onProfile);

//getting calls table
navigationScene.action("callstable", getCallsTable)

//getting practise list
navigationScene.action("practice", onPractice);

//getting changes
navigationScene.action("changes", onChanges);

//getting news
navigationScene.action("news", getNews);

navigationScene.action("spravki", getSpravki)

//getting server status
navigationScene.action("status", checkStatus);

//cb for hide msg
navigationScene.action("showMainMenu", showMainMenu);

//cb for delete msg
navigationScene.action("deleteCb", deleteOnCallback);

//getting timetables
navigationScene.action("timetables", getTimetables);

//getting cabinets updates
navigationScene.action("cabinets", getCabinets);

//getting admin commands
navigationScene.command("admin", getHelpAdminMessage);

//getting users stistic
navigationScene.command("users", getUsersCount);

//sending message to all
navigationScene.command("sendAll", sendTextToAll)


//wizard scenes
navigationScene.action("voenkomatWizardScene", async (ctx) => await ctx.scene.enter(VOENKOMAT_WIZARD_SCENE_ID))
navigationScene.action("eduspravkaWizardScene", async (ctx) => await ctx.scene.enter(EDUCATION_WIZARD_SCENE_ID))
navigationScene.action("attestatcopyWizardScene", async (ctx) => await ctx.scene.enter(ATTESTATCOPY_WIZARD_SCENE_ID))
navigationScene.action("akademicalspravkaWizardScene", async (ctx) => await ctx.scene.enter(AKADEMICALSPRAVKA_WIZARD_SCENE_ID))


const mainMenu = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: `Показать замены`, callback_data: "changes" },
                { text: `Расписание практики`, callback_data: "practice" }
            ],
            [
                { text: "Новости", callback_data: "news" },
                { text: "Заказ справки", callback_data: "spravki" }
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

async function getLink(context: Context) {
    const user = await checkUser(context.from.id)
    if (!!user && user.role != "user") {
        const botInfo = await TgBot.botObject.telegram.getMe();
        context.reply(`https://t.me/${botInfo.username}?start=${accessStartPayload.code}\n\nСсылка действует еще ${(accessStartPayload.interval-(Date.now() - accessStartPayload.time)) / 1000} секунд после чего обновится!`)
    }
}

async function getSpravki(ctx: Context) {
    const user = await checkUser(ctx.callbackQuery.from.id || ctx.message.from.id)
    if (!!user && user.role != "user") {
        TgBot.botObject.telegram.editMessageText(ctx.callbackQuery.from.id, ctx.callbackQuery.message.message_id, ctx.inlineMessageId, "Какая справка Вам нужна?", {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "Справка в военкомат", callback_data: "voenkomatWizardScene" }
                    ],
                    [
                        { text: "Справка о периоде обучения", callback_data: "eduspravkaWizardScene" }
                    ],
                    [
                        { text: "Копия аттестата", callback_data: "attestatcopyWizardScene" }
                    ],
                    [
                        { text: "Академическая справка", callback_data: "akademicalspravkaWizardScene" }
                    ],
                    [
                        { text: "Вернуться", callback_data: "showMainMenu" }
                    ]
                ]
            }
        }).catch(TgBot.catchPollingError)
        ctx.answerCbQuery().catch(TgBot.catchPollingError)
    }
}

async function onStart(context: Context & { startPayload?: string }) {
    const sender = context.from;
    let user = await checkUser(sender.id);
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
            }).then(newUser => {
                user = newUser;
            })
        } catch (error) {
            console.log({ error, context })
        }
    }

    if (context.startPayload == accessStartPayload.code) {
        if (user.role == "user") {
            await prisma.users.update({
                where: {
                    identifer: user.identifer
                },
                data: {
                    role: "priv1"
                }
            })
        }
        user.role = "priv1"
    }

    if (user.role != "user") {
        await context.sendMessage("🦉").catch(TgBot.catchPollingError)
        context.sendMessage(`${sender.first_name}, добро пожаловать!` +
            _ROW_BREAK +
            `По умолчанию режим работы для студентов с Кучина пер. Если Вы учитесь в Люблино, то воспользуйтесь кнопкой 'Настройки профиля' ниже` +
            _ROW_BREAK +
            `/help покажет список доступных команд`+
            _ROW_BREAK+
            "/link покажет ссылку для приглашения друга",
            mainMenu
        ).catch(TgBot.catchPollingError);
    }
}

async function getCallsTable(context: Context) {
    const callstableInfo: ITitledDocumentInfo = await TgBot.getAPIResponse("/callstable");
    if (callstableInfo && callstableInfo?.last_modified?.ru) {
        context.editMessageText(`Расписание звонков от ${callstableInfo.last_modified.ru}`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Просмотреть", url: callstableInfo.links.views.server_viewer }],
                    [{ text: "Скачать", url: callstableInfo.links.file }],
                    [{ text: "Вернуться", callback_data: "showMainMenu" }]
                ]
            }
        }).catch(TgBot.catchPollingError);
        context.answerCbQuery().catch(TgBot.catchPollingError);
    }
}

async function getHelpMessage(context: Context) {
    const user = await checkUser(context.from.id)
    if (user.role != "user") {
        let result = "Команды бота:";
        TgBot.commands.map((commandElement, index) => {
            result += `${_LINE_BREAK}*${index + 1}\\.* \`/${commandElement.command}\` \\- _${commandElement.description}_`
        })
        context.sendMessage(result, { parse_mode: "MarkdownV2" }).catch(TgBot.catchPollingError)
    }
}

async function botMiddleware(context: Context, next: () => Promise<any>,) {
    const ignoreCheckCommands = ["/start", "/status", "admin", "users", "sendAll"]
    updateProfile(context);
    const sended: any = context.update;
    const incomingMessage = sended?.message?.text || sended?.callback_query?.data
    console.log(`Collected message ${incomingMessage}`)
    if (await isUserInChannel(context)
        ||
        ignoreCheckCommands.includes(incomingMessage)
    ) {
        await next();
    } else {
        context.sendMessage(`Бот совершенно бесплатен для пользователей, но в знак поддержки мы просим только подписку на канал разработчика: ${adminChannelName}`)
    }
}


async function getCabinets(context: Context) {
    const user = await checkUser(context.callbackQuery.from.id || context.message.from.id)

    if (!!user && user.role != "user") {
        const doc: ITitledDocumentInfo | null = await TgBot.getAPIResponse("/auditories", user.territory)

        if (!!doc) {
            context.editMessageText(`Распределение аудиторий от ${doc.last_modified.ru}`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "Скачать", url: doc?.links.file },
                                { text: "Просмотреть", url: doc?.links.views.server_viewer },
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

async function getNews(context: Context) {
    const user = await checkUser(context.callbackQuery.from.id || context.message.from.id)

    if (!!user && user.role != "user") {
        const newsLinks: ITitledDocumentInfo[] = await TgBot.getAPIResponse("/news");
        const buttons = [[]];
        if (!!newsLinks) {
            newsLinks?.map((document, index) => {
                if (!buttons[index]) {
                    buttons[index] = [];
                }
                buttons[index] = [...buttons[index], { text: document.title, url: `http://paytoplay.space:8080/mkgtru-api/material?location=${document.links.file.replace("https://mkgt.ru/index.php/component/content/article/", "")}` }]
            })
            context.editMessageText(`Последние новости:`,
                {
                    reply_markup: {
                        inline_keyboard: [...buttons, [{ text: "Вернуться", callback_data: "showMainMenu" }]]
                    }
                }).catch(TgBot.catchPollingError);
            context.answerCbQuery().catch(TgBot.catchPollingError);
        } else {
            context.sendMessage(_DOCUMENT_ERROR).catch(TgBot.catchPollingError);
        }
    }
}

async function getTimetables(context: Context) {
    const user = await checkUser(context.callbackQuery.from.id || context.message.from.id)

    if (!!user && user.role != "user") {
        const doc: ITitledDocumentInfo[] = await TgBot.getAPIResponse("/timetables", user.territory)
        const buttons = [[]];

        if (!!doc) {
            doc?.map((document, index) => {
                if (!buttons[index]) {
                    buttons[index] = [];
                }
                buttons[index] = [...buttons[index], { text: document.title, url: document.links.views.server_viewer }]
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

async function onProfile(context: Context) {
    const user = await checkUser(context.from.id);

    if (!!user && user.role != "user") {
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

async function getDevInfo(context: Context) {
    const user = await checkUser(context.from.id || context.callbackQuery.from.id)
    if (user.role != "user") {
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
}

async function getApiKey(context: Context) {
    const user = await checkUser(context.callbackQuery.from.id || context.from.id)
    if (!!user && user.role != "user") {
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

async function onChanges(context: Context) {
    const user = await checkUser(context.from.id);

    if (!!user && user.role != "user") {
        const doc: ITitledDocumentInfo | null = await TgBot.getAPIResponse("/changes", user.territory);
        if (!!doc) {
            context.editMessageText(`Замены от ${doc?.last_modified.ru}`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "Скачать", url: doc?.links.file },
                                { text: "Просмотреть", url: doc?.links.views.server_viewer },
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

async function onPractice(context: Context) {
    const user = await checkUser(context.from.id);

    if (!!user && user.role != "user") {
        const doc: ITitledDocumentInfo[] = await TgBot.getAPIResponse("/practicelist", user.territory)
        const buttons = [[]];

        if (!!doc) {
            doc?.map((document, index) => {
                if (!buttons[index]) {
                    buttons[index] = [];
                }
                buttons[index] = [...buttons[index], { text: document.title, url: document.links.views.server_viewer }]

            })
            console.log(JSON.stringify([...buttons, [{ text: "Вернуться", callback_data: "showMainMenu" }]]))
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

async function changeProfileTerrritory(context: Context, terr: territories) {
    try {
        const user = await checkUser(context?.from.id);

        if (!!user && user.role != "user") {
            await prisma.users.update({
                where: {
                    identifer: user.identifer
                },
                data: {
                    territory: terr
                }
            })

            context.answerCbQuery(`Вам установлен режим для территории ${terr}`, { show_alert: true }).catch(TgBot.catchPollingError);
            //await context.deleteMessage(context.callbackQuery.message.message_id || context.message.message_id).catch(catchPollingError);
            await showMainMenu(context);
        }
    } catch (error) { }
}

async function checkStatus(context: Context) {
    const user = await checkUser(context.from.id)
    if (user.role != "user") {
        const resp: "OK" | string | null = await TgBot.getAPIResponse("/status")
        try {
            context.sendMessage(resp || "MKGTRU-API IS BROKEN")
        } catch (e) { }
    }
}

async function checkUser(tgId: number): Promise<Users> {
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

function showMainMenu(context: Context) {
    TgBot.botObject.telegram.editMessageText(context.callbackQuery.from.id, context.callbackQuery.message.message_id, context.inlineMessageId, "Главное меню", mainMenu).catch(TgBot.catchPollingError);
}

function deleteOnCallback(context: Context) {
    TgBot.botObject.telegram.deleteMessage(context.callbackQuery.from.id, context.callbackQuery.message.message_id).catch(TgBot.catchPollingError);
}






async function getUsersCount(context: Context) {

    const user = await checkUser(context.callbackQuery?.from?.id || context.from.id)

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

async function getHelpAdminMessage(context: Context) {
    const user = await checkUser(context.from.id)
    if (!!user && user.role == "admin") {
        let result = "Команды для администраторов:";
        TgBot.adminCommands.map((commandElement, index) => {
            result += `${_LINE_BREAK}*${index + 1}\\.* \`/${commandElement.command}\` \\- _${commandElement.description}_`
        })
        context.sendMessage(result, { parse_mode: "MarkdownV2" }).catch(TgBot.catchPollingError)
    }
}

async function sendTextToAll(context: Context) {
    const user = await checkUser(context.from.id)
    if (!!user && user?.role == "admin") {
        const command: string = (<any>context.update).message.text;

        console.log(context.update)

        const text = /\/send[aA]ll((.*\n*)*)/gm.exec(command)[1];


        const secondsInterval = 4;

        const users = await prisma.telegramAccount.findMany();

        context.sendMessage(`Рассылка займёт ${Math.floor(users.length * secondsInterval / 60)} минут ${users.length * secondsInterval % 60} секунд`).catch(TgBot.catchPollingError);

        try {
            setTimeout(() => {
                context.sendMessage("Рассылка выполнена").catch(TgBot.catchPollingError);
            }, secondsInterval * 1000 * users.length)
        } catch (error) { }

        users.forEach(async (tgUser, index) => {
            setTimeout(() => {
                TgBot.botObject.telegram.sendMessage(tgUser.telegramId.toString(), replace(text)).catch(TgBot.catchPollingError);
            }, secondsInterval * 1000 * index)

            function replace(text: string): string {
                let newText = text;

                newText = newText.replace(/\{username\}/gm, tgUser.name)

                return newText;
            }
        })
        console.log({ text })
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

async function isUserInChannel(context: Context): Promise<boolean> {
    const from: any = context.callbackQuery?.from || context.message?.from || context.inlineQuery?.from || null;
    if (!!from) {
        const userTelegramId = from.id;
        const channeluser = await TgBot.botObject.telegram.getChatMember(adminChannelName, userTelegramId);
        if (!!channeluser) {
            return channeluser.status != "left"
        } else {
            return false
        }
    } else {
        return true
    }
}