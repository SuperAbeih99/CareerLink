console.log("[INDEX] api/index.js loading at", new Date().toISOString());

let handler;

try {
  const serverless = require("serverless-http");
  try {
    const app = require("../app");
    console.log("[INDEX] app required OK");
    handler = serverless(app);
  } catch (e) {
    console.error("[INDEX] failed to require ../app:", e);
    handler = async (req, res) => {
      res.statusCode = 500;
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({ ok: false, where: "app require", error: String(e) })
      );
    };
  }
} catch (e) {
  console.error("[INDEX] failed to require serverless-http:", e);
  handler = async (req, res) => {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        ok: false,
        where: "serverless-http require",
        error: String(e),
      })
    );
  };
}

module.exports = handler;
