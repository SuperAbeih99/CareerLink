console.log(
  "[INDEX] api/index.js loading at",
  new Date().toISOString(),
  "region=",
  process.env.VERCEL_REGION
);

let app;
try {
  console.log("[INDEX] about to require ../app");
  app = require("../app");
  console.log("[INDEX] app required OK");
} catch (e) {
  console.error("[INDEX] failed to require ../app:", e);
  module.exports = (req, res) => {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({ ok: false, where: "app require", error: String(e) })
    );
  };
  return;
}

// Export a Vercel Node.js runtime handler
module.exports = (req, res) => app(req, res);
