import cluster from "cluster";
import { cpus } from "os";
import { EventEmitter } from "events";

class WorkerPool extends EventEmitter {
  static instance;
  #workers = new Map();
  #taskQueue = [];
  #workerFunctions = new Map();
  constructor(numWorkers = cpus().length) {
    if (WorkerPool.instance) {
      return WorkerPool.instance;
    }

    super();
    this.numWorkers = numWorkers;
    this.#initCluster();
    WorkerPool.instance = this;
  }

  #initCluster() {
    if (cluster.isMaster) {
      for (let i = 0; i < this.numWorkers; i++) {
        this.#spawnWorker();
      }
    } else {
      process.on("message", async ({ task, workerFunction }) => {
        const workerFunc = new Function(`return (${workerFunction})`)();
        const result = await workerFunc(task);
        process.send({ id: task.id, result });
      });
    }
  }

  #spawnWorker() {
    const worker = cluster.fork();
    this.#workers.set(worker.process.pid, worker);
    worker.on("message", (msg) => {
      this.emit("taskCompleted", msg.id, msg.result);
      this.#processNextTask(worker);
    });
    worker.on("exit", () => {
      this.#workers.delete(worker.process.pid);
      this.#spawnWorker();
    });
  }

  addTask(task, workerFunction) {
    return new Promise((resolve) => {
      this.#taskQueue.push({
        task,
        workerFunction: workerFunction.toString(),
        resolve,
      });
      this.#assignTask();
    });
  }

  #assignTask() {
    for (const worker of this.#workers.values()) {
      if (this.#taskQueue.length > 0) {
        this.#processNextTask(worker);
      }
    }
  }

  #processNextTask(worker) {
    if (this.#taskQueue.length > 0) {
      const { task, workerFunction, resolve } = this.#taskQueue.shift();
      this.once("taskCompleted", (taskId, result) => {
        if (taskId === task.id) {
          resolve(result);
        }
      });
      worker.send({ task, workerFunction });
    }
  }

  static getInstance(numWorkers) {
    if (!WorkerPool.instance) {
      WorkerPool.instance = new WorkerPool(numWorkers);
    }
    return WorkerPool.instance;
  }
}

export default WorkerPool;
