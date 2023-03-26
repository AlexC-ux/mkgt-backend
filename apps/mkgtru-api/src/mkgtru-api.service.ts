import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from "axios";
import parse from 'node-html-parser';
import { territories } from './types/territories';
import { ITitledDocumentInfo } from './types/ITitledDocumentInfo';
import HTMLElement from "node_modules/node-html-parser/dist/nodes/html";
import { PrismaClient } from '@prisma/client';
import { ITokenResponse } from './types/tokenObject';
const cuid = require("cuid");
import { createHash } from "crypto";

const tunnel = require("tunnel")
const tunnelingAgent = tunnel.httpsOverHttp({
  proxy: {
    host: '46.3.181.172',
    port: 8000,
    proxyAuth: 'MJWGyH:3C7VSk'
  }
});

const axiosDefaultConfig: AxiosRequestConfig<any> = {
  timeout: 30000,
  httpsAgent: tunnelingAgent,
  maxRedirects: 70,
  maxContentLength: 10000000000
}

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
  async createAccount(name: string, surname: string, email: string): Promise<ITokenResponse> {
    const token = cuid();

    const prisma = new PrismaClient();
    await prisma.users.create({
      data: {
        name,
        surname,
        email,
        token: token
      }
    });
    prisma.$disconnect();

    return { token }
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

  async getStatus(): Promise<string> {
    const result = await axios.get("https://mkgt.ru/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah/", axiosDefaultConfig);
    console.log({ statusRequest: result })
    return result.statusText;
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
    const linkElement = await getElementsFromPage(`https://${process.env.SITE_DOMAIN}/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah/`, `div:nth-child(2)>*>div.sppb-panel-body div:nth-child(${territory == 'kuchin' ? "1" : "2"}) a`);
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
    const linkElement = await getElementsFromPage(`https://${process.env.SITE_DOMAIN}/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah`, "div:nth-child(1)>*>div.sppb-panel-body div:nth-child(1) a");
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
    const linkElements = await getElementsFromPage(`https://${process.env.SITE_DOMAIN}/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah`, `div:nth-child(5)>*>div.sppb-panel-body>div:nth-child(${territory == 'kuchin' ? "1" : "2"}) a`);
    const files = [];
    for (const index in linkElements) {
      if (Object.prototype.hasOwnProperty.call(linkElements, index)) {
        const element = linkElements[index];
        files.push(await getTitledFileInfoByATag(element))
      }
    }
    return files
  }

  async getNews(): Promise<ITitledDocumentInfo[]> {
    const elements = await getElementsFromPage("https://mkgt.ru/index.php?option=com_minitekwall&task=masonry.getContent&widget_id=3&page=19999&tag_operator=OR&date_format=Y-m&grid=masonry", 'h3 a');
    console.log({ elements })
    let news: ITitledDocumentInfo[] = [];
    for (let index = 0; index < 6; index++) {
      news[index] = await getTitledFileInfoByATag(elements[index]);
    }
    return news;
  }


  /**
   * Getting calls table
   * @date 3/26/2023 - 2:12:51 AM
   *
   * @async
   * @returns {unknown}
   */
  async getTimeCalls() {
    const linkElement = await getElementsFromPage(`https://${process.env.SITE_DOMAIN}/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah`, "div:nth-child(6) div.sppb-panel-body a");
    return await getTitledFileInfoByATag(linkElement[0])
  }


  /**
   * Getting array of available practice timetables
   * @date 3/14/2023 - 1:24:51 AM
   *
   * @async
   * @returns {Promise<ITitledDocumentInfo[]>}
   */
  async getPracticeList(): Promise<ITitledDocumentInfo[]> {
    const linkElements = await getElementsFromPage(`https://${process.env.SITE_DOMAIN}/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah`, "div:nth-child(3) div.sppb-panel-body a");
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
  const pageResponse = await axios.get(uri, axiosDefaultConfig);
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
  const documentResponse = await axios.get(`${linkToFile.startsWith("http") ? "" : `https://${process.env.SITE_DOMAIN}`}${linkToFile}`, { ...axiosDefaultConfig, responseType: "arraybuffer" });
  const docText = Buffer.from(documentResponse.data).toString("utf-8");

  if (documentResponse.status != 200 || !linkToFile) {
    throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
  } else {
    const dataType: string = documentResponse.headers['content-type'];

    const lastModifiedDate = getLastMod();

    function getLastMod(): Date {
      if (dataType == "application/pdf") {
        const modDate = /<xmp:ModifyDate>(.*)<\/xmp:ModifyDate>/gm.exec(docText)[1]
        if (!!modDate) {
          console.log({ modDate })
          return new Date(modDate)
        } else {
          return new Date(documentResponse.headers["last-modified"] || Date.now())
        }
      }
      else {
        return new Date(documentResponse.headers["last-modified"] || Date.now())
      }
    }

    const url = `${linkToFile.startsWith("http") ? "" : `https://${process.env.SITE_DOMAIN}`}${linkToFile}`;
    return (
      {
        'title': node.innerText,
        'last_modified': {
          'ru': lastModifiedDate.toLocaleString('ru'),
          'en-US': lastModifiedDate.toLocaleString('en-US'),
          'timestamp': lastModifiedDate.getTime(),
          'now': `${Date.now()}`
        },
        'links': {
          'file': url,
          'file_hash': `${createHash("sha1").update(docText).digest("hex")}`,
          'views': {
            'google_docs': `https://docs.google.com/gview?url=${url}&embed=true`,
            'server_viewer': `http://paytoplay.space/docs-viewer/?file=${url}`,
          },
        },
        'data_type': dataType,
      }
    )
  }
}