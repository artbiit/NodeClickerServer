import clickGame from "../../contents/ClickGame.js";

const onEnd = (socket) => async () => {
  clickGame.removeUser(socket.userId);
};

export default onEnd;
