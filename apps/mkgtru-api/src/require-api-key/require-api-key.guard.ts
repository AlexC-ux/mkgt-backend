import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RequireApiKeyGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const keyName = "authorization" //api key property name
    const headers = context.switchToHttp().getRequest().headers;
    const authHeader:string|undefined = headers[keyName];
    const token = authHeader?.replace("Bearer ","");
    if (token?.length>5) {
      return true
    }else{
      return false
    }
  }
}