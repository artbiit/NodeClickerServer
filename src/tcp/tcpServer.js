import net from "net";
import env from "../configs/env.js";
import logger from "../util/logger.js";
import onConnection from "./events/onConnection.js";

const { TCP_BIND, TCP_PORT } = env;

const server = net.createServer(onConnection);

server.listen(TCP_PORT, TCP_BIND, () => {
  logger.info(`TCP SERVER is on ${TCP_BIND}:${TCP_PORT}`);
});
