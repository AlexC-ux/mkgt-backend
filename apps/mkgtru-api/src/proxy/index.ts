import axios from "axios";
import Socks5Agent from "axios-socks5-agent";
import { axiosDefaultConfig } from "../mkgtru-api.service";
const tunnel = require("tunnel")

export interface IPRoxy { ip: string, port: string, protocols: string[] }
export interface IAgents { httpsAgent: any, httpAgent?: any }

export async function getProxyAgents(): Promise<IAgents> {
    console.log("started")
    const proxies = await axios.get("https://proxylist.geonode.com/api/proxy-list?limit=500&page=1&sort_by=responseTime&sort_type=asc&protocols=http%2Chttps%2Csocks5");
    const proxy_list = proxies.data.data

    const count = proxy_list.length;
    for (let index = 0; index < proxy_list.length; index++) {
        const proxy = proxy_list[index];
        console.log(`${index}/${count}`)
        const config = { ...axiosDefaultConfig, ...getTunnelingAgent(proxy) };
        return axios.get("https://mkgt.ru",).then((resp) => {
            if (resp.status == 200) {
                console.log({ proxy })
                return { httpsAgent: config.httpsAgent, httpAgent: config.httpAgent };
            } else {
                console.log(`${proxy.ip} not`)
            }
        })
    }

    function getTunnelingAgent(proxy: IPRoxy): IAgents {
        if (proxy.protocols.includes("SOCKS5")) {
            return Socks5Agent({
                host: proxy.ip,
                port: Number(proxy.port),
                agentOptions: {
                    keepAlive: true,
                }
            })
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
        }
    }
}