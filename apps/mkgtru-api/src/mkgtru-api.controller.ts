import { Body, CacheInterceptor, CacheKey, CacheTTL, Controller, Get, HttpException, HttpStatus, Patch, Query, UseGuards, UseInterceptors, Headers, Post, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';
import { MkgtruApiService } from './mkgtru-api.service';
import { RequireApiKeyGuard } from './require-api-key/require-api-key.guard';
import { ITitledDocumentInfo } from './types/ITitledDocumentInfo';
import { territories } from './types/territories';
import { ITokenResponse } from './types/tokenObject';


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
@UseInterceptors(CacheInterceptor)
export class MkgtruApiController {
  constructor(private readonly mkgtruApiService: MkgtruApiService) { }


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
  @Get("changes")
  @CacheTTL(200)
  @UseGuards(RequireApiKeyGuard)
  async getChanges(@Query("territory") territory: territories): Promise<ITitledDocumentInfo> {
    return this.mkgtruApiService.getChanges(territory);
  }

  @ApiSecurity("ApiKeyAuth")
  @ApiOperation({ summary: "Getting array of prictice timetables" })
  @ApiResponse({ status: HttpStatus.OK, description: "Success", })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Wrong api key" })
  @Get("practicelist")
  @CacheTTL(18000)
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
  @CacheTTL(18000)
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
  @CacheTTL(200)
  @UseGuards(RequireApiKeyGuard)
  async getAuditories(): Promise<ITitledDocumentInfo> {
    return this.mkgtruApiService.getAuditories();
  }

  @ApiSecurity("ApiKeyAuth")
  @ApiOperation({ summary: "Updating token" })
  @ApiResponse({ status: HttpStatus.OK, description: "Success", })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Wrong api key" })
  @Patch("token")
  @UseGuards(RequireApiKeyGuard)
  async revokeToken(@Headers("Authorization") bearerToken: string): Promise<ITokenResponse> {
    return this.mkgtruApiService.revokeToken(bearerToken.replace("Bearer ", ""));
  }



  @ApiSecurity("ApiKeyAuth")
  @ApiOperation({ summary: "Creating new account" })
  @ApiParam({ name: "email", required: true, description: "Last name", type: String })
  @ApiParam({ name: "surname", required: false, description: "First name", type: String })
  @ApiParam({ name: "email", required: true, description: "email", type: String })
  @ApiResponse({ status: HttpStatus.OK, description: "Success", })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Wrong api key" })
  @Post("register")
  @UseGuards(RequireApiKeyGuard)
  async updateProfile(@Body("name") name: string, @Body("email") email: string, @Body("surname") surname?: string): Promise<ITokenResponse> {
    return this.mkgtruApiService.createAccount(name, surname, email);
  }

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
}
