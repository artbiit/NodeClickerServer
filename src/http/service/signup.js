import { CheckUserExists, InsertUser } from "../../db/user.js";

export default async (data) => {
  const { userName, password } = data;
  let statusCode = 200;
  let message = undefined;

  if (!userName || userName == "") {
    statusCode = 400;
    message = "계정을 입력 해주세요.";
  } else if (!password || password == "") {
    statusCode = 400;
    message = "비밀번호를 입력 해주세요.";
  } else if (await CheckUserExists(userName)) {
    statusCode = 409;
    message = "이미 존재하는 계정입니다.";
  } else {
    await InsertUser(userName, password);
    message = "성공적으로 가입했습니다.";
  }

  return [statusCode, { message }];
};
