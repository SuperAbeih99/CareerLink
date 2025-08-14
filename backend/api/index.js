console.log("[INDEX] api/index.js loading at", new Date().toISOString());

let serverless;
try {
  serverless = require("serverless-http");
} catch (e) {
  console.error("[INDEX] failed to require serverless-http:", e);
  module.exports = async (req, res) => {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({ ok: false, where: "serverless-http require", error: String(e) })
    );
  };
  return;
}

let app;
try {
  console.log("[INDEX] about to require ../app");
  app = require("../app");
  console.log("[INDEX] app required OK");
} catch (e) {
  console.error("[INDEX] failed to require ../app:", e);
  module.exports = async (req, res) => {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: false, where: "app require", error: String(e) }));
  };
  return;
}

module.exports = serverless(app);
