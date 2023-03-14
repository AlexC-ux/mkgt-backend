import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { MkgtOfficialBotService } from './mkgt-official-bot.service';

@Controller()
export class MkgtOfficialBotController {
  constructor(private readonly mkgtOfficialBotService: MkgtOfficialBotService) {
    this.mkgtOfficialBotService.startBot();
    console.log("BOT_STARTED")
  }

  @Get("/status")
  getBotDialog(@Res() res) {
    res.status(HttpStatus.OK).send("Bot service started");
  }
}
