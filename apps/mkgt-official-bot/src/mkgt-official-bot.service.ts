import { Injectable } from '@nestjs/common';
import { match } from 'assert';
import axios from "axios";
import { Telegraf as TelegramBot } from "telegraf";
import { ITitledDocumentInfo } from 'apps/mkgtru-api/src/types/ITitledDocumentInfo';
import { PrismaClient } from '@prisma/client';
import { territories } from 'apps/mkgtru-api/src/types/territories';
import { setInterval } from 'timers';
interface IBotCommand { 'command': string, 'description': string };

const commands: IBotCommand[] = [
  { 'command': "start", "description": "запуск бота" },
  { 'command': "changes", "description": "получение информации о заменах" },
  { 'command': "status", "description": "получение состояния сервера" },
  { 'command': "practice", "description": "получение состояния сервера" },
  { 'command': "profile", "description": "настройка профиля" },
];

const _LINE_BREAK: string = "\n";
const _ROW_BREAK: string = "\n\n";

const _CHECK_CHANGES_INTERVAL = 2*60*60*1000;

const prisma = new PrismaClient();

const info = {
  started: false
}

@Injectable()
export class MkgtOfficialBotService {

  constructor(){
    this.startBot();
  }

  private bot = new TelegramBot(process.env.BOT_TOKEN);

  async startBot() {
    await this.bot.telegram.setMyCommands(commands);

    //start message - registration
    this.bot.start(async (context) => {
      const sender = context.from;
      const user = await this.getUser(sender.id);
      console.log({ user });
      if (user == null) {
        try {
          const tg = await prisma.telegramAccount.create({
            data: {
              name: sender.first_name,
              surname: `${sender.last_name}`,
              telegramId: sender.id,
              username: `${sender.username}`
            }
          })
          await prisma.users.create({
            data: {
              name: sender.first_name,
              surname: `${sender.last_name}`,
              email: "none",
              telegramAccountId: tg.id
            }
          });
        } catch (error) {
          console.log(typeof error)
          console.log({ error })
        }

      }
      context.sendMessage(`${sender.first_name}, добро пожаловать!${_ROW_BREAK}Если Вы с люблино, то воспользуйтесь командой /profile`)

    })

    //настройка профиля
    this.bot.command("profile", async context => {
      const user = await this.getUser(context.from.id);

      if (!!user) {

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
    })

    //set lublino mode
    this.bot.command("ifromlublino", async context => {
      const user = await this.getUser(context.from.id);

      if (!!user) {
        await prisma.users.update({
          where: {
            identifer: user.identifer
          },
          data: {
            territory: "lublino"
          }
        })

        context.reply("Вам установлен режи работы бота для Люблино.")
      }
    })

    //Обработка команды замены
    this.bot.command("changes", async context => {
      const user = await this.getUser(context.from.id);

      if (!!user) {
        const doc: ITitledDocumentInfo | null = await this.getAPIResponse("/changes", user.territory);
        console.log({ doc })
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
      }
    })

    //Получение практики
    this.bot.command("practice", async context => {
      const user = await this.getUser(context.from.id);

      if (!!user) {
        const doc: ITitledDocumentInfo[] = await this.getAPIResponse("/practicelist", user.territory)
        const buttons = [[]];
        doc.map((document, index) => {
          if (!buttons[index]) {
            buttons[index] = [];
          }
          buttons[index] = [...buttons[index], { text: document.title, url: document.links.views.google_docs }]
        })

        context.sendMessage(`Расписания практики`,
          {
            reply_markup: {
              inline_keyboard: buttons
            }
          })
      }
    })

    //checking status
    this.bot.command("status", async context => {
      const resp: "OK" | string = await this.getAPIResponse("/status")
      context.sendMessage(resp)
    })

    //null cb query
    this.bot.action("null", (context) => {
      context.answerCbQuery("")
    })

    //set lublino callback
    this.bot.action("ifromlublino", async (context) => {
      const user = await this.getUser(context?.from.id);

      if (!!user) {
        await prisma.users.update({
          where: {
            identifer: user.identifer
          },
          data: {
            territory: "lublino"
          }
        })

        try {
          context.answerCbQuery("Вам установлен режим для территории Люблино", { show_alert: true });
        } catch (error) { }
      }
    })

    //set kuchin callback
    this.bot.action("ifromkuchin", async (context) => {
      const user = await this.getUser(context?.from.id);

      if (!!user) {
        await prisma.users.update({
          where: {
            identifer: user.identifer
          },
          data: {
            territory: "kuchin"
          }
        })
        try {
          context.answerCbQuery("Вам установлен режим для территории Кучин", { show_alert: true });
        } catch (error) { }
      }
    })

    if (!info.started) {
      info.started = true
      this.bot.launch();
      setInterval(() => { this.checkUpdateChanges("kuchin") }, _CHECK_CHANGES_INTERVAL)
      setInterval(() => { this.checkUpdateChanges("lublino") }, _CHECK_CHANGES_INTERVAL)
      console.log("BOT_STARTED")
    }

    return "started"
  }

  stopBot() {
    this.bot.stop();
  }

  async getAPIResponse(path: "/changes" | "/status" | "/practicelist", territory?: territories): Promise<any> {
    const url = `${process.env.MKGT_API_PATH}${path}?territory=${!!territory ? territory : "lublino"}`;
    console.log({'req_to_api':url})
    try {
      return (await axios.get(url, { headers: { "authorization": `Bearer ${process.env.ACCESS_TOKEN}` } })).data;
    } catch (error) {
      return null;
    }
  }

  async getUser(tgId: number) {
    const user = await prisma.users.findFirst({
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

  async checkUpdateChanges(territory: territories) {
    const changesDocInfo: ITitledDocumentInfo = await this.getAPIResponse("/changes", territory);
    if (changesDocInfo.last_modified.difference <= _CHECK_CHANGES_INTERVAL) {
      const users = await prisma.users.findMany({
        include: {
          tgAccount: true,
        },
        where: {
          territory: territory
        }
      })

      users.forEach(user => {
        const tgUserId = user.tgAccount.id;

        try {
          this.bot.telegram.sendMessage(tgUserId, `Замены обновлены для территории: ${territory}`)
        } catch (error) { }

      })

    }
    else{
      console.log("changes not updated")
    }
  }
}

