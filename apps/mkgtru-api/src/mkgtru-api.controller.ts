import { Body, CacheInterceptor, CacheKey, Controller, Get, HttpException, HttpStatus, Patch, Query, UseGuards, UseInterceptors, Headers, Post, Delete, CacheTTL, CACHE_MANAGER, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';
import { Cache } from 'cache-manager';
import { type } from 'os';
import { MkgtruApiService } from './mkgtru-api.service';
import { RequireApiKeyGuard } from './require-api-key/require-api-key.guard';
import { ITitledDocumentInfo } from './types/ITitledDocumentInfo';
import { territories } from './types/territories';
import { ITokenResponse } from './types/tokenObject';



const tokenSchema = {
  type: "object",
  properties: {
    token: { title: "token", type: "string", example: "cmkeghnzf0130q0vd3roeali8" }
  }
}




/**
 * # `/mkgtru-api/*` requests
 * 
 * # **Getting information from the college website**
 * @date 3/13/2023 - 11:05:44 PM
 *
 * @export
 * @class MkgtruApiController
 * @typedef {MkgtruApiController}
 */
let started = false;

@Controller("mkgtru-api")
@ApiTags('mkgtru-api')
export class MkgtruApiController {
  constructor(private readonly mkgtruApiService: MkgtruApiService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }


  @ApiOperation({ summary: "Getting server status" })
  @ApiResponse({ status: HttpStatus.OK, description: "Server is available", })
  @Get("status")
  async getPing(): Promise<string> {
    if (!started) {
      started = true;
      this.getAuditories();
      this.getCallstable();
      this.getChanges("kuchin");
      this.getChanges("lublino");
      this.getNews();
      this.gettPracticeList();
      this.getTimetables("kuchin");
      this.getTimetables("lublino");
    }
    return await this.mkgtruApiService.getStatus();
  }

  @ApiSecurity("ApiKeyAuth")
  @ApiOperation({ summary: "Getting news" })
  @ApiResponse({ status: HttpStatus.OK, description: "Success" })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Wrong api key" })
  @UseGuards(RequireApiKeyGuard)
  @Get("news")
  async getNews(): Promise<ITitledDocumentInfo[]> {
    return this.getResultFromCache(`news`, { hours: 12, minutes: 0, seconds: 0 }, this.mkgtruApiService.getNews);
  }

  @ApiOperation({ summary: "Getting news" })
  @ApiResponse({ status: HttpStatus.OK, description: "Success" })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Wrong api key" })
  @Get("material")
  async getMaterial(@Query("location") location: string): Promise<string> {
    return await this.mkgtruApiService.getMaterialContent(location);
  }

  @ApiSecurity("ApiKeyAuth")
  @ApiOperation({ summary: "Getting information about timetable updates" })
  @ApiQuery({ name: "territory", required: false, description: "Tiemetable updates territory", enumName: "territories", enum: ["kuchin", "lublino"] })
  @ApiResponse({ status: HttpStatus.OK, description: "Success" })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Wrong api key" })
  @UseGuards(RequireApiKeyGuard)
  @Get("changes")
  async getChanges(@Query("territory") territory: territories): Promise<ITitledDocumentInfo> {
    if (territory == "kuchin") {
      return this.getResultFromCache(`changes_${territory || "def"}`, { hours: 0, minutes: 30, seconds: 0 }, this.mkgtruApiService.getChangesKuchin);
    }
    else {
      return this.getResultFromCache(`changes_${territory || "def"}`, { hours: 0, minutes: 30, seconds: 0 }, this.mkgtruApiService.getChangesLublino);
    }
  }

  @ApiSecurity("ApiKeyAuth")
  @ApiOperation({ summary: "Getting array of prictice timetables" })
  @ApiResponse({ status: HttpStatus.OK, description: "Success", })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Wrong api key" })
  @Get("practicelist")
  @UseGuards(RequireApiKeyGuard)
  async gettPracticeList(): Promise<ITitledDocumentInfo[]> {
    return await this.getResultFromCache(`practicelist`, { hours: 24, minutes: 0, seconds: 0 }, this.mkgtruApiService.getPracticeList);
  }

  @ApiSecurity("ApiKeyAuth")
  @ApiOperation({ summary: "Getting array of timetables" })
  @ApiQuery({ name: "territory", required: false, description: "Tiemetable updates territory", enumName: "territories", enum: ["kuchin", "lublino"] })
  @ApiResponse({ status: HttpStatus.OK, description: "Success", })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Wrong api key" })
  @Get("timetables")
  @UseGuards(RequireApiKeyGuard)
  async getTimetables(@Query("territory") territory: territories): Promise<ITitledDocumentInfo[]> {
    if (territory == "kuchin") {
      return this.getResultFromCache(`timetables_${territory || "def"}`, { hours: 72, minutes: 0, seconds: 0 }, this.mkgtruApiService.getTimetablesKuchin);
    } else {
      return this.getResultFromCache(`timetables_${territory || "def"}`, { hours: 72, minutes: 0, seconds: 0 }, this.mkgtruApiService.getTimetablesLublino);
    }
  }

  @ApiSecurity("ApiKeyAuth")
  @ApiOperation({ summary: "Getting information about cabinets table document" })
  @ApiQuery({ name: "territory", required: false, description: "Tiemetable updates territory", enumName: "territories", enum: ["kuchin", "lublino"] })
  @ApiResponse({ status: HttpStatus.OK, description: "Success", })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Wrong api key" })
  @Get("auditories")
  @UseGuards(RequireApiKeyGuard)
  async getAuditories(): Promise<ITitledDocumentInfo> {
    return this.getResultFromCache(`auditories`, { hours: 0, minutes: 30, seconds: 0 }, this.mkgtruApiService.getAuditories);
  }

  @ApiSecurity("ApiKeyAuth")
  @ApiOperation({ summary: "Getting calls table document information" })
  @ApiResponse({ status: HttpStatus.OK, description: "Success", })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Wrong api key" })
  @Get("callstable")
  async getCallstable(): Promise<ITitledDocumentInfo> {
    return this.getResultFromCache(`callstable`, { hours: 72, minutes: 0, seconds: 0 }, this.mkgtruApiService.getTimeCalls);
  }

  @ApiSecurity("ApiKeyAuth")
  @ApiOperation({ summary: "Updating token" })
  @ApiParam({
    name: 'Authorization',
    required: false,
    description:
      '(Leave empty. Use lock icon on the top-right to authorize)',
  })
  @ApiResponse({ status: HttpStatus.OK, description: "Success", schema: tokenSchema })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Wrong api key" })
  @Patch("token")
  @UseGuards(RequireApiKeyGuard)
  async revokeToken(@Headers("Authorization") bearerToken: string): Promise<ITokenResponse> {
    return this.mkgtruApiService.revokeToken(bearerToken.replace("Bearer ", ""));
  }


  /*
  @ApiOperation({ summary: "Creating new account" })
  @ApiBody({
    schema: {
      type: "object",
      required: ["name", "email"],
      properties: {
        name: { title: "name", type: "string", example: "Иван" },
        email: { title: "email", type: "string", example: "mail@mail.ru", uniqueItems: true },
        surname: { title: "surname", type: "string", example: "Попов" }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK, description: "Success",
    schema: tokenSchema
  })
  @Post("register")
  async updateProfile(@Body("name") name: string, @Body("email") email: string, @Body("surname") surname?: string): Promise<ITokenResponse> {
    return this.mkgtruApiService.createAccount(name, surname, email);
  }
  */

  /*
  @ApiSecurity("ApiKeyAuth")
  @ApiOperation({ summary: "Deleting profiles" })
  @ApiResponse({ status: HttpStatus.OK, description: "Profile deleted", })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Wrong api key" })
  @Delete("profile")
  @UseGuards(RequireApiKeyGuard)
  async deleteProfile(@Headers("Authorization") bearerToken: string) {
    const token = bearerToken.replace("Bearer ", "")
    const prisma = new PrismaClient();
    await prisma.users.delete({
      where: {
        token: token
      }
    })
    prisma.$disconnect();
    throw new HttpException("DELETED", HttpStatus.OK)
  }
  */


  async getResultFromCache<T>(key: string, ttl: { hours: number, minutes: number, seconds: number }, getterAsyncFunc: (...args: any) => Promise<T>): Promise<T> {
    const ttlMs = ((ttl.hours * 60 * 60) + (ttl.minutes * 60) + ttl.seconds) * 1000
    console.log({ ttlMs })
    const cacheManager = this.cacheManager;
    const value = await cacheManager.get<T | null | undefined>(key)
    console.log({ cachedValue: value, checkResult: !!value })
    if (!!value) {
      console.log(`${key} collected from cache`)
      return value;
    } else {
      console.log(`${key} collected from site`)
      const result = await getterAsyncFunc();
      if (result) {
        await cacheManager.set(key, `${JSON.stringify(result)??result}`, ttlMs * 2)
        setInterval(() => {
          console.log(key + " recaching in process....")
          reCacheValue();
        }, Math.floor(ttlMs / 2))
      }
      return value;
    }


    function reCacheValue() {
      console.log(`${key} recaching`)
      getterAsyncFunc().then(result => {
        cacheManager.set(key, result, ttlMs * 2)
        console.log(`${key} recached`)
      });
    }
  }


}