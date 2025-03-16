import SQLiteManager from "../sqlite/SQLiteManager.js";
import logger from "../util/logger.js";

/*
 * 유저의 게임 결과를 저장
 * @param {number} userSeqNo - 유저의 seq_no (user 테이블 참조)
 * @param {boolean} success - 성공 여부 (true: 성공, false: 실패)
 * @param {number} totalClicks - 총 클릭 횟수
 */
export async function saveResult(userSeqNo, success, totalClicks) {
  const db = SQLiteManager.getInstance();
  const endedAt = new Date().toISOString();

  // 해당 유저의 최신 started_at 가져오기
  const latestAttempt = await db.get(
    `SELECT started_at FROM attempt WHERE user_seq_no = ? ORDER BY started_at DESC LIMIT 1`,
    [userSeqNo]
  );

  if (!latestAttempt || !latestAttempt.started_at) {
    logger.error("[오류] 저장된 started_at을 찾을 수 없음.");
    return;
  }

  await db.execute(
    `UPDATE attempt 
     SET ended_at = ?, success = ?, total_clicks = ?
     WHERE user_seq_no = ? AND started_at = ?`,
    [endedAt, success ? 1 : 0, totalClicks, userSeqNo, latestAttempt.started_at]
  );

  logger.info(
    `[결과 저장] user_seq_no=${userSeqNo}, success=${success}, clicks=${totalClicks}, started_at=${latestAttempt.started_at}`
  );
}

/**
 * 새로운 게임 시도를 기록 (started_at 저장)
 * @param {number} userSeqNo - 유저의 seq_no (user 테이블 참조)
 * @returns {string} started_at 값 반환 (ISO 문자열)
 */
export async function createAttempt(userSeqNo) {
  const db = SQLiteManager.getInstance();
  const startedAt = new Date().toISOString();

  await db.execute(
    `INSERT INTO attempt (user_seq_no, started_at, success, total_clicks) 
       VALUES (?, ?, 0, 0)`,
    [userSeqNo, startedAt]
  );

  logger.info(`[시도 시작] user_seq_no=${userSeqNo}, started_at=${startedAt}`);
  return startedAt;
}

/**
 * 유저를 실격 처리하고 ban 테이블에 등록
 * @param {number} userSeqNo - 유저의 seq_no (user 테이블 참조)
 * @param {string} userName - 유저 이름
 * @param {string} reason - 실격 사유
 */
export async function banUser(userSeqNo, userName, reason) {
  const db = SQLiteManager.getInstance();

  await db.execute(
    `INSERT OR REPLACE INTO ban (user_seq_no, user_name, reason, banned_at) 
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
    [userSeqNo, userName, reason]
  );
  logger.info(`[실격 처리] user_seq_no=${userSeqNo}, reason=${reason}`);
}

/**
 * 특정 유저의 최신 시도 기록 조회
 * @param {number} userSeqNo - 유저의 seq_no
 * @returns {Promise<Object|null>} - 최신 시도 정보
 */
export async function getLatestAttempt(userSeqNo) {
  const db = SQLiteManager.getInstance();
  return await db.get(
    `SELECT * FROM attempt WHERE user_seq_no = ? ORDER BY started_at DESC LIMIT 1`,
    [userSeqNo]
  );
}

/**
 * 특정 유저의 모든 시도 내역 조회
 * @param {number} userSeqNo - 유저의 seq_no
 * @returns {Promise<Array>} - 참여 내역 리스트
 */
export async function getUserAttempts(userSeqNo) {
  const db = SQLiteManager.getInstance();
  return await db.query(
    `SELECT * FROM attempt WHERE user_seq_no = ? ORDER BY started_at DESC`,
    [userSeqNo]
  );
}

/**
 * 유저가 실격되었는지 확인
 * @param {number} userSeqNo - 유저의 seq_no
 * @returns {Promise<boolean>} - 실격 여부
 */
export async function isBanned(userSeqNo) {
  const db = SQLiteManager.getInstance();
  const result = await db.get(
    `SELECT 1 FROM ban WHERE user_seq_no = ? LIMIT 1`,
    [userSeqNo]
  );
  return !!result;
}

/**
 * 특정 유저의 모든 기록 삭제 (관리자용)
 * @param {number} userSeqNo - 유저의 seq_no
 */
export async function deleteAttemptsByUser(userSeqNo) {
  const db = SQLiteManager.getInstance();
  await db.execute(`DELETE FROM attempt WHERE user_seq_no = ?`, [userSeqNo]);
  logger.info(`[삭제 완료] user_seq_no=${userSeqNo}의 모든 기록 삭제`);
}
