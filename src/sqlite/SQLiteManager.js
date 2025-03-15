import { DatabaseSync } from "node:sqlite";
import { EventEmitter } from "events";

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

  async init() {
    await this.db.exec("PRAGMA journal_mode = WAL;"); // Write-Ahead Logging for better concurrency
    await this.db.exec("PRAGMA synchronous = NORMAL;"); // Improve performance
    await this.db.exec("PRAGMA foreign_keys = ON;"); // Ensure referential integrity

    this.emit("ready");
  }

  async execute(query, params = []) {
    return this.executeQueued(() => this.db.run(query, params));
  }

  async query(query, params = []) {
    return this.executeQueued(() => this.db.all(query, params));
  }

  async get(query, params = []) {
    return this.executeQueued(() => this.db.get(query, params));
  }

  async executeQueued(operation) {
    return new Promise((resolve, reject) => {
      this.commandQueue.push({ operation, resolve, reject });
      this.#processQueue();
    });
  }

  async #processQueue() {
    if (this.isProcessing || this.commandQueue.length === 0) return;
    this.isProcessing = true;

    while (this.commandQueue.length > 0) {
      const { operation, resolve, reject } = this.commandQueue.shift();
      try {
        const result = await operation();
        resolve(result);
      } catch (error) {
        console.error("SQLite Queue Error:", error);
        reject(error);
      }
    }

    this.isProcessing = false;
  }

  async transaction(callback) {
    return this.executeQueued(async () => {
      await this.db.exec("BEGIN TRANSACTION");
      try {
        const result = await callback(this.db);
        await this.db.exec("COMMIT");
        return result;
      } catch (error) {
        await this.db.exec("ROLLBACK");
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
