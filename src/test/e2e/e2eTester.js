import net from "net";
import env from "../../configs/env.js";
import logger from "../../util/logger.js";

class e2eTester {
  #socket = new net.Socket();

  constructor(
    userName,
    password,
    requiredSignUp = false,
    clickInterval = 1000
  ) {
    this.userName = userName;
    this.password = password;
    this.requiredSignUp = requiredSignUp;
    this.clickInterval = clickInterval;
  }

  startTest = async () => {
    this.#log(`테스트 시작`);

    if (this.requiredSignUp) {
      this.#log("회원가입 시도");
      const signUpResp = await this.sendHttpRequest("signup", {
        userName: this.userName,
        password: this.password,
      });

      const signUpText = await signUpResp.text();
      this.#log(`회원가입 결과 ${signUpResp.status} => ${signUpText}`);

      if (!signUpResp.ok) {
        this.#log("회원가입 실패로 테스트 종료");
        return; // 즉시 종료
      }
    }

    this.#log("로그인 시도");
    const signInResp = await this.sendHttpRequest("signin", {
      userName: this.userName,
      password: this.password,
    });

    const signInText = await signInResp.text();
    this.#log(`로그인 결과 ${signInResp.status} => ${signInText}`);

    if (!signInResp.ok) {
      this.#log("로그인 실패로 테스트 종료");
      return; // 즉시 종료
    }

    const { sessionId } = JSON.parse(signInText);
    this.#log(`발급 받은 sessionId => ${sessionId}`);

    this.#log("tcp 연결 시도");

    return new Promise((resolve, reject) => {
      this.#socket.connect(env.TCP_PORT, "127.0.0.1", async () => {
        this.#log("tcp 연결 성공. 인증 시도");
        this.#socket.write(JSON.stringify({ sessionId }));
      });

      this.#socket.on("data", async (data) => {
        this.#log(`수신된 데이터 => ${data.toString()}`);

        if (!this.authorized) {
          const authorizedInfo = JSON.parse(data.toString());

          if (!authorizedInfo || !authorizedInfo.success) {
            this.#log("인증 실패로 테스트 종료");
            this.#socket.destroy();
            reject(new Error("TCP 인증 실패")); // 함수 종료
            return;
          }

          this.#log(`인증 완료.`);
          this.authorized = true;
        }

        this.intervalKey = setInterval(async () => {
          if (this.#socket && !this.#socket.destroyed) {
            await this.#socket.write("\n");
          } else {
            clearInterval(this.intervalKey);
            this.#log("클릭 인터벌 제거됨");
          }
        }, this.clickInterval);
      });

      this.#socket.on("close", () => {
        this.#log("TCP 연결 종료됨");
        resolve();
      });

      this.#socket.on("error", (err) => {
        this.#log(`TCP 연결 오류: ${err.message}`);
        reject(err);
      });
    });
  };

  #log = (msg) => {
    logger.debug(`e2eTester ${this.userName} : ${msg}`);
  };

  async sendHttpRequest(api, data) {
    const response = await fetch(`http://127.0.0.1:${env.HTTP_PORT}/${api}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return response;
  }
}

export default e2eTester;
