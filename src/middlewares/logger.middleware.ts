import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    // 라우터 시작할 때 기록(1)
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || ''; // request header 로 부터 가져온다.

    // 라우터 실행 다 끝나고 기록(비동기) (3)
    response.on('finish', () => {
      // 응답이 끝나면
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
      );
    });

    // 라우터 실행(2)
    next();
  }
}
