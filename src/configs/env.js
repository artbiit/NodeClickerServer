import { readFileSync } from "fs";
import { resolve } from "path";
import logger from "../util/logger.js";

/**
 * .env 파일을 읽고 환경 변수로 설정하는 함수.
 * @param {string} envFilePath - 환경 변수 파일 경로 (기본값: `.env`)
 */
function loadEnv(envFilePath = process.env.ENV_FILE || ".env") {
  try {
    const envPath = resolve(process.cwd(), envFilePath);
    const envContent = readFileSync(envPath, "utf-8");

    envContent.split("\n").forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) return; // 빈 줄 또는 주석 무시

      const [key, ...values] = trimmedLine.split("=");
      if (!key) return; // key가 없는 경우 무시

      const value = values
        .join("=")
        .trim()
        .replace(/^['"]|['"]$/g, ""); // 값에서 따옴표 제거
      process.env[key.trim()] = value;
    });
  } catch (error) {
    logger.warn(`Warning: Failed to load environment file: ${envFilePath}`);
  }
}

// .env 파일 로드
loadEnv();

/**
 * 필수 환경 변수 목록을 정의하는 객체.
 */
const requiredEnv = {
  HTTP: ["PORT"],
  TCP: ["PORT", "BIND"],
};

/**
 * 환경 변수를 담는 객체.
 */
const config = {};

// 필수 환경 변수를 검사하고 설정되지 않은 변수가 있을 경우 오류를 발생시킴
Object.keys(requiredEnv).forEach((key) => {
  requiredEnv[key].forEach((envVar) => {
    const fullEnvVar = `${key}_${envVar}`;
    if (!process.env[fullEnvVar]) {
      throw new Error(`Missing required environment variable: ${fullEnvVar}`);
    }

    if (!config[key]) {
      config[key] = {};
    }

    // 숫자로 변환 가능하면 변환, 그렇지 않으면 문자열로 저장
    config[key][envVar] = isNaN(process.env[fullEnvVar])
      ? process.env[fullEnvVar]
      : Number(process.env[fullEnvVar]);
  });
});

/**
 * `config` 객체를 평탄화하여 단일 레벨의 객체로 변환.
 */
const flattenedConfig = Object.entries(config).reduce(
  (acc, [namespace, values]) => {
    Object.entries(values).forEach(([key, value]) => {
      acc[`${namespace}_${key}`] = value;
    });
    return acc;
  },
  {}
);

/**
 * 평탄화된 환경 변수 객체를 내보냄.
 */
export default flattenedConfig;
