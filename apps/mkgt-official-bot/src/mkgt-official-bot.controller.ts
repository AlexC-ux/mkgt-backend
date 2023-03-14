import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { MkgtOfficialBotService } from './mkgt-official-bot.service';

@Controller()
export class MkgtOfficialBotController {
  constructor(private readonly mkgtOfficialBotService: MkgtOfficialBotService) { }

  @Get("/status")
  getBotDialog(@Res() res) {
    if (!MkgtOfficialBotService.info.started) {
      MkgtOfficialBotService.info.started = true;
      this.mkgtOfficialBotService.startBot();
      console.log("BOT_STARTED")
    }
    res.status(HttpStatus.OK).send("Bot service started");
  }
}
