import cluster from "cluster";

export default () => {
  const result = cluster.isPrimary ? "master" : cluster.worker.id;
  return [200, { worker_id: result }];
};
