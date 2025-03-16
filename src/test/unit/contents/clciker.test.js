import ClickGame from "../../../contents/clickGame.js";

const game = ClickGame;

// 특정 유저의 결과가 나왔을 때 콜백 실행 (DB 저장 가능)
game.onResult("user1", (userKey, status, message, totalClicks) => {
  console.log(
    `[이벤트][${userKey}] 결과: ${status} - ${message}, 클릭 수: ${totalClicks}`
  );
  // DB에 저장 가능 (예제)
  // db.saveResult(userKey, status, message, totalClicks);
});

game.onResult("user2", (userKey, status, message, totalClicks) => {
  console.log(
    `[이벤트][${userKey}] 결과: ${status} - ${message}, 클릭 수: ${totalClicks}`
  );
});

game.onResult("user3", (userKey, status, message, totalClicks) => {
  console.log(
    `[이벤트][${userKey}] 결과: ${status} - ${message}, 클릭 수: ${totalClicks}`
  );
});

// 유저 클릭 시뮬레이션
setTimeout(
  () => console.log(`[클릭][user1]`, game.registerClick("user1")),
  100
);
setTimeout(
  () => console.log(`[클릭][user1]`, game.registerClick("user1")),
  200
);
setTimeout(
  () => console.log(`[클릭][user1]`, game.registerClick("user1")),
  300
);
setTimeout(
  () => console.log(`[클릭][user1]`, game.registerClick("user1")),
  400
);
setTimeout(
  () => console.log(`[클릭][user1]`, game.registerClick("user1")),
  500
); // 초과 클릭 → 실격

for (let i = 0; i < 10; i++) {
  setTimeout(
    () => console.log(`[클릭][user2]`, game.registerClick("user2")),
    i * 1100
  );
}

// 10초 동안 클릭 없으면 자동 실격 (user3)
setTimeout(
  () => console.log(`[클릭][user3]`, game.registerClick("user3")),
  3000
);

// 70초 후 최종 상태 조회
setTimeout(() => console.log(`[상태]`, game.getStatus()), 70000);
