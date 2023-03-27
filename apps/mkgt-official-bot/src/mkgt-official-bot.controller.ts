import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { MkgtOfficialBotService } from './mkgt-official-bot.service';
import { TgBot } from './telegram-bot/telegram-bot';

@Controller()
export class MkgtOfficialBotController {
  constructor(private readonly mkgtOfficialBotService: MkgtOfficialBotService) {
    mkgtOfficialBotService.startBot();
   }

  @Get("/status")
  getBotDialog(@Res() res) {
    res.status(HttpStatus.OK).send("Bot service started");
  }
}
