import { Test, TestingModule } from '@nestjs/testing';
import { MkgtOfficialBotController } from './mkgt-official-bot.controller';
import { MkgtOfficialBotService } from './mkgt-official-bot.service';

describe('MkgtOfficialBotController', () => {
  let mkgtOfficialBotController: MkgtOfficialBotController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MkgtOfficialBotController],
      providers: [MkgtOfficialBotService],
    }).compile();

    mkgtOfficialBotController = app.get<MkgtOfficialBotController>(MkgtOfficialBotController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(mkgtOfficialBotController.getHello()).toBe('Hello World!');
    });
  });
});
