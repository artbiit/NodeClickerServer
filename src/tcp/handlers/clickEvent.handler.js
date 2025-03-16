import clickGame from "../../contents/ClickGame.js";
import { banUser } from "../../db/clickGame.js";

const clickEventHandler = async (socket) => {
  if (!socket.authorized) {
    socket.destroy();
    return;
  }

  if (!socket.started) {
    clickGame.onResult(
      socket.userId,
      async (userKey, status, message, totalClicks) => {
        if (socket && !socket.destroyed) {
          await socket.write(JSON.stringify({ status, message, totalClicks }));
        }
        if (status === "disqualified") {
          banUser(socket.userId, message);
        }
      }
    );
  }
  clickGame.registerClick(socket.userId);
};

export default clickEventHandler;
