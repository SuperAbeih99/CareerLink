console.log(
  "[INDEX] api/index.js loading at",
  new Date().toISOString(),
  "region=",
  process.env.VERCEL_REGION
);

// Using @vercel/node build, no need for serverless-http

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
    res.end(
      JSON.stringify({ ok: false, where: "app require", error: String(e) })
    );
  };
  return;
}

module.exports = app;
