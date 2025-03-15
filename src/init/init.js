import logger from "../util/logger.js";
import SQLiteManager from "../sqlite/SQLiteManager.js";

const initialize = async () => {
  await import("../configs/env.js");
  logger.info("환경변수 초기화 완료");
  await SQLiteManager.getInstance();
  logger.info("SQLiteManager 초기화 완료");
};

export default initialize;
