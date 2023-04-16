import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActive(context: ExecutionContext): Promise<boolean> {
    const can = await super.canActivate(context);

    if (can) {
      const request = context.switchToHttp().getRequest(); // context 로 부터 http 꺼내와서
      console.log('login for cookie');
      await super.logIn(request);
    }

    return true;
  }
}
