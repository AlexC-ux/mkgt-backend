import { Injectable } from '@nestjs/common';
import { match } from 'assert';
import axios from "axios";
import { Telegraf as TelegramBot } from "telegraf";
import { ITitledDocumentInfo } from 'apps/mkgtru-api/src/types/ITitledDocumentInfo';
import { PrismaClient } from '@prisma/client';
import { territories } from 'apps/mkgtru-api/src/types/territories';
import { TgBot } from './telegram-bot/telegram-bot';
const schedule = require('node-schedule');

const prisma = new PrismaClient();



@Injectable()
export class MkgtOfficialBotService {
  async startBot() {

    new TgBot(process.env.BOT_TOKEN);

    const changesChecker = schedule.scheduleJob("*/3 * * * *", checkChangesCronJob);


    async function checkChangesCronJob() {
      checkChanges("lublino");
      checkChanges("kuchin");
    }

    async function checkChanges(territory: territories) {
      const changesDocInfo: ITitledDocumentInfo = await TgBot.getAPIResponse("/changes", territory);

      //определение необходимости рассылки
      if (!!changesDocInfo && !!changesDocInfo?.last_modified?.timestamp) {
        if (TgBot.info.changesData[territory] == "") {
          TgBot.info.changesData[territory] = changesDocInfo.links.file_hash
        }
        if (changesDocInfo.links.file_hash != TgBot.info.changesData[territory]) {
          TgBot.info.changesData[territory] = changesDocInfo.links.file_hash;

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
                  territory: territory,
                  role: {
                    not: "user"
                  }
                }
              }
            }
          })

          console.log({ users_to_notif: users?.length, terr: territory })
          users.forEach((user, index) => {
            const tgUserId = user.telegramId.toString();

            setTimeout(() => {
              TgBot.botObject.telegram.sendMessage(tgUserId, `Замены обновлены для территории: ${territory}`, {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: "Показать замены", callback_data: "changes" }]
                  ]
                }
              }).catch(TgBot.catchPollingError);
              console.log(`sending to ${user.telegramId}`)
            }, 5000 * index)


          })
        }
      }
      else {
        console.log("changes not updated")
      }
    }

    return TgBot.info
  }
}

