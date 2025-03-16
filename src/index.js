import logger from "./util/logger.js";
import initialize from "./init/init.js";
import cluster from "cluster";
import os from "os";
import env from "./configs/env.js";

if (cluster.isPrimary) {
  const { CLUSTER_NUMBER } = env;
  const cpuNumber = os.cpus().length;
  const numCPUs =
    isNaN(CLUSTER_NUMBER) || isFinite(CLUSTER_NUMBER) || CLUSTER_NUMBER <= 0
      ? cpuNumber
      : CLUSTER_NUMBER;
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
  await import("./tcp/tcpServer.js");
}
