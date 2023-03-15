import { Injectable } from '@nestjs/common';

@Injectable()
export class DocumentationStaticService {
  getHello(): string {
    return '<h4>GO TO <a href="/index.html">/index.html</a></h4>';
  }
}
