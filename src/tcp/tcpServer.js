import net from "net";
import env from "../configs/env.js";
import logger from "../util/logger.js";

const { TCP_BIND, TCP_PORT } = env;

const server = net.createServer((socket) => {});

server.listen(TCP_PORT, TCP_BIND, () => {
  logger.info(`TCP SERVER is on ${TCP_BIND}:${TCP_PORT}`);
});
