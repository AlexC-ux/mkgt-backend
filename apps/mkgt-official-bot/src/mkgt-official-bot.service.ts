import { Injectable } from '@nestjs/common';
import { match } from 'assert';
import axios from "axios";
import { Telegraf as TelegramBot } from "telegraf";
import { ITitledDocumentInfo } from 'apps/mkgtru-api/src/types/ITitledDocumentInfo';
import { PrismaClient } from '@prisma/client';
import { territories } from 'apps/mkgtru-api/src/types/territories';
import { TgBot } from './telegram-bot/telegram-bot';
const schedule = require('node-schedule');




const _CHECK_CHANGES_INTERVAL = 2 * 60 * 60 * 1000;



const prisma = new PrismaClient();



@Injectable()
export class MkgtOfficialBotService {
  async startBot() {

    const bot: TgBot = new TgBot(process.env.BOT_TOKEN);

    if (!TgBot.info.started) {
      bot.launchBot();
    } else {
      console.log("BOT_ALREADY_STARTED")
    }


    const changesChecker = schedule.scheduleJob("*/25 * * * *", checkChangesCronJob);

    async function checkChangesCronJob() {
      this.checkChanges("lublino");
      this.checkChanges("kuchin");
    }

    async function checkChanges(territory: territories) {
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
            bot.botObject.telegram.sendMessage(tgUserId, `Замены обновлены для территории: ${territory}`)
          } catch (error) { console.log(error) }

        })

      }
      else {
        console.log("changes not updated")
      }
    }

    return TgBot.info
  }
}

