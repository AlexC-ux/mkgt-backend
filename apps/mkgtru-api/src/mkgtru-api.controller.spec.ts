import { Test, TestingModule } from '@nestjs/testing';
import { MkgtruApiController } from './mkgtru-api.controller';
import { MkgtruApiService } from './mkgtru-api.service';

describe('MkgtruApiController', () => {
  let mkgtruApiController: MkgtruApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MkgtruApiController],
      providers: [MkgtruApiService],
    }).compile();

    mkgtruApiController = app.get<MkgtruApiController>(MkgtruApiController);
  });

  
});
