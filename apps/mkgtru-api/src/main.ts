import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LogRequest } from './logger';
import { MkgtruApiModule } from './mkgtru-api.module';
import { MkgtOfficialBotModule } from 'apps/mkgt-official-bot/src/mkgt-official-bot.module';

async function bootstrap() {
  const app = await NestFactory.create(MkgtruApiModule);
  const bot = await NestFactory.create(MkgtOfficialBotModule);

  const config = new DocumentBuilder()
    .setTitle('MKGTRU-API DOCUMENTATION')
    .setDescription('Short endpoint description')
    .setVersion('1.0')
    .addSecurity('ApiKeyAuth', {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
    })
    .build();

    app.use(LogRequest);
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);

  await app.listen(8080);
  await bot.listen(8081);
}
bootstrap();
