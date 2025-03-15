import SQLiteManager from "../sqlite/SQLiteManager.js";

const InsertUser = async (userName, password) => {
  const db = SQLiteManager.getInstance();
  return await db.run("INSERT INTO user (user_name, password) VALUES (?, ?);", [
    userName,
    password,
  ]);
};

const CheckUserExists = async (userName) => {
  const db = SQLiteManager.getInstance();
  const result = await db.get(
    "SELECT COUNT(*) as count FROM user WHERE user_name = ?;",
    [userName]
  );
  return result.count > 0;
};

export { InsertUser, CheckUserExists };
