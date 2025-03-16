import logger from "../../util/logger.js";

const onClose = (socket) => async () => {
  logger.info(`onClose => ${socket.id}`);
};

export default onClose;
