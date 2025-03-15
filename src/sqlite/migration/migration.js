import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import SQLiteManager from "../SQLiteManager.js";
import logger from "../../util/logger.js";

const MIGRATION_FILE = "db.sql";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    const db = SQLiteManager.getInstance();
    const filePath = path.resolve(__dirname, MIGRATION_FILE);

    if (!fs.existsSync(filePath)) {
      logger.error(`파일을 찾을 수 없음: ${filePath}`);
      return;
    }

    const sqlContent = fs.readFileSync(filePath, "utf8");
    const queries = sqlContent
      .split(/;/)
      .map((q) => q.trim())
      .filter((q) => q);

    logger.info("마이그레이션 시작");

    await db.transaction((trxDb) => {
      for (const query of queries) {
        trxDb.exec(query);
      }
    });

    logger.info("마이그레이션 완료");
  } catch (error) {
    logger.error(`마이그레이션 실패: ${error.message}`);
  }
}

runMigrations();
