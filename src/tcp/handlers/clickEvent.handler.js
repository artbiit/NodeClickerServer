import clickGame from "../../contents/ClickGame.js";
import { banUser, createAttempt, saveResult } from "../../db/clickGame.js";

const clickEventHandler = async (socket) => {
  if (!socket.authorized) {
    socket.destroy();
    return;
  }

  if (!socket.started) {
    socket.started = true;
    await createAttempt(socket.userId);
    clickGame.onResult(
      socket.userId,
      async (userKey, status, message, totalClicks) => {
        socket.started = false;
        if (socket && !socket.destroyed) {
          await socket.write(JSON.stringify({ status, message, totalClicks }));
        }
        if (status === "disqualified") {
          banUser(socket.userId, message);
        }

        if (status !== "valid") {
          await socket.destroy();
        }

        await saveResult(socket.userId, status === "valid", totalClicks);
      }
    );
  }
  clickGame.registerClick(socket.userId);
};

export default clickEventHandler;
