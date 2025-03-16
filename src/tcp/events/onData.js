import logger from "../../util/logger.js";
import authorizeHandler from "../handlers/authorize.handler.js";
import clickEventHandler from "../handlers/clickEvent.handler.js";

const onData = (socket) => async (data) => {
  logger.info(`데이서 수신 => ${data.toString()}`);
  if (socket.authorized) {
    await clickEventHandler(socket);
  } else {
    await authorizeHandler(socket, JSON.parse(data.toString()));
  }
};

export default onData;
