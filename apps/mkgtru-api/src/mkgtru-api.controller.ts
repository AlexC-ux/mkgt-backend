import { Body, CacheInterceptor, CacheKey, CacheTTL, Controller, Get, HttpException, HttpStatus, Patch, Query, UseGuards, UseInterceptors, Headers, Post, Delete } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MkgtruApiService } from './mkgtru-api.service';
import { RequireApiKeyGuard } from './require-api-key/require-api-key.guard';
import { ITitledDocumentInfo } from './types/ITitledDocumentInfo';
import { territories } from './types/territories';


/**
 * # /mkgtru-api/* requests
 * 
 * # **Getting information from the college website**
 * @date 3/13/2023 - 11:05:44 PM
 *
 * @export
 * @class MkgtruApiController
 * @typedef {MkgtruApiController}
 */
@Controller("mkgtru-api")
@UseInterceptors(CacheInterceptor)
export class MkgtruApiController {
  constructor(private readonly mkgtruApiService: MkgtruApiService) { }


  
  /**
   * Path: `/mkgtru-api/changes`
   * 
   * Getting information about schedule substitutions
   * @date 3/13/2023 - 11:06:10 PM
   *
   * @async
   * @param {territories} territory
   * @returns {Promise<ITitledDocumentInfo>}
   */
  @Get("changes")
  @CacheTTL(200)
  @UseGuards(RequireApiKeyGuard)
  async getChanges(@Query("territory") territory: territories): Promise<ITitledDocumentInfo> {
    return this.mkgtruApiService.getChanges(territory);
  }

  
  /**
   * Path: `/mkgtru-api/auditories`
   * 
   * Getting information about the distribution of audiences
   * @date 3/13/2023 - 11:36:53 PM
   *
   * @async
   * @returns {Promise<ITitledDocumentInfo>}
   */
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

  @Patch("token")
  @UseGuards(RequireApiKeyGuard)
  async revokeToken(@Headers("Authorization") bearerToken:string){
    return this.mkgtruApiService.revokeToken(bearerToken.replace("Bearer ",""));
  }

  @Post("profile")
  @UseGuards(RequireApiKeyGuard)
  async updateProfile(@Body("name") name:string, @Body("email") email:string, @Body("surname") surname?:string){
    
  }

  @Delete("profile")
  @UseGuards(RequireApiKeyGuard)
  async deleteProfile(@Headers("Authorization") bearerToken:string){
    const token = bearerToken.replace("Bearer ","")
    const prisma = new PrismaClient();
    await prisma.users.delete({
      where:{
        token:token
      }
    })
    prisma.$disconnect();
    throw new HttpException("DELETED", HttpStatus.OK)
  }
}
