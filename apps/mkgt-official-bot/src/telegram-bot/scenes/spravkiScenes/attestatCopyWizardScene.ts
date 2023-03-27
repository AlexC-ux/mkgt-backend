import { Context, Scenes } from "telegraf";
import { SceneContext, WizardContext, WizardSessionData } from "telegraf/typings/scenes";
import { SessionContext } from "telegraf/typings/session";
import { TgBot } from "../../telegram-bot";
import { NEVIGATION_SCENE_ID } from "../navigationScene";

export const ATTESTATCOPY_WIZARD_SCENE_ID = 'attestatcopyspravka_wizard_scene';

interface IAttestatCopy extends WizardSessionData {
    name: string,
    mail: string,
    group: string,
    phone: string,
    territory:"Кучин переулок, дом 14, аудитория 1211 (отдел кадров)"|"Люблинская улица, дом 88, у заведующего отделением"
}

export const attestatCopyWizardScene = new Scenes.WizardScene<any>(
    ATTESTATCOPY_WIZARD_SCENE_ID,
    (ctx: WizardContext & SessionContext<IAttestatCopy>) => {
        ctx.answerCbQuery();
        console.log(ctx.session)
        ctx.reply("Для создания справки Вам нужно ответить на несколько вопросов.").catch(TgBot.catchPollingError)
        ctx.reply("Напишите Ваши фамилию, имя, отчество полностью одним сообщением.",
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "Вернуться в меню", callback_data: "back" }
                        ]
                    ]
                }
            }).catch(TgBot.catchPollingError)
        ctx.wizard.next();
    },
    (ctx: WizardContext & SessionContext<IAttestatCopy>) => {
        ctx.session.name = (<any>ctx.message)?.text;
        console.log(ctx.session)
        ctx.sendMessage("Напишите Вашу почту. На нее могут написать, если не смогут Вам дозвониться.").catch(TgBot.catchPollingError)
        ctx.wizard.next();
    },
    (ctx: WizardContext & SessionContext<IAttestatCopy>) => {
        ctx.session.mail = (<any>ctx.message)?.text;
        console.log(ctx.session)
        ctx.sendMessage("Напишите в какой группе Вы учитесь\\. Например: _МОИС\\-151_ или _МОИП\\-252_\\.", { parse_mode: "MarkdownV2" }).catch(TgBot.catchPollingError)
        ctx.wizard.next();
    },
    (ctx: WizardContext & SessionContext<IAttestatCopy>) => {
        ctx.session.group = (<any>ctx.message)?.text;
        console.log(ctx.session)
        ctx.sendMessage("Введите Ваш номер телефона").catch(TgBot.catchPollingError)
        ctx.wizard.next();

    },
    (ctx: WizardContext & SessionContext<IAttestatCopy>) => {
        ctx.session.phone = (<any>ctx.message)?.text;
        console.log(ctx.session)
        ctx.sendMessage("Выберите где хотите получить справку справки (используя кнопки!).", {
            reply_markup: {
                keyboard: [
                    [{ text: "Кучин переулок, дом 14, аудитория 1211 (отдел кадров)" }],
                    [{ text: "Люблинская улица, дом 88, у заведующего отделением" }],
                ],
                one_time_keyboard: true,
            }
        }).catch(TgBot.catchPollingError)
        ctx.wizard.next();
    },
    (ctx: WizardContext & SessionContext<IAttestatCopy>) => {
        ctx.session.territory = (<any>ctx.message)?.text;
        console.log(ctx.session)
        ctx.sendMessage("Чтобы подтвердить, что форму отправляет не робот нужно нажать на кнопку 'Далее' и внизу страницы нажать 'Отправить'", {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "Далее", url: buildFormUrl(ctx.session) }
                    ],
                    [
                        { text: "Показать меню", callback_data: "back" }
                    ]
                ]
            }
        }).catch(TgBot.catchPollingError)
        ctx.wizard.next();
    },
)

attestatCopyWizardScene.action("back", async (ctx) => {
    ctx.answerCbQuery();
    await ctx.scene.enter(NEVIGATION_SCENE_ID).catch(TgBot.catchPollingError)
})

function buildFormUrl(params: IAttestatCopy) {
    return `https://docs.google.com/forms/d/e/1FAIpQLScc6fZzmi1gpOaaaXOnmUvQHxof2ximwbmyiJVYUS2A9RM8hA/viewform?entry.1685332149=да&entry.824021846=${params.mail}&entry.1444559825=${params.name}&entry.139248388=${params.group}&entry.1352819811=${params.phone}&entry.1869217985=${params.territory}`
}