import onData from "./onData.js";
import onEnd from "./onEnd.js";
import onError from "./onError.js";
import logger from "../../util/logger.js";
import onClose from "./onClose.js";

const onConnection = (socket) => {
  logger.info(
    `클라이언트가 연결되었습니다 [${socket.remoteAddress}:${socket.remotePort}]`
  );
  socket.on("data", onData(socket));
  socket.on("end", onEnd(socket));
  socket.on("error", onError(socket));
  socket.on("close", onClose(socket));
};

export default onConnection;
