import { Body, CacheInterceptor, CacheKey, CacheTTL, Controller, Get, HttpException, HttpStatus, Patch, Query, UseGuards, UseInterceptors, Headers, Post, Delete } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MkgtruApiService } from './mkgtru-api.service';
import { RequireApiKeyGuard } from './require-api-key/require-api-key.guard';
import { ITitledDocumentInfo } from './types/ITitledDocumentInfo';
import { territories } from './types/territories';
import { ITokenResponse } from './types/tokenResponse';


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
@UseInterceptors(CacheInterceptor)
export class MkgtruApiController {
  constructor(private readonly mkgtruApiService: MkgtruApiService) { }




  /**
   * Getting information about schedule substitutions
   * @date 3/14/2023 - 12:16:08 AM
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
   * Deletes the profile of the user who sent the request
   * @date 3/13/2023 - 11:48:18 PM
   *
   * @async
   * @param {string} bearerToken
   * @returns {*}
   */
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

  
  /**
   * Getting an array of practice schedule document descriptions
   * @date 3/14/2023 - 12:17:24 AM
   *
   * @async
   * @returns {Promise<ITitledDocumentInfo[]>}
   */
  @Get("practicelist")
  @CacheTTL(18000)
  @UseGuards(RequireApiKeyGuard)
  async getPracticeList(): Promise<ITitledDocumentInfo[]> {
    return this.mkgtruApiService.getPracticeList();
  }

  
  /**
   * Getting a class schedule
   * @date 3/14/2023 - 12:20:04 AM
   *
   * @async
   * @param {territories} territory
   * @returns {Promise<ITitledDocumentInfo[]>}
   */
  @Get("timetables")
  @CacheTTL(18000)
  @UseGuards(RequireApiKeyGuard)
  async getTimetables(@Query("territory") territory: territories): Promise<ITitledDocumentInfo[]> {
    return this.mkgtruApiService.getTimetables(territory)
  }

  
  /**
   * Getting server status
   * @date 3/14/2023 - 12:20:31 AM
   *
   * @async
   * @param {territories} territory
   * @returns {Promise<ITitledDocumentInfo[]>}
   */
  @Get("status")
  async getPing(@Query("territory") territory: territories): Promise<ITitledDocumentInfo[]> {
    throw new HttpException('OK', HttpStatus.OK);
  }

  
  
  /**
   * Updating a token
   * @date 3/14/2023 - 12:24:47 AM
   *
   * @async
   * @param {string} bearerToken
   * @returns {Promise<ITokenResponse>}
   */
  @Patch("token")
  @UseGuards(RequireApiKeyGuard)
  async revokeToken(@Headers("Authorization") bearerToken: string):Promise<ITokenResponse> {
    return this.mkgtruApiService.revokeToken(bearerToken.replace("Bearer ", ""));
  }

  
  
  /**
   * Account registration
   * @date 3/14/2023 - 12:25:00 AM
   *
   * @async
   * @param {string} name - First name
   * @param {string} email - email
   * @param {?string} [surname] - Second name
   * @returns {Promise<ITokenResponse>}
   */
  @Post("Register")
  @UseGuards(RequireApiKeyGuard)
  async updateProfile(@Body("name") name: string, @Body("email") email: string, @Body("surname") surname?: string):Promise<ITokenResponse> {
    return this.mkgtruApiService.createAccount(name,surname,email);
  }

  /**
     * Path: `/mkgtru-api/auditories`
     * 
     * Getting information about the distribution of audiences
     * @date 3/13/2023 - 11:36:53 PM
     *
     * @async
     * @returns {Promise<ITitledDocumentInfo>} information about the distribution of audiences document
     */
  @Get("auditories")
  @CacheTTL(200)
  @UseGuards(RequireApiKeyGuard)
  async getAuditories(): Promise<ITitledDocumentInfo> {
    return this.mkgtruApiService.getAuditories();
  }

}
