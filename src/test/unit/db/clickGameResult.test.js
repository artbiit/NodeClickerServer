import {
  saveResult,
  banUser,
  getLatestAttempt,
  getUserAttempts,
  isBanned,
  deleteAttemptsByUser,
  createAttempt,
} from "../../../db/clickGameResult.js";

//게임 시작
await createAttempt(1);

//  게임 결과 저장 (성공한 경우)
await saveResult(1, true, 120);

//  유저 실격 처리
await banUser(2, "player2", "초당 4회 초과 클릭");

//  최신 시도 기록 조회
const latestAttempt = await getLatestAttempt(1);
console.log("최신 시도 기록:", latestAttempt);

//  특정 유저의 모든 참여 내역 조회
const allAttempts = await getUserAttempts(1);
console.log("유저 참여 내역:", allAttempts);

//  유저 실격 여부 확인
const isUserBanned = await isBanned(2);
console.log("실격 여부:", isUserBanned ? "실격됨" : "정상");

//  특정 유저의 모든 기록 삭제 (관리자 전용)
await deleteAttemptsByUser(3);
