import SQLiteManager from "../sqlite/SQLiteManager.js";

/**
 * 세션 검사 (이미 로그인된 유저인지 확인, 만료된 세션은 자동 삭제)
 * @param {string} userName
 * @returns {Promise<boolean>} 이미 로그인된 유저면 true, 아니면 false
 */
const IsUserLoggedIn = async (userName) => {
  const db = SQLiteManager.getInstance();
  const user = await db.get("SELECT seq_no FROM user WHERE user_name = ?;", [
    userName,
  ]);

  if (!user) return false;

  // 유저의 현재 활성 세션 확인 (만료된 세션은 자동 무효화)
  const activeSession = await db.get(
    "SELECT session_id, expires_at FROM session WHERE user_seq_no = ?;",
    [user.seq_no]
  );

  if (!activeSession) return false;

  // 세션이 만료된 경우 삭제 후 로그인 가능하도록 처리
  if (new Date(activeSession.expires_at) <= new Date()) {
    await db.run("DELETE FROM session WHERE session_id = ?;", [
      activeSession.session_id,
    ]);
    return false;
  }

  return true;
};

/**
 * 세션 등록 (로그인 시 생성)
 * @param {string} userName
 * @param {string} sessionId
 * @param {number} expiresInSeconds (세션 만료 시간, 초 단위)
 */
const CreateSession = async (userName, sessionId, expiresInSeconds) => {
  const db = SQLiteManager.getInstance();

  // 유저 정보 가져오기
  const user = await db.get("SELECT seq_no FROM user WHERE user_name = ?;", [
    userName,
  ]);
  if (!user) {
    throw new Error("존재하지 않는 계정입니다.");
  }

  // 만료 시간 설정
  const expiresAt = new Date(
    Date.now() + expiresInSeconds * 1000
  ).toISOString();

  // 새로운 세션 등록
  await db.run(
    "INSERT INTO session (session_id, user_seq_no, expires_at) VALUES (?, ?, ?);",
    [sessionId, user.seq_no, expiresAt]
  );
};

/**
 * 세션 유효성 검사 (만료된 세션 자동 삭제)
 * @param {string} sessionId
 * @returns {Promise<boolean>} 세션이 유효하면 true, 아니면 false
 */
const CheckSession = async (sessionId) => {
  const db = SQLiteManager.getInstance();
  const session = await db.get(
    "SELECT session_id, expires_at FROM session WHERE session_id = ?;",
    [sessionId]
  );

  if (!session) return false;

  // 세션이 만료된 경우 삭제 후 false 반환
  if (new Date(session.expires_at) <= new Date()) {
    await db.run("DELETE FROM session WHERE session_id = ?;", [
      session.session_id,
    ]);
    return false;
  }

  return true;
};

/**
 * 세션 해제 (로그아웃 시 삭제)
 * @param {string} sessionId
 */
const DeleteSession = async (sessionId) => {
  const db = SQLiteManager.getInstance();
  await db.run("DELETE FROM session WHERE session_id = ?;", [sessionId]);
};

export { CreateSession, CheckSession, DeleteSession, IsUserLoggedIn };
