import { isBanned } from "../../db/clickGame.js";
import { GetSession } from "../../db/session.js";

const authorizeHandler = async (socket, payload) => {
  const { sessionId } = payload;
  const result = { success: true };

  const sessionInfo = GetSession(sessionId);

  if (!sessionInfo || new Date(sessionInfo.expires_at) <= new Date()) {
    result.success = false;
    result.message = "유효하지 않은 세션입니다.";
  } else if (await isBanned(sessionInfo.user_seq_no)) {
    result.success = false;
    result.message = "실격된 유저 입니다.";
  } else {
    socket.sessionId = sessionId;
    socket.userId = sessionInfo.user_seq_no;
    socket.authorized = true;
  }

  await socket.write(JSON.stringify(result));
  await socket.destroy();
};

export default authorizeHandler;
