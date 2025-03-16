import clickGame from "../../contents/ClickGame.js";

const onError = (socket) => async (err) => {
  clickGame.removeUser(socket.userId);
};

export default onError;
