import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ChannelsModule } from './channels/channels.module';
import { DmsModule } from './dms/dms.module';

// main.ts 에서 처음으로 오는 곳
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), UsersModule, WorkspacesModule, ChannelsModule, DmsModule], // 기본적으로 모듈은 import만 하면 됨. 가끔 forRoot, forFeature들이 붙는 경우가 있는데 설정 해야 하는 경우이다.
  controllers: [AppController],
  providers: [AppService, ConfigService], // 여기서 ConfigService 를 등록하면 app module 안에서 config service를 주입받아서 쓸 수 있다.
})
export class AppModule implements NestModule {
  // NestModule을 구현한다.
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
