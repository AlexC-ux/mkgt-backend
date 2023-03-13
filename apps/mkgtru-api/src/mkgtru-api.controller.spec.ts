import { CacheModule, HttpCode, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MkgtruApiController } from './mkgtru-api.controller';
import { MkgtruApiService } from './mkgtru-api.service';

describe('MkgtruApiController', () => {
  let mkgtruApiController: MkgtruApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MkgtruApiController],
      providers: [MkgtruApiService],
      imports: [
        ConfigModule.forRoot({ envFilePath: "./apps/mkgtru-api/.env" }),
        CacheModule.register(),
      ],
    }).compile();

    mkgtruApiController = app.get<MkgtruApiController>(MkgtruApiController);
  });

  it('should be defined', () => {
    expect(mkgtruApiController).toBeDefined();
  });

  it("ping is ok", ()=>{
    expect(mkgtruApiController.getPing()).toBe("OK")
  })

  it("changes kuchin", async ()=>{
    expect((await mkgtruApiController.getChanges("kuchin")).last_modified.difference).toBeGreaterThan(1);
    expect((await mkgtruApiController.getChanges("kuchin")).last_modified.difference).toBeLessThan(604800000);
    expect((await mkgtruApiController.getChanges("kuchin")).last_modified.timestamp).toBeLessThan(Date.now());
  })

  it("changes lublino", async ()=>{
    expect((await mkgtruApiController.getChanges("lublino")).last_modified.difference).toBeGreaterThan(1);
    expect((await mkgtruApiController.getChanges("lublino")).last_modified.difference).toBeLessThan(604800000);
    expect((await mkgtruApiController.getChanges("lublino")).last_modified.difference).toBeLessThan(Date.now());
  })

});
