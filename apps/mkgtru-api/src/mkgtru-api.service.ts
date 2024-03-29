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
import { materialViewerBody, materialViewerHeader } from './viewer-styles/style';
import { updateProxyAgents } from './proxy';

const tunnel = require("tunnel");
/*const tunnelingAgent = tunnel.httpsOverHttp({
  proxy: {
    host: '46.3.181.172',
    port: 8000,
    proxyAuth: 'MJWGyH:3C7VSk'
  }
});*/

let initStarted = false;

export let axiosDefaultConfig: AxiosRequestConfig = {
  timeout: 0,
  maxRedirects: 70,
  maxContentLength: 990000000000,
  proxy: false,
  validateStatus: (status) => {
    if (status != 200 || !axiosDefaultConfig.httpsAgent) {
      updateProxy();
      return false;
    } else {
      return true;
    }
  }
}

function updateProxy() {
  console.log("proxy updating")
  updateProxyAgents((config) => {
    axiosDefaultConfig = { ...axiosDefaultConfig, httpsAgent: config.httpsAgent, };
    console.log({ axiosDefaultConfig })
    console.log("proxy updated")
  })
}

@Injectable()
export class MkgtruApiService {
  constructor() {
    updateProxy();
  }

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
    try {
      const result = await axios.get(`https://${process.env.SITE_DOMAIN}/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah/`, axiosDefaultConfig);
      if (result.status != 200) {
        updateProxy();
      }
      return result.statusText;
    } catch (error) {
      updateProxy();
    }
  }


  /**
   * Getting changes info
   * @date 3/14/2023 - 1:22:52 AM
   *
   * @async
   * @returns {Promise<ITitledDocumentInfo>}
   */
  async getChangesKuchin(): Promise<ITitledDocumentInfo> {
    const linkElement = await getElementsFromPage(`https://${process.env.SITE_DOMAIN}/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah`, `a[href='https://mkgt.ru/a/mkt-zameny.php']`);
    return await getTitledFileInfoByATag(linkElement[0])
  }

  /**
   * Getting changes info
   * @date 3/14/2023 - 1:22:52 AM
   *
   * @async
   * @returns {Promise<ITitledDocumentInfo>}
   */
  async getChangesLublino(): Promise<ITitledDocumentInfo> {
    const linkElement = await getElementsFromPage(`https://${process.env.SITE_DOMAIN}/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah`, `a[href='https://mkgt.ru/a/mkt-zameny-l.php']`);
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
    const linkElement = await getElementsFromPage(`https://${process.env.SITE_DOMAIN}/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah`, "#sppb-addon-1679752997247 > div a");
    return await getTitledFileInfoByATag(linkElement[0])
  }


  /**
   * Getting timetables array
   * @date 3/14/2023 - 1:24:07 AM
   *
   * @async
   * @returns {Promise<ITitledDocumentInfo[]>}
   */
  async getTimetablesKuchin(): Promise<ITitledDocumentInfo[]> {
    const linkElements = await getElementsFromPage(`https://${process.env.SITE_DOMAIN}/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah`, `#sppb-addon-1632589047342 > div a`);
    const files = [];
    for (const index in linkElements) {
      const element = linkElements[index];
      files.push(await getTitledFileInfoByATag(element))
    }
    return files
  }

  /**
   * Getting timetables array
   * @date 3/14/2023 - 1:24:07 AM
   *
   * @async
   * @returns {Promise<ITitledDocumentInfo[]>}
   */
  async getTimetablesLublino(): Promise<ITitledDocumentInfo[]> {
    const linkElements = await getElementsFromPage(`https://${process.env.SITE_DOMAIN}/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah`, `#sppb-addon-1632589047343 > div a`);
    const files = [];
    for (const index in linkElements) {
      const element = linkElements[index];
      files.push(await getTitledFileInfoByATag(element))
    }
    return files
  }

  async getNews(): Promise<ITitledDocumentInfo[]> {
    const elements = await getElementsFromPage("https://mkgt.ru/index.php?option=com_minitekwall&task=masonry.getContent&widget_id=3&page=1&tag_operator=OR&date_format=Y-m&grid=masonry", 'h3 a');
    let news: ITitledDocumentInfo[] = [];
    for (let index = 0; index < 6; index++) {
      news[index] = await getTitledFileInfoByATag(elements[index]);
    }
    return news;
  }

  async getMaterialContent(contentPath: string): Promise<string> {
    const url = `https://${process.env.SITE_DOMAIN}/index.php/component/content/article/${contentPath}`
    const htmlContent = await axios.get(url, { ...axiosDefaultConfig, responseType: "document" })
    const document = parse(htmlContent.data);
    document.querySelector("head").innerHTML = `${materialViewerHeader}`
    document.querySelector("body").innerHTML = `${materialViewerBody(process.env.SERVER_ACCESS_URL)}${document.querySelector("body").innerHTML}`
    return document.innerHTML;
  }

  /**
   * Getting calls table
   * @date 3/26/2023 - 2:12:51 AM
   *
   * @async
   * @returns {unknown}
   */
  async getTimeCalls() {
    const linkElement = await getElementsFromPage(`https://${process.env.SITE_DOMAIN}/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah`, "#sppb-addon-1643455125008 > div > div > p > strong > a");
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
    const linkElements = await getElementsFromPage(`https://${process.env.SITE_DOMAIN}/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah`, "#sppb-addon-1632589047342 > div a");
    const files = [];
    for (const index in linkElements) {
      if (Object.prototype.hasOwnProperty.call(linkElements, index)) {
        const element = linkElements[index];
        const pract = await getTitledFileInfoByATag(element);
        files.push(pract)
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
  console.log({ uri, selector })
  try {
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
  } catch (error) {
    console.error(`Not found elements: ${uri} selector:'${selector}'\n\n${error}`)
    if (!(error instanceof HttpException)) {
      await updateProxyAgents(() => { });
      return getElementsFromPage(uri, selector)
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
  if (!!node && !!node.getAttribute("href")) {
    try {
      const linkToFile = node.getAttribute("href")
      const documentResponse = await axios.get(`${linkToFile.startsWith("/") ? `https://${process.env.SITE_DOMAIN}` : ""}${linkToFile}`, { ...axiosDefaultConfig, responseType: "arraybuffer" });
      const docText = Buffer.from(documentResponse.data).toString("utf-8");
      console.log({ linkToFile })
      if (documentResponse.status != 200 || !linkToFile) {
        throw new HttpException('INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const dataType: string = documentResponse.headers['content-type'];

        const lastModifiedDate = getLastMod();

        function getLastMod(): Date {
          if (dataType == "application/pdf") {
            const modDate = /<xmp:ModifyDate>(.*)<\/xmp:ModifyDate>/gm.exec(docText)
            if (!!modDate && modDate.length > 1) {
              return new Date(modDate[1])
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
                'server_viewer': `${process.env.SERVER_ACCESS_URL}/docs-viewer/?file=${url}`,
              },
            },
            'data_type': dataType,
          }
        )
      }
    } catch (error) {
      console.error(`cannot getDoc by a tag: ${node}\n\n${error}`)

      if (!(error instanceof HttpException)) {
        await updateProxyAgents(() => { });
        return await getTitledFileInfoByATag(node)
      }
    }
  } else {
  }

}