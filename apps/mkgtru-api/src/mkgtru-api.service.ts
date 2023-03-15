import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from "axios";
import parse from 'node-html-parser';
import { territories } from './types/territories';
import { ITitledDocumentInfo } from './types/ITitledDocumentInfo';
import HTMLElement from "node_modules/node-html-parser/dist/nodes/html";
import { PrismaClient } from '@prisma/client';
import { ITokenResponse } from './types/tokenObject';
const cuid = require("cuid");

@Injectable()
export class MkgtruApiService {

  
  /**
   * Creating new account in database
   * @date 3/14/2023 - 1:22:12 AM
   *
   * @async
   * @param {string} name
   * @param {string} surname
   * @param {string} email
   * @returns {Promise<ITokenResponse>}
   */
  async createAccount(name:string, surname:string, email:string):Promise<ITokenResponse>{
    const token = cuid();

    const prisma = new PrismaClient();
    await prisma.users.create({
      data:{
        name,
        surname,
        email,
        token:token
      }
    });
    prisma.$disconnect();

    return {token}
  }

  
  /**
   * Updates token in db
   * @date 3/14/2023 - 1:22:34 AM
   *
   * @async
   * @param {string} token
   * @returns {Promise<ITokenResponse>}
   */
  async revokeToken(token: string): Promise<ITokenResponse> {
    const newToken = `${cuid()}70qy00011${cuid()}`;
    const prisma = new PrismaClient();
    await prisma.users.update({
      where: {
        token: token,
      },
      data: {
        token: newToken
      }
    })
    prisma.$disconnect();
    return {
      'token': newToken
    }
  }

  
  /**
   * Getting changes info
   * @date 3/14/2023 - 1:22:52 AM
   *
   * @async
   * @param {?territories} [territory]
   * @returns {Promise<ITitledDocumentInfo>}
   */
  async getChanges(territory?: territories): Promise<ITitledDocumentInfo> {
    const linkElement = await getElementsFromPage(`https://${process.env.SITE_DOMAIN}/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah`, territory === "lublino" ? "#sppb-addon-1643455125007 > div > div > a" : "#sppb-addon-1643455125006 > div > div > a");
    return await getTitledFileInfoByATag(linkElement[0])
  }

  
  /**
   * Getting information about auditories
   * @date 3/14/2023 - 1:23:02 AM
   *
   * @async
   * @returns {Promise<ITitledDocumentInfo>}
   */
  async getAuditories(): Promise<ITitledDocumentInfo> {
    const linkElement = await getElementsFromPage(`https://${process.env.SITE_DOMAIN}/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah`, "#sppb-addon-1643621942381 > div > div > a");
    return await getTitledFileInfoByATag(linkElement[0])
  }

  
  /**
   * Getting timetables array
   * @date 3/14/2023 - 1:24:07 AM
   *
   * @async
   * @param {?territories} [territory]
   * @returns {Promise<ITitledDocumentInfo[]>}
   */
  async getTimetables(territory?: territories): Promise<ITitledDocumentInfo[]> {
    const linkElements = await getElementsFromPage(`https://${process.env.SITE_DOMAIN}/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah`, territory === "lublino" ? "#sppb-addon-1632589047343 > div > div > p > a" : "#sppb-addon-1632589047342 > div > div > a");
    const files = [];
    for (const index in linkElements) {
      if (Object.prototype.hasOwnProperty.call(linkElements, index)) {
        const element = linkElements[index];
        files.push(await getTitledFileInfoByATag(element))
      }
    }
    return files
  }

  
  /**
   * Getting array of available practice timetables
   * @date 3/14/2023 - 1:24:51 AM
   *
   * @async
   * @returns {Promise<ITitledDocumentInfo[]>}
   */
  async getPracticeList(): Promise<ITitledDocumentInfo[]> {
    const linkElements = await getElementsFromPage(`https://${process.env.SITE_DOMAIN}/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah`, "#sppb-addon-1646804333482 > div > div > p > a");
    const files = [];
    for (const index in linkElements) {
      if (Object.prototype.hasOwnProperty.call(linkElements, index)) {
        const element = linkElements[index];
        files.push(await getTitledFileInfoByATag(element))
      }
    }
    return files
  }
}


/**
 * Getting single element from page
 * @date 3/14/2023 - 1:25:10 AM
 *
 * @async
 * @param {string} uri
 * @param {string} selector
 * @returns {Promise<HTMLElement[]>}
 */
async function getElementsFromPage(uri: string, selector: string): Promise<HTMLElement[]> {
  const pageResponse = await axios.get(uri);
  if (pageResponse.status != 200) {
    throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
  } else {
    const root = parse(pageResponse.data);

    const linkElements = root.querySelectorAll(selector);

    if (!!linkElements && linkElements.length > 0) {
      return linkElements;
    } else {
      throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}


/**
 * Getting info about document by <a> tag element
 * @date 3/14/2023 - 1:25:23 AM
 *
 * @async
 * @param {HTMLElement} node
 * @returns {Promise<ITitledDocumentInfo>}
 */
async function getTitledFileInfoByATag(node: HTMLElement): Promise<ITitledDocumentInfo> {
  const linkToFile = node.getAttribute("href")
  const documentResponse = await axios.get(`http://${process.env.SITE_DOMAIN}${linkToFile}`);
  if (documentResponse.status != 200 || !linkToFile) {
    throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
  } else {
    const dataType: string = documentResponse.headers['content-type'];
    const lastModifiedDate = new Date(documentResponse.headers['last-modified']);

    const htmlViewCode = `<html><body><embed src='https://${process.env.SITE_DOMAIN}${linkToFile}' style='width:98vw; height:98vh;'/></body></html>`;
    const htmlViewBase64 = Buffer.from(htmlViewCode).toString('base64');
    return (
      {
        'title': node.innerText,
        'last_modified': {
          'ru': lastModifiedDate.toLocaleString('ru'),
          'en-US': lastModifiedDate.toLocaleString('en-US'),
          'timestamp': lastModifiedDate.getTime()
        },
        'links': {
          'file': `https://${process.env.SITE_DOMAIN}${linkToFile}`,
          'views': {
            'google_docs': `https://docs.google.com/gview?url=https://${process.env.SITE_DOMAIN}${linkToFile}&embed=true`,
            'local_html': `data:text/html;base64,${htmlViewBase64}`,
          },
        },
        'data_type': dataType,
      }
    )
  }
}