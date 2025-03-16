import e2eTester from "./e2eTester.js";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

import("../../index.js");

await sleep(1000);

const test1 = new e2eTester("testUser1", "1234", true, 200);
await test1.startTest();
