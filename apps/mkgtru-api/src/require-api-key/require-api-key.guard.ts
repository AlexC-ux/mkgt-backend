import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaClient } from '@prisma/client';
@Injectable()
export class RequireApiKeyGuard implements CanActivate {
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const keyName = "authorization" //api key property name
    const headers = context.switchToHttp().getRequest().headers;
    const authHeader:string|undefined = headers[keyName];
    const token = authHeader?.replace("Bearer ","");

    const prisma = new PrismaClient();
    const user = await prisma.users.findUnique({
      where:{
        token:`${token}`
      }
    })
    prisma.$disconnect();

    if (!!user) {
      return true
    }else{
      return false
    }
  }
}