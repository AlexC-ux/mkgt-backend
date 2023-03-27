export function LogRequest(req: {httpVersion:string,method:string, url:string, response:any},res:any,next:()=>void) {
    console.log(buildLogString({path:req.url, method:req.method, ip:"", httpV:req.httpVersion}))
    next();
}

function buildLogString(params: { path: string, method:string, ip:string, httpV:string }): string {
    return `${new Date().toLocaleString("ru")} ${params.ip} ${params.method} ${params.httpV} ${params.path}`
}