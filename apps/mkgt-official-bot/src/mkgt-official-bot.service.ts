import { Injectable } from '@nestjs/common';
import { match } from 'assert';
import axios from "axios";
import { Telegraf as TelegramBot } from "telegraf";
import { message } from "telegraf/filters";
import { ITitledDocumentInfo } from 'apps/mkgtru-api/src/types/ITitledDocumentInfo';
interface IBotCommand { 'command': string, 'description': string };

const commands: IBotCommand[] = [
  { 'command': "start", "description": "запуск бота" },
  { 'command': "changes", "description": "получение информации о заменах" },
  { 'command': "status", "description": "получение состояния сервера" },
];

const _LINE_BREAK: string = "\n"
export class MkgtOfficialBotService {

  private bot = new TelegramBot(process.env.BOT_TOKEN);

  async botMessage() {

    await this.bot.telegram.setMyCommands(commands);

    //Обработка команд
    this.bot.command("changes", async context => {
      const doc: ITitledDocumentInfo = (await this.getAPIResponse("/changes")).data
      const min = doc.last_modified.difference;
      context.sendMessage(`Документ обновлён: ${doc.last_modified.ru}${_LINE_BREAK}${ min/ 1000 / 60} минут назад`)
    })

    this.bot.command("status", async context => {
      const doc: "OK" | string = (await this.getAPIResponse("/status")).data
      console.log(doc)
      context.sendMessage(doc)
    })

    this.bot.launch();
    return "started"
  }

  stopBot() {
    this.bot.stop();
  }

  async getAPIResponse(path: "/changes" | "/status") {

    console.log(`${process.env.MKGT_API_PATH}${path}`)
    console.log(process.env.ACCESS_TOKEN)
    return await axios.get(`${process.env.MKGT_API_PATH}${path}`, { headers: { "authorization": `Bearer ${process.env.ACCESS_TOKEN }`} });
  }
}

