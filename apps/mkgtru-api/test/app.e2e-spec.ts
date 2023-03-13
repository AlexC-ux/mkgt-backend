import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MkgtruApiModule } from './../src/mkgtru-api.module';

describe('MkgtruApiController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MkgtruApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /mkgtru-api/changes', () => {
    return request(app.getHttpServer())
      .get('/mkgtru-api/changes')
      .expect(200);
  });
});
