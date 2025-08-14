console.log("[INDEX] api/index.js loaded at", new Date().toISOString());
const serverless = require("serverless-http");
const app = require("../app");
console.log("[INDEX] app required OK");
module.exports = serverless(app);
