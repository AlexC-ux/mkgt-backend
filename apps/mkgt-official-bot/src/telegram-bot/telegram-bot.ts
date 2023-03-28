import { Context, session, Telegraf } from "telegraf";
import { ITitledDocumentInfo } from 'apps/mkgtru-api/src/types/ITitledDocumentInfo';
import { acccess_roles, PrismaClient, Users } from '@prisma/client';
import { territories } from 'apps/mkgtru-api/src/types/territories';
import axios from "axios";
import { botStage } from "./scenes/stage";
import { SceneContext } from "telegraf/typings/scenes";
import { navigationScene, NEVIGATION_SCENE_ID as NAVIGATION_SCENE_ID } from "./scenes/navigationScene";

const prisma = new PrismaClient();

export interface IBotCommand { 'command': string, 'description': string };

export class TgBot {

    public static botObject: Telegraf;

    constructor(botToken: string) {
        try {
            TgBot.botObject = new Telegraf<SceneContext>(botToken);
            this.setupCommands();
            this.launchBot();
        } catch (error) {
            console.error(error)
        }
    }

    static info = {
        started: false,
        changesData: {
            "kuchin": "",
            "lublino": ""
        },
    }

    static async catchPollingError(error: any, context?: Context) {
        if (
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
                    TgBot.botObject.telegram.sendMessage(admin.tgAccount.telegramId.toString(), `*ERROR LOG* \`\`\`\n${error?.toString() || JSON.stringify(error)}\n\`\`\``, { parse_mode: "MarkdownV2" }).catch(TgBot.catchPollingError);
                });
                try {
                    context.answerCbQuery();
                } catch (error) { }
            })
        }
    };

    static commands: IBotCommand[] = [
        { 'command': "start", "description": "показать главное меню" },
        { 'command': "help", "description": "показать команды" },
        { 'command': "status", "description": "получение состояния сервера" },
    ];

    static adminCommands: IBotCommand[] = [
        { 'command': "users", "description": "статистика по пользователям" },
        { 'command': "sendAll", "description": "Отправка всем текстового сообщения" },
    ];

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

        TgBot.botObject.use(navigationScene)//async (ctx:any) => await ctx.scene.enter(NAVIGATION_SCENE_ID))
    }

    async launchBot() {
        TgBot.botObject.use(session())
        TgBot.botObject.use(botStage.middleware())
        TgBot.info.started = true;
        TgBot.botObject.catch(TgBot.catchPollingError);
        TgBot.botObject.launch().catch((err) => { console.log(err) });
    }

    static async getAPIResponse(path: "/changes" | "/status" | "/practicelist" | "/auditories" | "/timetables" | '/callstable' | "/news", territory?: territories): Promise<any> {
        const url = `${process.env.MKGT_API_PATH}${path}?territory=${!!territory ? territory : "lublino"}`;
        try {
            const response = (await axios.get(url, { headers: { "authorization": `Bearer ${process.env.ACCESS_TOKEN}` }, timeout: 30000 }));
            console.log({ 'req_to_api': url, status: response.statusText })
            return response.data;
        } catch (error) {
            return null;
        }
    }



}


