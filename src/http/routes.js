import worker from "./service/worker.js";

const routes = {
  "/worker": {
    method: "GET",
    service: worker,
  },
};
export default routes;
