## Section 3
### @nestjs/passport
- @UseGuards() 데코레이터를 이용하여 유저를 확인한다.
- guard: 인터셉터 이전에 실행되어 처리된다.

```typescript
/* guard */
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
```

```typescript
/* local-strategy */ 
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', passwordField: 'password' });
  }

  async validate(email: string, password: string, done: CallableFunction) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }

    return done(null, user);
  }
}

```
- validate 함수를 authService에서 구현한다.

```typescript
async validateUser(email: string, password: string) {
  const user = await this.usersRepository.findOne({ where: { email } });
  console.log(email, password, user);

  if (!user) {
    return null;
  }
  const result = await bcrypt.compare(password, user.password);
  if (result) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
}
```
- 하나의 서비스에서 다른 서비스를 DI 하는 것 비추

### local serializer, guard
```typescript
/* local serializer */
serializeUser(user: Users, done: CallableFunction) {
  console.log(user);
  done(null, user.id);
}

async deserializeUser(userId: string, done: CallableFunction) {
  return await this.usersRepository
    .findOneOrFail({
      where: { id: +userId },
      select: ['id', 'email', 'nickname'],
      relations: ['Workspaces'],
    })
    .then((user) => {
      console.log('user', user);
      done(null, user);
    })
    .catch((error) => done(error));
}
```
- express에서 구현한 인증 전략과 같다.
- auth 모듈을 만들어서 만들었던 파일들을 합쳐준다.
- @Injectable() 데코레이터가 붙은 것들은 providers로 설정
- main.ts에서 passport 설정을 추가해준다.
- app module에 auth module을 추가해준다.
- 로그인 한 유저 / 로그인 하지 않은 유저를 식별하기 위해 guard를 구현한다.

### typeorm transaction
- typeorm에서 트랜잭션 사용하는 방법이 여러가지이다. 그 중 queryRunner를 사용한 트랜잭션을 적용한다.
```typescript
async join(email: string, nickname: string, password: string) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  const user = await queryRunner.manager
    .getRepository(Users)
    .findOne({ where: { email } });
  if (user) {
    throw new ForbiddenException('이미 존재하는 사용자입니다');
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  try {
    const returned = await queryRunner.manager.getRepository(Users).save({
      email,
      nickname,
      password: hashedPassword,
    });
    const workspaceMember = queryRunner.manager
      .getRepository(WorkspaceMembers)
      .create();
    workspaceMember.UserId = returned.id;
    workspaceMember.WorkspaceId = 1;
    await queryRunner.manager
      .getRepository(WorkspaceMembers)
      .save(workspaceMember);
    await queryRunner.manager.getRepository(ChannelMembers).save({
      UserId: returned.id,
      ChannelId: 1,
    });
    await queryRunner.commitTransaction();
    return true;
  } catch (error) {
    console.error(error);
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
} 
```
- 위와 같이 try-catch 문을 사용하여 트랜잭션을 처리한다.
- queryRunner를 통해 repository를 불러와야 트랜잭션이 걸린다.

### ParseIntPipe, ParseArrayPipe, PickType
- 의존성 주입 할 때는 constructor 안에 넣어준다.
- parameter로 값 받아올 때 ParseIntPipe를 사용해서 parameter가 자동으로 number로 변환된다.
- parameter로 받아오는 값이 여러개 일 때 ParseArrayPipe를 사용해서 문자열을 배열로 변환한다.
- DTO 작성시 공통되는 부분은 PickType을 사용해서 원하는 값을 추출할 수 있다.

### typeorm 쿼리빌더
- 쿼리가 좀 복잡해지면 sql과 비슷한 쿼리빌더를 사용하면 좋다.
```typescript
async getWorkspaceMember(url: string, id: number) {
  return this.usersRepository
    .createQueryBuilder('user') // entity의 alias
    .where('user.id = :id', { id })
    .innerJoin('user.Workspaces', 'workspaces', 'workspaces.url = :url', {
      url,
    })
    .getOne();
  }
}
```
- getRawMany vs getMany : RawMany는 '객체.키'를 하나의 문자열로 반환하고, Many는 객체: {키: ~}의 형식으로 반환한다.

### 웹소켓 연동하기
- 게이트웨이에서 웹소켓을 처리한다.
- 웹소켓은 namespace 안에 room 이 있는 구조이다.
- 사용자들이 만드는 워크스페이스를 처리하기 위해 정규표현식으로 namespace를 설정

### multer, static, cors
- 이미지 올릴 때 보통 controller에서 처리한다.
- (이미지 여러 개 일 때)FilesInterceptor 를 사용해서 @UploadedFiles()로 파일을 받아온다. (배열)
- static을 사용해서 브라우저에 정적 파일을 제공한다.
- app.enableCors()로 cors 설정(express와 동일)

### 배포 준비하기(빌드, pm2, cross-env)
- 빌드 먼저 하고, nest 시작하면 된다.
- ec2 끄면 배포중인 서버도 꺼지기 때문에 pm2 사용해서 무중단 배포 한다.