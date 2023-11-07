import { Request, Response, NextFunction, query } from 'express';
export function LogRequest(req: Request, res: Response, next: NextFunction) {
    console.info(buildLogString({path:req.url, method:req.method, ip:req.ip, httpV:req.httpVersion, token:`${req.headers.authorization}`, query:req.query}))
    next();
}

function buildLogString(params: { path: string, method:string, ip:string, httpV:string, token:string, query:Object }): string {
    return `${new Date().toLocaleString("ru")} ${params.ip} ${params.method} ${params.httpV} ${params.path} ${JSON.stringify(params.query)} ${params.token}`
}