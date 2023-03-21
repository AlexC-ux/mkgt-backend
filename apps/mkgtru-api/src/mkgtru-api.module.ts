import { Module, CacheModule, CacheInterceptor } from '@nestjs/common';
import { MkgtruApiController } from './mkgtru-api.controller';
import { MkgtruApiService } from './mkgtru-api.service';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: "./apps/mkgtru-api/.env" }),
    CacheModule.register({ isGlobal: true }),
  ],
  controllers: [MkgtruApiController],
  providers: [MkgtruApiService],
})
export class MkgtruApiModule { }
