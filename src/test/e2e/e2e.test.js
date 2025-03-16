import e2eTester from "./e2eTester.js";
import env from "../../configs/env.js";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer(url, retries = 10) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return true; // 서버 정상 응답
    } catch (err) {
      console.log(`서버 대기 중... (${i + 1}/${retries})`);
    }
    await sleep(1000); // 1초 대기 후 재시도
  }
  throw new Error("서버가 응답하지 않습니다.");
}

//db 및 테이블이 경우 아래 주석 제거로 db 생성
//import("../../sqlite/migration/migration.js");

//서버 실행을 별도로 하지 않고 테스트 코드에서 함께하려면 아래 주석 제거
//import("../../index.js");

//서버 구동 확인
await waitForServer(`http://127.0.0.1:${env.HTTP_PORT}/worker`);

//userName, password, 회원가입 시도 여부, 클릭 인터벌
const test = new e2eTester("testUser10", "1234", true, 200);
await test.startTest();
