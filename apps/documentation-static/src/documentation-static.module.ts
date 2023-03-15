import { Module } from '@nestjs/common';
import { DocumentationStaticController } from './documentation-static.controller';
import { DocumentationStaticService } from './documentation-static.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
@Module({
  imports: [ServeStaticModule.forRoot({
    rootPath: "documentation",   // <-- path to the static files
  }),
],
  controllers: [DocumentationStaticController],
  providers: [DocumentationStaticService],
})
export class DocumentationStaticModule {}
