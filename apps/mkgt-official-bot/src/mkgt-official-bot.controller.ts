import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { MkgtOfficialBotService } from './mkgt-official-bot.service';

@Controller()
export class MkgtOfficialBotController {
  constructor(private readonly mkgtOfficialBotService: MkgtOfficialBotService) { 
    this.mkgtOfficialBotService.startBot();
  }

  @Get("/status")
  getBotDialog(@Res() res) {
    console.log("BOT_STARTED")
    res.status(HttpStatus.OK).send("Bot service started");
  }
}
