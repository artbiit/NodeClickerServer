import {
  CreateSession,
  CheckSession,
  DeleteSession,
  IsUserLoggedIn,
} from "../../../db/session.js";

console.log("create test1");
await CreateSession("user1", "test1", Date.now() + 3600);

console.log("test1 => ", await CheckSession("test1"));
console.log("test2 => ", await CheckSession("test2"));

console.log("IsUserLoggedIn test1 => ", await IsUserLoggedIn("test1"));

console.log("delete => test1");
await DeleteSession("test1");

console.log("IsUserLoggedIn test1 => ", await IsUserLoggedIn("test1"));

console.log("create test1");
await CreateSession("user1", "test1", Date.now() - 3600);

console.log("IsUserLoggedIn test1 => ", await IsUserLoggedIn("test1"));

console.log("delete => test1");
await DeleteSession("test1");
