import axios, { AxiosRequestConfig } from "axios";
import parse from "node-html-parser";
const SocksAgent = require('axios-socks5-agent')
import { axiosDefaultConfig } from "../mkgtru-api.service";
const tunnel = require("tunnel")

export interface IPRoxy { ip: string, port: string, protocols: string[] }

export interface IAgents { httpsAgent: any }

let proxyUpdateStarted = false

export async function updateProxyAgents(callback: (cfg: AxiosRequestConfig) => void) {
    if (!proxyUpdateStarted) {
        proxyUpdateStarted = true;

        const controller = new AbortController();
        console.log("started")
        const proxies = await axios.get("https://sslproxies.org/");
        const root = parse(proxies.data)
        const rows = root.querySelectorAll("tbody tr")
        const proxy_list: { ip: string, port: string, protocols: string[] }[] = rows.map(element => {
            const columns = element.querySelectorAll("td");
            return {
                ip: columns[0].innerText,
                port: columns[1].innerText,
                protocols: [`${columns[6].innerText == "yes" ? "https" : "http"}`]
            }
        }
        )

        const count = proxy_list.length;

        for (let index = 0; index < proxy_list.length; index++) {
            const proxy = proxy_list[index];
            console.log(`${index + 1}/${count}`)
            const config: AxiosRequestConfig = { ...axiosDefaultConfig, ...getTunnelingAgent(proxy), timeout: 0, validateStatus: () => true };
            try {
                axios.get("https://mkgt.ru/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah/", { ...config, signal: controller.signal }).then((resp) => {
                    if (resp.status == 200) {
                        console.log("proxy updated")
                        console.log({ proxy: `${proxy.protocols} ${proxy.ip} ${proxy.port}` })
                        callback(config);
                        controller.abort();
                        proxyUpdateStarted=false;
                        return;
                    }
                }).catch((err) => { })
            } catch (error) {

            }
        }
    }
}

function getTunnelingAgent(proxy: IPRoxy): IAgents {
    if (proxy.protocols.includes("socks5")) {
        const { httpAgent, httpsAgent } = SocksAgent({
            agentOptions: {
                keepAlive: true,
            },
            // socks5
            host: proxy.ip,
            port: proxy.port,
        })
        return { httpsAgent }
    }
    else if (proxy.protocols.includes("https") || proxy.protocols.includes("http")) {
        return {
            httpsAgent: tunnel.httpsOverHttp({
                proxy: {
                    host: proxy.ip,
                    port: proxy.port,
                }
            })
        }
    } else {
        throw new Error("UnknownProxyType: " + proxy.protocols);
    }
}