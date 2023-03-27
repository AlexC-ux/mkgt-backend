import { Context, Scenes } from "telegraf";
import { SceneContext, WizardContext, WizardSessionData } from "telegraf/typings/scenes";
import { SessionContext } from "telegraf/typings/session";
import { TgBot } from "../../telegram-bot";
import { NEVIGATION_SCENE_ID } from "../navigationScene";

export const EDUCATION_WIZARD_SCENE_ID = 'educationspravka_wizard_scene';

interface IEduSpravka extends WizardSessionData {
    name: string,
    mail: string,
    group: string,
    birth: string,
    objective: "Отчисление" | "Перевод"
}

export const educationSpravkaWizardScene = new Scenes.WizardScene<any>(
    EDUCATION_WIZARD_SCENE_ID,
    (ctx: WizardContext & SessionContext<IEduSpravka>) => {
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
    (ctx: WizardContext & SessionContext<IEduSpravka>) => {
        ctx.session.name = (<any>ctx.message)?.text;
        console.log(ctx.session)
        ctx.sendMessage("Напишите Вашу почту. На нее могут написать, если не смогут Вам дозвониться.").catch(TgBot.catchPollingError)
        ctx.wizard.next();
    },
    (ctx: WizardContext & SessionContext<IEduSpravka>) => {
        ctx.session.mail = (<any>ctx.message)?.text;
        console.log(ctx.session)
        ctx.sendMessage("Напишите в какой группе Вы учитесь\\. Например: _МОИС\\-151_ или _МОИП\\-252_\\.", { parse_mode: "MarkdownV2" }).catch(TgBot.catchPollingError)
        ctx.wizard.next();
    },
    (ctx: WizardContext & SessionContext<IEduSpravka>) => {
        ctx.session.group = (<any>ctx.message)?.text;
        console.log(ctx.session)
        ctx.sendMessage("Напишите Вашу дату рождения. Например: 29.09.2004 или 11.01.2002").catch(TgBot.catchPollingError)
        ctx.wizard.next();

    },
    (ctx: WizardContext & SessionContext<IEduSpravka>) => {
        ctx.session.birth = (<any>ctx.message)?.text;
        console.log(ctx.session)
        ctx.sendMessage("Выберите причину получения справки (используя кнопки!).", {
            reply_markup: {
                keyboard: [
                    [{ text: "Отчисление" }],
                    [{ text: "Перевод" }],
                ],
                one_time_keyboard: true,
            }
        }).catch(TgBot.catchPollingError)
        ctx.wizard.next();
    },
    (ctx: WizardContext & SessionContext<IEduSpravka>) => {
        ctx.session.objective = (<any>ctx.message)?.text;
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

educationSpravkaWizardScene.action("back", async (ctx) => {
    ctx.answerCbQuery();
    await ctx.scene.enter(NEVIGATION_SCENE_ID).catch(TgBot.catchPollingError)
})

function buildFormUrl(params: IEduSpravka) {
    return `https://docs.google.com/forms/d/e/1FAIpQLSfEoltNW_5wqW7SZxmHwXW8RURS8aKAB47pNb1ezQuG8cquyA/viewform?entry.1513514743=Да&entry.565348981=Кучин переулок, дом 14, аудитория 1206 (Сектор документообеспечения)&entry.654044256=${params.objective}&entry.1264818593=${params.birth}&entry.1445740066=${params.group}&entry.638547864=${params.name}&entry.824577011=${params.mail}`
}