import axios, { AxiosRequestConfig } from "axios";
const SocksAgent = require('axios-socks5-agent')
import { axiosDefaultConfig } from "../mkgtru-api.service";
const tunnel = require("tunnel")

export interface IPRoxy { ip: string, port: string, protocols: string[] }
export interface IAgents { httpsAgent: any }

export async function updateProxyAgents(callback: (cfg:AxiosRequestConfig) => void) {
    console.log("started")
    const proxies = await axios.get("https://proxylist.geonode.com/api/proxy-list?limit=500&page=1&sort_by=responseTime&sort_type=asc&protocols=http");
    const proxy_list = proxies.data.data

    const count = proxy_list.length;
    let updated = false;
    for (let index = 0; index < proxy_list.length; index++) {
        const proxy = proxy_list[index];
        console.log(`${index}/${count}`)
        const config: AxiosRequestConfig = { ...axiosDefaultConfig, ...getTunnelingAgent(proxy), timeout: 0, validateStatus: () => true };
        try {
            await axios.get("https://mkgt.ru/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah/", config).then((resp) => {
                if (resp.status == 200) {
                    if (!updated) {
                        console.log("proxy updated")
                        callback(config);
                        updated = true;
                        return;
                    }
                } else { }
            }).catch((err) => { })
        } catch (error) {

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
    else if (proxy.protocols.includes("http")) {
        return {
            httpsAgent: tunnel.httpsOverHttp({
                proxy: {
                    host: proxy.ip,
                    port: proxy.port,
                }
            })
        };
    } else if (proxy.protocols.includes("https")) {
        return {
            httpsAgent: tunnel.httpsOverHttps({
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