import logger from "./util/logger.js";
import initialize from "./init/init.js";
import cluster from "cluster";
import os from "os";

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  cluster.schedulingPolicy = cluster.SCHED_RR;
  console.log(`Master ${process.pid} is running`);

  // Worker 생성
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died, restarting...`);
    cluster.fork();
  });
} else {
  await initialize();

  await import("./http/httpServer.js");
}
