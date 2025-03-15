import cluster from "cluster";
import { appendFile, mkdir } from "fs/promises";
import { join } from "path";
import { format } from "util";
import { EOL } from "os";

const programStartTime = new Date();
const programTimestamp = programStartTime
  .toISOString()
  .slice(0, 19)
  .replace(/[-T:]/g, "_");

class Logger {
  constructor({ level = "info", logDir = "logs" } = {}) {
    this.levels = { error: 0, warn: 1, info: 2, debug: 3 };
    this.currentLevel =
      this.levels[level] !== undefined ? this.levels[level] : 2;
    this.logDir = logDir;
    this.logFile = `${programTimestamp}.log`;
    this.filePath = join(this.logDir, this.logFile);
    this.init();
  }

  async init() {
    try {
      await mkdir(this.logDir, { recursive: true });
    } catch (err) {
      console.error("Logger initialization error:", err);
    }
  }

  async log(level, ...args) {
    if (this.levels[level] > this.currentLevel) return;

    const timestamp = new Date().toISOString();
    const processId = process.pid;
    const workerId = cluster.isWorker ? cluster.worker.id : "MASTER";
    const message = format(...args);
    const logEntry = `[${timestamp}] [${workerId}] [${processId}] [${level.toUpperCase()}] ${message}${EOL}`;

    // 콘솔 출력
    console.log(logEntry.trim());

    // 마스터 프로세스에서만 파일 기록
    if (cluster.isPrimary) {
      try {
        await appendFile(this.filePath, logEntry);
      } catch (err) {
        console.error("Logger file write error:", err);
      }
    } else {
      // 워커 프로세스는 마스터로 로그 전송
      process.send?.({ type: "log", level, message: logEntry });
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

// 마스터 프로세스에서 로그 메시지를 수신하고 파일에 저장
if (cluster.isPrimary) {
  cluster.on("message", async (worker, message) => {
    if (message.type === "log") {
      try {
        await appendFile(
          join("logs", `${programTimestamp}.log`),
          message.message
        );
      } catch (err) {
        console.error("Master Logger file write error:", err);
      }
    }
  });
}

export default new Logger();
