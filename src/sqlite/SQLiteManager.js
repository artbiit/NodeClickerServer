import { DatabaseSync } from "node:sqlite";
import { EventEmitter } from "events";
import logger from "../util/logger.js";

class SQLiteManager extends EventEmitter {
  static instance;

  constructor(dbFilePath = "db.sqlite") {
    if (SQLiteManager.instance) {
      return SQLiteManager.instance;
    }

    super();
    this.dbFilePath = dbFilePath;
    this.db = new DatabaseSync(this.dbFilePath);
    this.commandQueue = [];
    this.isProcessing = false;
    this.init();

    SQLiteManager.instance = this;
  }

  init() {
    this.db.exec("PRAGMA journal_mode = WAL;"); // Write-Ahead Logging 활성화
    this.db.exec("PRAGMA synchronous = NORMAL;"); // 성능 최적화
    this.db.exec("PRAGMA foreign_keys = ON;"); // 외래 키 활성화

    this.emit("ready");
    logger.info("SQLite 초기화됨");
  }

  execute(query, params = []) {
    return this.executeQueued(() => {
      const stmt = this.db.prepare(query);
      const result = stmt.run(...params);
      return result;
    });
  }

  query(query, params = []) {
    return this.executeQueued(() => {
      const stmt = this.db.prepare(query);
      const result = [];
      for (const row of stmt.iterate(...params)) {
        result.push(row);
      }
      return result;
    });
  }

  get(query, params = []) {
    return this.executeQueued(() => {
      const stmt = this.db.prepare(query);
      const result = stmt.get(...params);
      return result;
    });
  }

  executeQueued(operation) {
    return new Promise((resolve, reject) => {
      this.commandQueue.push({ operation, resolve, reject });
      this.processQueue();
    });
  }

  processQueue() {
    if (this.isProcessing || this.commandQueue.length === 0) return;
    this.isProcessing = true;

    while (this.commandQueue.length > 0) {
      const { operation, resolve, reject } = this.commandQueue.shift();
      try {
        const result = operation();
        resolve(result);
      } catch (error) {
        console.error("SQLite Queue Error:", error);
        reject(error);
      }
    }

    this.isProcessing = false;
  }

  transaction(callback) {
    return this.executeQueued(() => {
      this.db.exec("BEGIN TRANSACTION");
      try {
        const result = callback(this.db);
        this.db.exec("COMMIT");
        return result;
      } catch (error) {
        this.db.exec("ROLLBACK");
        console.error("SQLite Transaction Error:", error);
        throw error;
      }
    });
  }

  static getInstance(dbFilePath) {
    if (!SQLiteManager.instance) {
      SQLiteManager.instance = new SQLiteManager(dbFilePath);
    }
    return SQLiteManager.instance;
  }
}

export default SQLiteManager;
