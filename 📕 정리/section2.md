## Section2
### typeorm entity
- db가 만들어져있다면 ```typeorm-model-generator```를 통해 자동으로 entity 파일을 만들 수 있다.
```bash
$ npx typeorm-model-generator -h [host] -d [database] -u [user] -x [password] -e [database]
```
- 테이블의 각 컬럼은 데코레이터를 통해 entity class의 프로퍼티와 대응되어서, 프로퍼티 명이 꼭 컬럼명과 일치하지 않아도 된다.
- entity 파일을 먼저 만들고 typeorm을 연결할 때 db를 만드는 것도 가능하다.
- pk에는 @PrimaryGeneratedColumn()을 붙여줘야한다.

### typeorm 관계 설정하기
- 일대다 관계는 부모테이블에서 @OneToMany, 자식테이블에서 @ManyToOne과 fk에 @JoinColumn 데코레이터를 사용한다.
- 다대다 관계는 @ManyToMany 데코레이터를 사용하는데, typeorm에서 다대다 관계 설정시 일대다 2개로 나누면 된다.
- 다대다 관계 설정시 한쪽 테이블에 @JoinTable 데코레이터를 사용하여 중간 테이블을 넣어준다.
- @CreatedDateColumn(), @UpdatedDateColumn(), @DeleteDateColumn() 처럼 생성시간, 업데이트시간, soft delete 시간을 지원하는 데코레이터가 있다.
- 두 개의 테이블을 동시에 수정할 때는 cascade 옵션을 사용해야한다.

### typeorm 커넥션 맺기
- entity에 스웨거 설정 해주면 DTO 만들 때 entity 가져다 쓸 수도 있다.
- typeorm 설치
```bash
$ npm install --save @nestjs/typeorm typeorm mysql2
```
- app module의 imports에서 typeorm 설정을 해준다.
```typescript
imports: [
  TypeOrmModule.forRoot({ 
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    ...
    synchronize: false,
  }),
...
]
```
- synchronize: true 이면 entity 파일들이 db로 옮겨진다. (데이터 유실 주의)
- autoLoadEntities: TypeOrmModule.forFeature([]) 안에 있는 entity 들을 자동으로 불러온다.

### typeorm seeding, migration
- migration: 테이블을 만든 후에 바꾸거나, 실수하는 경우를 대비해 롤백할 때를 위해 사용하는 기능
- seeding: 초기 데이터를 생성하는 기능
```bash
$ npm i typeorm-extension 
```
- typeorm extension은 app.module에 있는 typeorm 설정을 읽을 수 없기 때문에 datasource를 따로 작성해주어야 한다.
- seeds는 datasource를 통해 repository를 불러온 다음, 쿼리를 작성하면 된다.
- faker와 typeorm의 seed를 함께 사용하면 좋다.
- migration up: 실제 수행할 내용, down: 실수하는 경우 롤백


### 회원가입 만들기
- DTO 만들 때 ```extends PickType(Users, ['email', 'nickname', 'password'] as const)``` 로 entity에서 필요한 프로퍼티들을 뽑아서 사용할 수 있다.
- DB도 DI를 해준다. entity에 쿼리를 날리는 클래스는 repository 이다.
```typescript
 if (!email) {
  // 이메일 없다고 에러
  throw new Error('이메일이 없네요.')
}

if (!nickname) {
  // 닉네임 없다고 에러
  throw new Error('닉네임이 없네요.')
}

if (!password) {
  // 비밀번호 없다고 에러
  throw new Error('비밀번호가 없네요.')
}
```
- 유저로 부터 받아온 입력 값을 서비스단에서 유효성 검사를 할 수도 있지만, dto단에서 체크할 수 있다.
- 에러 나는 경우는 service에서 throw 한다. async 함수 안에서 throw 해도 자동으로 catch 돼서 정상적으로 실행된다.

### Exception Filter
```typescript
 if (!email) {
  // 이메일 없다고 에러
  throw new HttpException('이메일이 없네요.', 400);
}

if (!nickname) {
  // 닉네임 없다고 에러
  throw new HttpException('닉네임이 없네요.', 400);
}

if (!password) {
  // 비밀번호 없다고 에러
  throw new HttpException('비밀번호가 없네요.', 400);
}
```
- 위의 코드처럼 nest에서 제공하는 HttpException을 사용해도 똑같이 200을 return한다. 에러를 캐치해 줄 수 있는 존재가 필요하다. -> 예외처리 하는 exception filter를 사용해야한다.
- 에러가 나면 exception filter가  실행된다.
- main.ts에서 ```app.useGlobalFilters(new HttpExceptionFilter());``` 로 등록하면 모든 컨트롤러에서 발생하는 exception을 exception filter가 처리한다.
- 서비스에서 발생하는 에러를 컨트롤러에서 뱉으려면 컨트롤러에서 서비스 메서드를 호출할 때 await 를 붙여야 한다.

### class-validator
- HttpException을 상태코드별로 상속한 Exception을 사용하면 상태코드를 명시하지 않아도 된다.
```typescript
 if (!email) {
  // 이메일 없다고 에러
  throw new BadRequestException('이메일이 없네요.');
}

if (!nickname) {
  // 닉네임 없다고 에러
  throw new BadRequestException('닉네임이 없네요.');
}

if (!password) {
  // 비밀번호 없다고 에러
  throw new BadRequestException('비밀번호가 없네요.');
}
```
- 들어오는 데이터는 dto에서 자동으로 검증하는 것이 좋다.
```bash
$ npm i class-validator
```
- class-validator는 validation을 데코레이터로 할 수 있다.
- 동작하려면 main.ts에서 ```app.useGlobalPipes(new ValidationPipe());``` 을 작성해준다. class-validator 가 붙어있는 dto는 알아서 검증해준다.
- 에러처리 전문으로는 exception filter와 class-validator를 사용하는 것이 좋다.
- 인터셉터는 컨트롤러/서비스 앞/뒤에서 사용되고, exception filter는 컨트롤러 뒤에서 실행된다.
- request lifecycle을 잘 알아두자.