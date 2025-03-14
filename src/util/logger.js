import { createWriteStream } from "fs";
import { mkdir, appendFile } from "fs/promises";
import { join } from "path";
import { format } from "util";
import { EOL } from "os";

const programStartTime = new Date();
const programTimestamp = programStartTime
  .toISOString()
  .slice(0, 19)
  .replace(/[-T:]/g, "");

class Logger {
  constructor({ level = "info", logDir = "logs" } = {}) {
    this.levels = { error: 0, warn: 1, info: 2, debug: 3 };
    this.currentLevel =
      this.levels[level] !== undefined ? this.levels[level] : 2;
    this.logDir = logDir;
    this.logFile = `${programTimestamp}.log`;
    this.filePath = join(this.logDir, this.logFile);
    this.stream = null;
    this.init();
  }

  async init() {
    try {
      await mkdir(this.logDir, { recursive: true });
      this.stream = createWriteStream(this.filePath, { flags: "a" });
    } catch (err) {
      console.error("Logger initialization error:", err);
    }
  }

  log(level, ...args) {
    if (this.levels[level] > this.currentLevel) return;

    const timestamp = new Date().toISOString();
    const message = format(...args);
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}${EOL}`;

    // 콘솔 출력
    console.log(logEntry.trim());

    // 파일 저장 (비동기)
    if (this.stream) {
      this.stream.write(logEntry);
    } else {
      appendFile(this.filePath, logEntry).catch(console.error);
    }
  }

  error(...args) {
    this.log("error", ...args);
  }
  warn(...args) {
    this.log("warn", ...args);
  }
  info(...args) {
    this.log("info", ...args);
  }
  debug(...args) {
    this.log("debug", ...args);
  }
}

export default new Logger();
