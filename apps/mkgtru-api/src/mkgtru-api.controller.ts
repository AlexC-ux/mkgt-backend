import { CacheInterceptor, CacheKey, CacheTTL, Controller, Get, HttpException, HttpStatus, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { MkgtruApiService } from './mkgtru-api.service';
import { RequireApiKeyGuard } from './require-api-key/require-api-key.guard';
import { ITitledDocumentInfo } from './types/ITitledDocumentInfo';
import { territories } from './types/territories';

@Controller("mkgtru-api")
@UseInterceptors(CacheInterceptor)
export class MkgtruApiController {
  constructor(private readonly mkgtruApiService: MkgtruApiService) { }

  @Get("changes")
  @CacheTTL(200)
  @UseGuards(RequireApiKeyGuard)
  async getChanges(@Query("territory") territory: territories): Promise<ITitledDocumentInfo> {
    return this.mkgtruApiService.getChanges(territory);
  }

  @Get("auditories")
  @CacheTTL(200)
  @UseGuards(RequireApiKeyGuard)
  async getAuditories(): Promise<ITitledDocumentInfo> {
    return this.mkgtruApiService.getAuditories();
  }

  @Get("practicelist")
  @CacheTTL(18000)
  @UseGuards(RequireApiKeyGuard)
  async getPracticeList(): Promise<ITitledDocumentInfo[]> {
    return this.mkgtruApiService.getPracticeList();
  }

  @Get("timetables")
  @CacheTTL(18000)
  @UseGuards(RequireApiKeyGuard)
  async getTimetables(@Query("territory") territory: territories): Promise<ITitledDocumentInfo[]> {
    return this.mkgtruApiService.getTimetables(territory)
  }

  @Get("status")
  async getPing(@Query("territory") territory: territories): Promise<ITitledDocumentInfo[]> {
    throw new HttpException('OK', HttpStatus.OK);
  }
}
