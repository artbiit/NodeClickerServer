import { CheckUserExists, GetUserPassword } from "../../db/user.js";
import { CreateSession, IsUserLoggedIn } from "../../db/session.js";
import { randomUUID } from "crypto";

export default async (data) => {
  const { userName, password } = data;
  let statusCode = 200;
  let message = undefined;
  let sessionId = undefined;

  if (!userName || userName == "") {
    statusCode = 400;
    message = "계정을 입력 해주세요.";
  } else if (!password || password == "") {
    statusCode = 400;
    message = "비밀번호를 입력 해주세요.";
  } else if (!(await CheckUserExists(userName))) {
    statusCode = 401;
    message = "존재하지 않는 계정입니다.";
  } else if (await IsUserLoggedIn(userName)) {
    statusCode = 409;
    message = "이미 로그인된 계정입니다.";
  } else {
    const storedPassword = await GetUserPassword(userName);

    if (storedPassword !== password) {
      statusCode = 401;
      message = "비밀번호가 일치하지 않습니다.";
    } else {
      sessionId = randomUUID();
      await CreateSession(userName, sessionId, 300); // 세션 5분간 유지
      message = "로그인 성공!";
    }
  }

  return [statusCode, { message, sessionId }];
};
