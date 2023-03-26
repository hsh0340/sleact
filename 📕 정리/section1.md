## Section1
### 모듈, 컨트롤러 생성하기
- Nest는 컨트롤러, 서비스, 모듈 등을 생성하는 명령어를 제공한다.
```bash
$ nest g mo users 
```
  모듈을 생성하면 Nest가 app module에 새로운 모듈을 추가해준다.
```bash
$ nest g s users
```
  서비스를 생성하면 Nest가 서비스를 생성한 모듈의 providers에 서비스를 추가해준다.
```bash
$ nest g co userse
```
  컨트롤러를 생성하면 Nest가 컨트롤러를 생성한 모듈의 controllers에 컨트롤러를 추가해준다.
  
- @Controller 데코레이터
  - 인자로 라우팅 주소를 받는다. @Controller('users') -> /users로 접근하는 모든 요청은 이 컨트롤러를 거쳐간다.

- @Get, @Post 데코레이터
  - Controller 데코레이터와 마찬가지로 인자로 라우팅 주소를 받는다. @Post('login') -> /users/login 으로 접근하는 모든 요청은 이 컨트롤러를 거쳐간다.
- @Req, @Res 데코레이터
  - request, response를 인자로 사용할 때 사용한다.
  - request, response처럼 express 프레임워크에 의존하는 것은 사용하지 않는 것이 좋다. 또한 request, response에 대해 모르는 것이 테스트 코드를 작성하기에도 좋다.

### Body, Query, Param
- @Body 데코레이터
  - 요청의 body에 들어있는 데이터를 받아올 때 사용한다. (express의 body-parser같은)
  - Nest가 데코레이터를 보고, 데이터를 어디서 어떻게 받아와야 하는지 알아서 처리한다.
  - DTO(Data Transfer Object): 계층간 데이터 전달 객체
    - export default 말고 export class를 사용한다.
    - interface를 잘 사용하지 않고 class를 사용한다. 컴파일(자바스크립트 코드로 변환)하면 인터페이스가 사라지기 때문이다.
- Nest에게 의존성 주입을 맡기기
  - contructor() 안에서 서비스를 주입
- @Query 데코레이터
  - 요청의 인자로 쿼리스트링을 사용할 때 쓰인다.
  - '@Query() query'로 받아오면 query.page, query.Perpage등 query.key 형식으로 필요한 값을 사용할 수 있고, '@Query('page') page'로 받아오면 쿼리스트링에서 key가 page인 value를 개별적으로 사용할 수 있다.
- @Param 데코레이터
  - 요청시 지정한 라우트 파라미터를 읽어올 때 사용한다.

### 나머지 API 설계하기
- API는 한 번 만들고 나면 수정하기가 매우 힘들다.

### API 문서 만들기
- Nest는 Swagger가 작성되어있는 컨트롤러를 읽고 자동으로 API 문서를 만들어준다.
- Express는 타입이 없기 때문에 Swagger가 자동으로 API 문서를 생성해주는 것이 불가능 하다. Express에서 typescript를 적용할 수는 있지만, 요청과 응답, 데이터가 명확하지 않고 자유도가 높기 때문에 Swagger가 자동으로 API 문서를 생성하기에는 어려움이 있다.
```bash
$ npm install --save @nestjs/swagger swagger-ui-express 
```
설치 후에는 main.ts에서 세팅을 해준다.
```typescript
const config = new DocumentBuilder()
    .setTitle('Sleact API')
    .setDescription('Sleact 개발을 위한 API 문서입니다.')
    .setVersion('1.0')
    .addCookieAuth('connect.sid')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
```
- @ApiOperation() 데코레이터
  - 요청 URL에 매핑된 API에 대한 설명을 작성한다.
- @ApiProperty() 데코레이터
  - DTO의 프로퍼티에 대한 설명을 작성한다.
- @ApiQuery() 데코레이터
  - 쿼리스트링으로 데이터를 받아온 경우 이 데이터에 대한 설명을 작성한다.
- @ApiParam() 데코레이터
  - 라우트 파라미터로 받아오는 데이터에 대한 설명을 작성한다.
- @ApiTags() 데코레이터
  - 컨트롤러별로 그룹화 할 때 사용한다.
- @ApiResponse() 데코레이터
  - 응답 시 상태값과 간단한 메시지를 작성한다.
  - API 문서를 작성할 때 response에 대해서 작성하는 것이 좋다. 이 때는 response DTO도 만들어야 swagger가 파악 가능하다. DTO를 사용하면 DTO 자체를 받으면서 validation을 할 수 있는 이점도 있다.
  - DTO 간에는 extends를 통해 중복을 제거하거나 확장할 수 있다.

### 커스텀 데코레이터 만들기
- request, response를 사용하지 않기 위해 custom decorator를 만들 수 있다. 다음 코드는 @User 데코레이터를 만드는 코드이고, 사용하면 request.user를 return 한다.
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```
- response.token을 반환할 경우에는 다음과 같이 코드를 작성하면 @Token 데코레이터를 사용할 수 있다.
```typescript
export const Token = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const response = ctx.switchToHttp().getResponse();
    return response.locals.jwt;
  },
); // @Token() token
```
- controller 단에서 requset, response에 의존했을 때 발생할 수 있는 문제들을 커스텀 데코레이터를 이용하여 방지할 수 있다.
- Nest안에서 http서버만 실행하는 것이 아닌 웹소켓, rpc 서버도 동시에 실행한다. 이 서버들을 하나의 실행 컨텍스트 안에서 관리를 하고, 실행컨텍스트 안에서 http 서버에 대한 정보만 가져오길 원한다면 ctx.switchToHttp()를 사용하여 http에 대한 정보를 가져온다.

### 인터셉터 사용하기
- Interceptor
  - 메서드 전/후로 실행되는 로직이 여러 곳에서 중복되어 사용된다면 이 로직을 따로 분리하여 인터셉터로 만들 수 있다.
  - 컨트롤러에서 return 하는 데이터를 가공할 수 있다. next.handle() 뒤에 작성한다.
  - JSON은 undefined를 무시하기 때문에, 다음과 같이 undefined인 데이터를 컨트롤러가 최종적으로 return 하기 직전에 null로 바꿔주는 인터셉터를 작성한다.
```typescript
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class UndefinedToNullInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // 컨트롤러 가기 전 부분

    return next
      .handle()
      .pipe(map((data) => (data === undefined ? null : data))); // data: 컨트롤러에서 return 하는 데이터
  }
}
```
- pipe가 에러가 났을 때 에러의 정보들을 JSON으로 가공하여 리턴 할 수도 있다. 이 것은 Exception filter로 처리하는 것이 좋다.
- @UseInterceptor 데코레이터
  - 작성한 데코레이터는 컨트롤러 단위에서 사용할 수도 있고, 특정 라우터에서 사용할 수도 있다.

### Q@A(AOP 설명)
- 공통의 관심사를 분리한다. 인터셉터가 AOP 역할을 한다.
