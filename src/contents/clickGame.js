import { performance } from "perf_hooks";
import logger from "../util/logger.js";

class ClickGame {
  constructor() {
    this.users = new Map(); // { userKey: { clicks: [], totalClicks, startTime, lastClickTime, timeout, disqualified, gameTimeout } }
    this.eventHandlers = new Map(); // { userKey: callbackFunction }
  }

  /**
   * 이벤트 리스너 등록
   * @param {string} userKey - 유저 식별 키
   * @param {function} callback - 결과 발생 시 호출할 함수 (userKey, status, message, totalClicks)
   */
  onResult(userKey, callback) {
    this.eventHandlers.set(userKey, callback);
  }

  // 클릭 이벤트 처리
  registerClick(userKey) {
    const currentTime = performance.now(); // 마이크로초(µs) 단위

    // 유저 최초 참여 시 초기화
    if (!this.users.has(userKey)) {
      this.users.set(userKey, {
        clicks: [],
        totalClicks: 0,
        startTime: currentTime,
        lastClickTime: currentTime,
        timeout: this.setDisqualificationTimer(userKey),
        gameTimeout: this.setGameEndTimer(userKey), // 1분 후 종료
        disqualified: false,
      });
    }

    const user = this.users.get(userKey);

    // 이미 실격되었거나 1분이 지나면 입력 불가
    if (user.disqualified) {
      return { status: "disqualified", message: "이미 실격됨" };
    }

    // 타이머 리셋 (10초 대기 초기화)
    clearTimeout(user.timeout);
    user.timeout = this.setDisqualificationTimer(userKey);

    user.clicks.push(currentTime);
    user.totalClicks++;
    user.lastClickTime = currentTime;

    // 초당 4회 초과 확인 (슬라이딩 윈도우 적용)
    if (this.checkDisqualification(user.clicks)) {
      user.disqualified = true;
      this.notifyResult(
        userKey,
        "disqualified",
        "초당 4회 초과",
        user.totalClicks
      );
      return { status: "disqualified", message: "초당 4회 초과로 실격" };
    }

    return { status: "valid", clicks: user.totalClicks };
  }

  // 슬라이딩 윈도우 체크 (1초 내 4회 초과 시 실격)
  checkDisqualification(clicks) {
    while (
      clicks.length > 0 &&
      clicks[clicks.length - 1] - clicks[0] > 1000000
    ) {
      clicks.shift();
    }
    return clicks.length > 4;
  }

  // 자동 실격 타이머 (10초 동안 클릭 없으면 실격)
  setDisqualificationTimer(userKey) {
    return setTimeout(() => {
      if (this.users.has(userKey)) {
        this.users.get(userKey).disqualified = true;
        this.notifyResult(
          userKey,
          "disqualified",
          "10초간 클릭 없음",
          this.users.get(userKey).totalClicks
        );
      }
    }, 10000);
  }

  // 1분 후 자동 게임 종료 (유저별 적용)
  setGameEndTimer(userKey) {
    return setTimeout(() => {
      if (this.users.has(userKey) && !this.users.get(userKey).disqualified) {
        this.notifyResult(
          userKey,
          "finished",
          `게임 종료`,
          this.users.get(userKey).totalClicks
        );
      }
    }, 60000);
  }

  // 결과를 즉시 알림 (등록된 콜백이 있으면 실행 후 유저 삭제)
  notifyResult(userKey, status, message, totalClicks) {
    logger.log(
      `[결과] 유저 ${userKey}: ${status} (${message}), 총 클릭 수: ${totalClicks}`
    );

    if (this.eventHandlers.has(userKey)) {
      this.eventHandlers.get(userKey)(userKey, status, message, totalClicks);
    }

    // 결과를 알린 후 유저 데이터 삭제
    this.users.delete(userKey);
    this.eventHandlers.delete(userKey);
  }

  // 현재 상태 확인
  getStatus() {
    return {
      users: [...this.users.entries()].map(([userKey, data]) => ({
        userKey,
        totalClicks: data.totalClicks,
        status: data.disqualified ? "disqualified" : "valid",
      })),
    };
  }

  // 특정 유저를 강제 제외
  removeUser(userKey) {
    if (!this.users.has(userKey)) {
      return { status: "not_found", message: "유저가 존재하지 않음" };
    }

    const user = this.users.get(userKey);
    clearTimeout(user.timeout); // 자동 실격 타이머 제거
    clearTimeout(user.gameTimeout); // 1분 타이머 제거

    this.notifyResult(
      userKey,
      "removed",
      "관리자에 의해 게임 제외됨",
      user.totalClicks
    );

    return { status: "removed", message: "유저가 게임에서 제외됨" };
  }
}

const clickGame = new ClickGame();

export default clickGame;
