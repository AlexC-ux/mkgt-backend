import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { MkgtOfficialBotService } from './mkgt-official-bot.service';

@Controller("/blyat-ya-tak-ustal-napishi-mne-v-tg-alexc_ux")
export class MkgtOfficialBotController {
  constructor(private readonly mkgtOfficialBotService: MkgtOfficialBotService) { }

  @Get("/status")
  getBotDialog(@Res() res) {
    res.status(HttpStatus.OK).send("Bot service started");
  }

  @Get("/stop")
  stopBot(){
    this.mkgtOfficialBotService.stopBot();
  }
}
