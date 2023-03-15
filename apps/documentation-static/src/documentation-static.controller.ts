import { Controller, Get } from '@nestjs/common';
import { DocumentationStaticService } from './documentation-static.service';

@Controller()
export class DocumentationStaticController {
  constructor(private readonly documentationStaticService: DocumentationStaticService) {}

  @Get()
  getHello(): string {
    return this.documentationStaticService.getHello();
  }
}
