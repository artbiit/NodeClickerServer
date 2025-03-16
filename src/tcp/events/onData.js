import authorizeHandler from "../handlers/authorize.handler.js";
import clickEventHandler from "../handlers/clickEvent.handler.js";

const onData = (socket) => async (data) => {
  if (socket.authorized) {
    await clickEventHandler(socket);
  } else {
    await authorizeHandler(socket, JSON.parse(data.toString()));
  }
};

export default onData;
