import {
  InsertUser,
  CheckUserExists,
  GetUserPassword,
} from "../../../db/user.js";

//생성
await InsertUser("user1", "1234");

console.log("user1 => ", await CheckUserExists("user1"));
console.log("user2 => ", await CheckUserExists("user2"));

console.log(await GetUserPassword("user1"));

await InsertUser("user2", "1234");
await InsertUser("user3", "1234");
await InsertUser("user4", "1234");
