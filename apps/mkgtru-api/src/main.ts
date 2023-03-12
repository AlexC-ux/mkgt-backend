import { NestFactory } from '@nestjs/core';
import { MkgtruApiModule } from './mkgtru-api.module';

async function bootstrap() {
  const app = await NestFactory.create(MkgtruApiModule);
  await app.listen(3000);
}
bootstrap();
