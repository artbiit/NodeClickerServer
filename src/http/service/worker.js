import cluster from "cluster";

export default () => {
  return [200, { worker_id: cluster.worker.id }];
};
