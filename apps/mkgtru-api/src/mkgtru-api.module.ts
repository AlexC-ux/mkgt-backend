import { Module, CacheModule } from '@nestjs/common';
import { MkgtruApiController } from './mkgtru-api.controller';
import { MkgtruApiService } from './mkgtru-api.service';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: "./apps/mkgtru-api/.env" }),
    CacheModule.register(),
  ],
  controllers: [MkgtruApiController],
  providers: [MkgtruApiService],
})
export class MkgtruApiModule { }
