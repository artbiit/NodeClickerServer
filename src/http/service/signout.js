import { DeleteSession } from "../../db/session.js";

export default async (data) => {
  const { sessionId } = data;
  let statusCode = 200;
  let message = undefined;

  if (!sessionId || sessionId == "") {
    statusCode = 400;
    message = "세션 ID가 필요합니다.";
  } else {
    await DeleteSession(sessionId);
    message = "로그아웃 성공!";
  }

  return [statusCode, { message }];
};
