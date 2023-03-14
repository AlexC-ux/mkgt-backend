import { Injectable } from '@nestjs/common';
import { match } from 'assert';
import axios from "axios";
import { Telegraf as TelegramBot } from "telegraf";
import { ITitledDocumentInfo } from 'apps/mkgtru-api/src/types/ITitledDocumentInfo';
interface IBotCommand { 'command': string, 'description': string };

const commands: IBotCommand[] = [
  { 'command': "start", "description": "запуск бота" },
  { 'command': "changes", "description": "получение информации о заменах" },
  { 'command': "status", "description": "получение состояния сервера" },
  { 'command': "practice", "description": "получение состояния сервера" },
];

const _LINE_BREAK: string = "\n"
@Injectable()
export class MkgtOfficialBotService {

  private bot = new TelegramBot(process.env.BOT_TOKEN);

  async botMessage() {

    await this.bot.telegram.setMyCommands(commands);

    //Обработка команд
    this.bot.command("changes", async context => {
      const doc: ITitledDocumentInfo | null = await this.getAPIResponse("/changes")
      const min = Math.floor(doc?.last_modified.difference / 1000 / 60);
      context.sendMessage(`Документ обновлён: ${doc?.last_modified.ru}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: `Обновлено ${min} минут назад`, callback_data: "null" }
              ],
              [
                { text: "Скачать", url: doc.links.file },
                { text: "Просмотреть", url: doc.links.views.google_docs },
              ]
            ]
          }
        })
    })

    this.bot.command("practice", async context => {
      const doc: ITitledDocumentInfo[] = await this.getAPIResponse("/practicelist")
      const buttons = [[]];
      doc.map((document, index) => { 
        if (!buttons[index]) {
          buttons[index] = [];
        }
        buttons[index]= [...buttons[index],{ text: document.title, url:document.links.views.google_docs }]
       })
       
      context.sendMessage(`Расписания практики`,
        {
          reply_markup: {
            inline_keyboard: buttons
          }
        })
    })

    //checking status
    this.bot.command("status", async context => {
      const doc: "OK" | string = await this.getAPIResponse("/status")
      console.log(doc)
      context.sendMessage(doc)
    })

    //null cb query
    this.bot.action("null", (context) => {
      context.answerCbQuery("")
    })

    this.bot.launch();
    return "started"
  }

  stopBot() {
    this.bot.stop();
  }

  async getAPIResponse(path: "/changes" | "/status" | "/practicelist"): Promise<any> {

    console.log(`${process.env.MKGT_API_PATH}${path}`)
    console.log(process.env.ACCESS_TOKEN)
    try {
      return (await axios.get(`${process.env.MKGT_API_PATH}${path}`, { headers: { "authorization": `Bearer ${process.env.ACCESS_TOKEN}` } })).data;
    } catch (error) {
      return null;
    }
  }
}

