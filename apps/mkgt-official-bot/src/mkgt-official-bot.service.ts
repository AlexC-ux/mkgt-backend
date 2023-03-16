import { Injectable } from '@nestjs/common';
import { match } from 'assert';
import axios from "axios";
import { Telegraf as TelegramBot } from "telegraf";
import { ITitledDocumentInfo } from 'apps/mkgtru-api/src/types/ITitledDocumentInfo';
import { PrismaClient } from '@prisma/client';
import { territories } from 'apps/mkgtru-api/src/types/territories';
interface IBotCommand { 'command': string, 'description': string };
const schedule = require('node-schedule');


const commands: IBotCommand[] = [
  { 'command': "start", "description": "запуск бота" },
  { 'command': "changes", "description": "получение информации о заменах" },
  { 'command': "status", "description": "получение состояния сервера" },
  { 'command': "practice", "description": "получение расписаний практики" },
  { 'command': "profile", "description": "настройка профиля" },
];

const _LINE_BREAK: string = "\n";
const _ROW_BREAK: string = "\n\n";

const _CHECK_CHANGES_INTERVAL = 2 * 60 * 60 * 1000;

const _DOCUMENT_ERROR = "Не удалось получить документ с сервера";

const prisma = new PrismaClient();


@Injectable()
export class MkgtOfficialBotService {

  static info = {
    started: false,
    changesTimestamp: {
      "kuchin": 0,
      "lublino": 0
    },
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
        const doc: ITitledDocumentInfo | null = await MkgtOfficialBotService.getAPIResponse("/changes", user.territory);
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
    })

    //Получение практики
    this.bot.command("practice", async context => {
      const user = await this.getUser(context.from.id);

      if (!!user) {
        const doc: ITitledDocumentInfo[] = await MkgtOfficialBotService.getAPIResponse("/practicelist", user.territory)
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
    })

    //checking status
    this.bot.command("status", async context => {
      const resp: "OK" | string | null = await MkgtOfficialBotService.getAPIResponse("/status")
      context.sendMessage(resp || "MKGTRU-API IS BROKEN")
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

    if (!MkgtOfficialBotService.info.started) {
      this.bot.launch();
      MkgtOfficialBotService.info.started = true;
    }


    return "started"
  }

  stopBot() {
    this.bot.stop();
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



  changesChecker = schedule.scheduleJob("*/30 * * * *", function () {
    checkUpdateChanges("kuchin");
    checkUpdateChanges("lublino");


    async function checkUpdateChanges(territory: territories) {
      const changesDocInfo: ITitledDocumentInfo = await MkgtOfficialBotService.getAPIResponse("/changes", territory);

      //определение необходимости рассылки
      if (!!changesDocInfo && changesDocInfo.last_modified.timestamp != MkgtOfficialBotService.info.changesTimestamp[territory]) {
        MkgtOfficialBotService.info.changesTimestamp[territory] = changesDocInfo.last_modified.timestamp;

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
      else {
        console.log("changes not updated")
      }
    }
  });


}

