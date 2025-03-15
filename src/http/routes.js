import signup from "./service/signup.js";
import signin from "./service/signin.js";
import worker from "./service/worker.js";
import signout from "./service/signout.js";

const routes = {
  "/worker": {
    method: "GET",
    service: worker,
  },
  "/signup": {
    method: "POST",
    service: signup,
  },
  "/signin": {
    method: "POST",
    service: signin,
  },
  "/signout": {
    method: "POST",
    service: signout,
  },
};
export default routes;
