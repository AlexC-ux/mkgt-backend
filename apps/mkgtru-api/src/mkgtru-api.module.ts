import { Module, CacheModule, CacheInterceptor } from '@nestjs/common';
import { MkgtruApiController } from './mkgtru-api.controller';
import { MkgtruApiService } from './mkgtru-api.service';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: "./apps/mkgtru-api/.env" }),
    CacheModule.register({ max:100}),
    ServeStaticModule.forRoot({
      rootPath:"./apps/static"
    })
  ],
  controllers: [MkgtruApiController],
  providers: [MkgtruApiService],
})
export class MkgtruApiModule { }
