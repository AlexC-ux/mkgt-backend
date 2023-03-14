import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MkgtOfficialBotController } from './mkgt-official-bot.controller';
import { MkgtOfficialBotService } from './mkgt-official-bot.service';

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: "./apps/mkgt-official-bot/.env" }),],
  controllers: [MkgtOfficialBotController],
  providers: [MkgtOfficialBotService],
})
export class MkgtOfficialBotModule {}
