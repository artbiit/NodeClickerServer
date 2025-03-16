import ClickGame from "../../../contents/clickGame.js";

const game = new ClickGame();

// 특정 유저의 결과가 나왔을 때 콜백 실행 (DB 저장 가능)
game.onResult("user1", (userKey, status, message, totalClicks) => {
  console.log(
    `[이벤트] ${userKey} 결과: ${status} - ${message}, 클릭 수: ${totalClicks}`
  );
  // DB에 저장 가능 (예제)
  // db.saveResult(userKey, status, message, totalClicks);
});

game.onResult("user2", (userKey, status, message, totalClicks) => {
  console.log(
    `[이벤트] ${userKey} 결과: ${status} - ${message}, 클릭 수: ${totalClicks}`
  );
});

// 유저 클릭 시뮬레이션
setTimeout(() => console.log(game.registerClick("user1")), 100); // user1 참여
setTimeout(() => console.log(game.registerClick("user1")), 200); // 정상 클릭
setTimeout(() => console.log(game.registerClick("user1")), 300); // 정상 클릭
setTimeout(() => console.log(game.registerClick("user1")), 400); // 정상 클릭
setTimeout(() => console.log(game.registerClick("user1")), 500); // 초당 4회 초과 → 실격 (이벤트 발생 후 삭제)

setTimeout(() => console.log(game.registerClick("user2")), 600); // user2 참여
setTimeout(() => console.log(game.registerClick("user2")), 800); // 정상 클릭
setTimeout(() => console.log(game.registerClick("user2")), 1200); // 정상 클릭
setTimeout(() => console.log(game.registerClick("user2")), 1400); // 정상 클릭
setTimeout(() => console.log(game.registerClick("user2")), 1600); // 정상 클릭 (4회 유지)
setTimeout(() => console.log(game.registerClick("user2")), 1800); // 5회 초과 → 실격 (이벤트 발생 후 삭제)

// 10초 동안 클릭 없으면 자동 실격 (user3)
setTimeout(() => console.log(game.registerClick("user3")), 3000); // user3 참여
// user3는 추가 클릭 없이 10초 경과 후 자동 실격됨 (이벤트 발생 후 삭제)

// 1분 후 user2, user3는 게임 종료됨 (이벤트 발생 후 삭제)
setTimeout(() => console.log(game.getStatus()), 70000); // 70초 후 최종 상태 조회
