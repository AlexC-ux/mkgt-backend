import { Request, Response, NextFunction } from 'express';
export function LogRequest(req: Request, res: Response, next: NextFunction) {
    console.log(buildLogString({path:req.url, method:req.method, ip:req.ip, httpV:req.httpVersion, token:`${req.headers.authorization}`}))
    next();
}

function buildLogString(params: { path: string, method:string, ip:string, httpV:string, token:string }): string {
    return `${new Date().toLocaleString("ru")} ${params.ip} ${params.method} ${params.httpV} ${params.path} ${params.token}`
}