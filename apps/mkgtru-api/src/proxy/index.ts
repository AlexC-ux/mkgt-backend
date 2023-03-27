import axios, { AxiosRequestConfig } from "axios";
const SocksAgent = require('axios-socks5-agent')
import { axiosDefaultConfig } from "../mkgtru-api.service";
const tunnel = require("tunnel")

export interface IPRoxy { ip: string, port: string, protocols: string[] }
const blacklistedIPs: IPRoxy[] = []
export interface IAgents { httpsAgent: any }

const controller = new AbortController();

export async function updateProxyAgents(callback: (cfg: AxiosRequestConfig) => void) {
    console.log("started")
    const proxies = await axios.get("https://proxylist.geonode.com/api/proxy-list?limit=500&page=1&sort_by=responseTime&sort_type=asc&protocols=http");
    const proxy_list: { ip: string, port: string, protocols: string[] }[] = shuffle(proxies.data.data)

    const count = proxy_list.length;
    let updated = false;
    for (let index = 0; index < proxy_list.length; index++) {
        const proxy = proxy_list[index];
        if (!blacklistedIPs.includes(proxy)) {
            console.log(`${index}/${count}`)
            const config: AxiosRequestConfig = { ...axiosDefaultConfig, ...getTunnelingAgent(proxy), timeout: 0, validateStatus: () => true };
            try {
                axios.get("https://mkgt.ru/index.php/nauka/raspisania-i-izmenenia-v-raspisaniah/", { ...config, signal: controller.signal }).then((resp) => {
                    if (resp.status == 200) {
                        if (!updated) {
                            updated = true;
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


function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}