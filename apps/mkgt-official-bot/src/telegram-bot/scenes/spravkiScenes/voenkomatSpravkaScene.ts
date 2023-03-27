import { Context, Scenes } from "telegraf";
import { SceneContext, WizardContext, WizardSessionData } from "telegraf/typings/scenes";
import { SessionContext } from "telegraf/typings/session";
import { TgBot } from "../../telegram-bot";
import { NEVIGATION_SCENE_ID } from "../navigationScene";

export const VOENKOMAT_WIZARD_SCENE_ID = 'voenkomatspravka_wizard_scene';

interface IVoenkomatSpravka extends WizardSessionData {
    name: string,
    mail: string,
    voenkomat: string,
    group: string,
    phone: string,
}

export const voenkomatSpravkaWizardScene = new Scenes.WizardScene<any>(
    VOENKOMAT_WIZARD_SCENE_ID,
    (ctx: WizardContext & SessionContext<IVoenkomatSpravka>) => {
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
    (ctx: WizardContext & SessionContext<IVoenkomatSpravka>) => {
        ctx.session.name = (<any>ctx.message)?.text;
        console.log(ctx.session)
        ctx.sendMessage("Напишите Ваш номер телефона. По нему с Вами свяжутся в случае необходимости.").catch(TgBot.catchPollingError)
        ctx.wizard.next();
    },
    (ctx: WizardContext & SessionContext<IVoenkomatSpravka>) => {
        ctx.session.phone = (<any>ctx.message)?.text;
        console.log(ctx.session)
        ctx.sendMessage("Напишите Вашу почту. На нее могут написать, если не смогут Вам дозвониться.").catch(TgBot.catchPollingError)
        ctx.wizard.next();
    },
    (ctx: WizardContext & SessionContext<IVoenkomatSpravka>) => {
        ctx.session.mail = (<any>ctx.message)?.text;
        console.log(ctx.session)
        ctx.sendMessage("Напишите в какой группе Вы учитесь\\. Например: _МОИС\\-151_ или _МОИП\\-252_\\.", { parse_mode: "MarkdownV2" }).catch(TgBot.catchPollingError)
        ctx.wizard.next();
    },
    (ctx: WizardContext & SessionContext<IVoenkomatSpravka>) => {
        ctx.session.group = (<any>ctx.message)?.text;
        console.log(ctx.session)
        ctx.sendMessage("Напишите полное название Вашего военкомата. Это важно для правильного оформления справки.").catch(TgBot.catchPollingError)
        ctx.wizard.next();

    },
    (ctx: WizardContext & SessionContext<IVoenkomatSpravka>) => {
        ctx.session.name = (<any>ctx.message)?.text;
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

voenkomatSpravkaWizardScene.action("back", async (ctx) => {
    ctx.answerCbQuery();
    await ctx.scene.enter(NEVIGATION_SCENE_ID).catch(TgBot.catchPollingError)
})

function buildFormUrl(params: IVoenkomatSpravka) {
    return `https://docs.google.com/forms/d/e/1FAIpQLSf4QAnjMYFlwWn8Jz570ef_M2Ubnf3Rvn-DTluzIXS_voLLJw/viewform?entry.1119518583=${params.mail}&entry.672462573=${params.name}&entry.996828097=${params.voenkomat}&entry.1157515172=${params.group}&entry.2144188251=${params.phone}&entry.796726567=Да`
}