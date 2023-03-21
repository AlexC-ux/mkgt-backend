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
@Controller("mkgtru-api")
@ApiTags('mkgtru-api')
export class MkgtruApiController {
  constructor(private readonly mkgtruApiService: MkgtruApiService,

    @Inject(CACHE_MANAGER) private cacheManager: Cache

  ) { }


  @ApiOperation({ summary: "Getting server status" })
  @ApiResponse({ status: HttpStatus.OK, description: "Server is available", })
  @Get("status")
  getPing(): "OK" {
    return "OK"
  }

  @ApiSecurity("ApiKeyAuth")
  @ApiOperation({ summary: "Getting information about timetable updates" })
  @ApiQuery({ name: "territory", required: false, description: "Tiemetable updates territory", enumName: "territories", enum: ["kuchin", "lublino"] })
  @ApiResponse({ status: HttpStatus.OK, description: "Success" })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Wrong api key" })
  @UseGuards(RequireApiKeyGuard)
  @Get("changes")
  async getChanges(@Query("territory") territory: territories): Promise<ITitledDocumentInfo> {
    const value = await this.cacheManager.get<ITitledDocumentInfo|null>(`changes_${territory}`)
    if (!!value) {
      return value;
    } else {
      const result = await this.mkgtruApiService.getChanges(territory);
      await this.cacheManager.set(`changes_${territory}`, result, 5)
      return result;
    }

    return
  }

  @ApiSecurity("ApiKeyAuth")
  @ApiOperation({ summary: "Getting array of prictice timetables" })
  @ApiResponse({ status: HttpStatus.OK, description: "Success", })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Wrong api key" })
  @Get("practicelist")
  @UseGuards(RequireApiKeyGuard)
  async getPracticeList(): Promise<ITitledDocumentInfo[]> {
    return this.mkgtruApiService.getPracticeList();
  }


  @ApiSecurity("ApiKeyAuth")
  @ApiOperation({ summary: "Getting array of timetables" })
  @ApiQuery({ name: "territory", required: false, description: "Tiemetable updates territory", enumName: "territories", enum: ["kuchin", "lublino"] })
  @ApiResponse({ status: HttpStatus.OK, description: "Success", })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Wrong api key" })
  @Get("timetables")
  @UseGuards(RequireApiKeyGuard)
  async getTimetables(@Query("territory") territory: territories): Promise<ITitledDocumentInfo[]> {
    return this.mkgtruApiService.getTimetables(territory)
  }

  @ApiSecurity("ApiKeyAuth")
  @ApiOperation({ summary: "Getting information about cabinets table document" })
  @ApiQuery({ name: "territory", required: false, description: "Tiemetable updates territory", enumName: "territories", enum: ["kuchin", "lublino"] })
  @ApiResponse({ status: HttpStatus.OK, description: "Success", })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Wrong api key" })
  @Get("auditories")
  @UseGuards(RequireApiKeyGuard)
  async getAuditories(): Promise<ITitledDocumentInfo> {
    return this.mkgtruApiService.getAuditories();
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
}