import { NestFactory } from '@nestjs/core';
import { MkgtOfficialBotModule } from './mkgt-official-bot.module';

async function bootstrap() {
  const app = await NestFactory.create(MkgtOfficialBotModule);
  await app.listen(6367);
}
bootstrap();
