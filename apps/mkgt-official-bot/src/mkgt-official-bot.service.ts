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

    return TgBot.info
  }
}

