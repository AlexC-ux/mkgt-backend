import axios, { AxiosRequestConfig } from "axios";
const SocksAgent = require('axios-socks5-agent')
import { axiosDefaultConfig } from "../mkgtru-api.service";
const tunnel = require("tunnel")

export interface IPRoxy { ip: string, port: string, protocols: string[] }
const blacklistedIPs: IPRoxy[] = []
export interface IAgents { httpsAgent: any }

const controller = new AbortController();
let started = false;
let updated = false;
export async function updateProxyAgents(callback: (cfg: AxiosRequestConfig) => void) {
    if (!started) {
        started = true;
        console.log("started")
        const proxies = await axios.get("https://proxylist.geonode.com/api/proxy-list?limit=100&page=1&sort_by=speed&sort_type=asc&protocols=http%2Chttps%2Csocks5");
        const proxy_list: { ip: string, port: string, protocols: string[] }[] = proxies.data.data

        const count = proxy_list.length;

        for (let index = 0; index < proxy_list.length; index++) {
            const proxy = proxy_list[index];
            if (!blacklistedIPs.includes(proxy)) {
                console.log(`${index + 1}/${count}`)
                const config: AxiosRequestConfig = { ...axiosDefaultConfig, ...getTunnelingAgent(proxy), timeout: 0, validateStatus: () => true };
                try {
                    axios.get("https://mkgt.ru/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah/", { ...config, signal: controller.signal }).then((resp) => {
                        if (resp.status == 200) {
                            if (!updated) {


                                updated = true;
                                setTimeout(() => { updated = false; started = false; }, 10000)
                                controller.abort();
                                console.log("proxy updated")
                                console.log({ proxy: `${proxy.protocols} ${proxy.ip} ${proxy.port}` })
                                callback(config);
                                return;
                            }
                        } else { blacklistedIPs.push(proxy) }
                    }).catch((err) => { blacklistedIPs.push(proxy) })
                } catch (error) {
                    blacklistedIPs.push(proxy)
                }
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
    else if (proxy.protocols.includes("https")) {
        return {
            httpsAgent: tunnel.httpsOverHttps({
                proxy: {
                    host: proxy.ip,
                    port: proxy.port,
                }
            })
        }
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
    } else {
        throw new Error("UnknownProxyType: " + proxy.protocols);
    }
}