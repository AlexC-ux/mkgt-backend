import { Test, TestingModule } from '@nestjs/testing';
import { DocumentationStaticController } from './documentation-static.controller';
import { DocumentationStaticService } from './documentation-static.service';

describe('DocumentationStaticController', () => {
  let documentationStaticController: DocumentationStaticController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DocumentationStaticController],
      providers: [DocumentationStaticService],
    }).compile();

    documentationStaticController = app.get<DocumentationStaticController>(DocumentationStaticController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(documentationStaticController.getHello()).toBe('Hello World!');
    });
  });
});
