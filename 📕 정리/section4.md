## Section 4
### 유닛 테스팅 하기
- tdd 하면 체계적으로 프로그램 작성 가능하다. (만병통치약은 아님 ;;)
- 그래도 테스트 꼼꼼하게 짜는 것이 좋다.
- 서비스코드에서 실제 repository를 주입하고 있기 때문에 모킹 한다. (가짜 레파지토리를 사용하는 것)
- describe: 하나의 테스트 묶음

```typescript
class MockUserRepository {
  #data = [{ id: 1, email: 'zerohch0@gmail.com' }];
  findOne({ where: { email } }) {
    const data = this.#data.find((v) => v.email === email);
    if (data) {
      return data;
    }
    return null;
  }
}
```
- 위와 같이 mock 레파지토리를 만들어준다. 

### e2e 테스트
- e2e 테스트는 소스와 무관하고, 요청과 응답에 관한 테스트를 한다.
- e2e 테스트도 마찬가지로 실제 db에 접속하기 때문에 test용 db를 연결하여 테스트 할 것. 
- jest는 개발자가 지정한 경로를 못찾기 때문에 모듈매퍼를 사용해야한다.
- supertest로 테스트한다.
- 마지막에 done 해줘야 테스트가 끝난다.