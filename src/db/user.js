import SQLiteManager from "../sqlite/SQLiteManager.js";

const InsertUser = async (userName, password) => {
  const db = SQLiteManager.getInstance();
  return await db.execute(
    "INSERT INTO user (user_name, password) VALUES (?, ?);",
    [userName, password]
  );
};

const CheckUserExists = async (userName) => {
  const db = SQLiteManager.getInstance();
  const result = await db.get(
    "SELECT COUNT(*) as count FROM user WHERE user_name = ?;",
    [userName]
  );
  return result.count > 0;
};

/**
 * 특정 유저의 비밀번호 가져오기
 * @param {string} userName
 * @returns {Promise<string | null>} 유저 비밀번호 반환 (없으면 null)
 */
const GetUserPassword = async (userName) => {
  const db = SQLiteManager.getInstance();
  const result = await db.get(
    "SELECT password FROM user WHERE user_name = ?;",
    [userName]
  );
  return result ? result.password : null;
};

/**
 * 해당 유저 명칭의 모든 정보 가져오기
 * @param {string} userName
 * @return {Promise<Object | null>} 유저 db 정보
 */
const GetUser = async (userName) => {
  const db = SQLiteManager.getInstance();
  const result = await db.get("SELECT * FROM user WHERE user_name = ?;", [
    userName,
  ]);
  return result ?? null;
};

export { InsertUser, CheckUserExists, GetUserPassword, GetUser };
