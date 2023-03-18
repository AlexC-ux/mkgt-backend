import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MkgtruApiModule } from './mkgtru-api.module';

async function bootstrap() {
  const app = await NestFactory.create(MkgtruApiModule);

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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);

  await app.listen(8080);
}
bootstrap();
