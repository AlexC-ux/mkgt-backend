import { NestFactory } from '@nestjs/core';
import { DocumentationStaticModule } from './documentation-static.module';

async function bootstrap() {
  const app = await NestFactory.create(DocumentationStaticModule);
  await app.listen(8800);
}
bootstrap();
