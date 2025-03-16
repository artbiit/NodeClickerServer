# NodeClickerServer
내장 모듈로만 작업하는 클리커 서버


# 개발 환경
|이름|설명|
|----|----|
|node.js|v22.8.0|
|OS|Windows|
|module| es6 module|

# 실행 방법

패키지 매니저를 사용하지 않으므로 매번 작성하기 귀찮아 스크립트를 작성해놨습니다.

|OS|Script|
|--|--|
|Windows|start.bat|
|Linux|start.sh|

# 테스트 방법

## 단위 테스트

> src/test/unit 하위의 종류별 테스트파일을 실행하시면 됩니다.

## 전체 테스트

> src/test/e2e/e2e.test.js 파일을 실행하시면 됩니다.

주석으로 db생성 및 서버 구동에 대한 선택도 가능하도록 설명을 작성해놨습니다.


### 정상 종료 예시
아래와 같이 게임이 종료되면 수신을 받게 됩니다.

``` bash
[2025-03-16T09:23:13.669Z] [MASTER] [47072] [INFO] e2eTester testUser6 : 테스트 시작
[2025-03-16T09:23:13.669Z] [MASTER] [47072] [INFO] e2eTester testUser6 : 회원가입 시도
[2025-03-16T09:23:13.676Z] [MASTER] [47072] [INFO] e2eTester testUser6 : 회원가입 결과 200 => {"message":"성공적으로 가입했습니다."}
[2025-03-16T09:23:13.676Z] [MASTER] [47072] [INFO] e2eTester testUser6 : 로그인 시도
[2025-03-16T09:23:13.679Z] [MASTER] [47072] [INFO] e2eTester testUser6 : 로그인 결과 200 => {"message":"로그인 성공!","sessionId":"1132e93e-52d9-49d8-9a46-3b0849eab1e4"}
[2025-03-16T09:23:13.679Z] [MASTER] [47072] [INFO] e2eTester testUser6 : 발급 받은 sessionId => 1132e93e-52d9-49d8-9a46-3b0849eab1e4
[2025-03-16T09:23:13.679Z] [MASTER] [47072] [INFO] e2eTester testUser6 : tcp 연결 시도
[2025-03-16T09:23:13.681Z] [MASTER] [47072] [INFO] e2eTester testUser6 : tcp 연결 성공. 인증 시도
[2025-03-16T09:23:13.682Z] [MASTER] [47072] [INFO] e2eTester testUser6 : 수신된 데이터 => {"success":true}
[2025-03-16T09:23:13.682Z] [MASTER] [47072] [INFO] e2eTester testUser6 : 인증 완료.
[2025-03-16T09:23:14.792Z] [MASTER] [47072] [INFO] e2eTester testUser6 : 클릭 이벤트 전송
...
[2025-03-16T09:24:14.481Z] [MASTER] [47072] [INFO] e2eTester testUser6 : 클릭 이벤트 전송
[2025-03-16T09:24:14.795Z] [MASTER] [47072] [INFO] e2eTester testUser6 : 수신된 데이터 => {"status":"finished","message":"게임 종료","totalClicks":55}
[2025-03-16T09:24:14.796Z] [MASTER] [47072] [INFO] e2eTester testUser6 : TCP 연결 종료됨
[2025-03-16T09:24:15.591Z] [MASTER] [47072] [INFO] e2eTester testUser6 : 클릭 인터벌 제거됨

```

### 실격 예시
빈번한 클릭으로 실격되거나 10초 이벤트로 실격처리될 수 있습니다.

``` bash
[2025-03-16T09:29:09.052Z] [MASTER] [13508] [INFO] e2eTester testUser10 : 클릭 이벤트 전송
[2025-03-16T09:29:09.053Z] [MASTER] [13508] [INFO] e2eTester testUser10 : 수신된 데이터 => {"status":"disqualified","message":"초당 4회 초과","totalClicks":5}
[2025-03-16T09:29:09.055Z] [MASTER] [13508] [INFO] e2eTester testUser10 : TCP 연결 종료됨
```

### 실격자 재도전 예시

실격 처리된 유저는 즉시 테스트가 종료됩니다.

``` bash
[2025-03-16T09:28:49.350Z] [MASTER] [40948] [INFO] e2eTester testUser1 : tcp 연결 성공. 인증 시도
[2025-03-16T09:28:49.351Z] [MASTER] [40948] [INFO] e2eTester testUser1 : 수신된 데이터 => {"success":false,"message":"실격된 유저 입니다."}
[2025-03-16T09:28:49.351Z] [MASTER] [40948] [INFO] e2eTester testUser1 : 인증 실패로 테스트 종료
```


----

# HTTP API

|ROUTE|METHOD|PAYLOAD|RESPONSE|
|-|-|-|-|
|/worker|GET|NONE|"{"worker_id" : ["master"/{cluster_id}]}}"|
|/signup|POST|{"userName":계정, "password": 비밀번호}|{"success":[true/false], ("message:"")}|
|/signin|POST|{"userName":계정, "password": 비밀번호}|{"success":[true/false], ("message:""), ("sessionId":"string-string-string-string-string")}|
|/signout|POST|{"sessionId": 발급 받은 세션id}|{"message:""}|

---

# TCP EVENT

별도로 payload를 구성할 필요가 없다고 판단해서 간단하게 로직을 구성했습니다.

## 인증 전
첫 번째 수신 데이터는 인증시도로 취급합니다. 즉, 인증 실패시 바로 연결을 해제합니다.

## 인증 후
이후 오는 데이터는 어떤 데이터든 클릭으로 취급합니다.

