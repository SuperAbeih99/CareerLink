// backend/api/db-check.js (serverless, bypasses Express)
const connectDB = require('../config/db');

module.exports = async (req, res) => {
  const withTimeout = (p, ms, label = 'op') =>
    Promise.race([
      p,
      new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms)),
    ]);

  try {
    await withTimeout(connectDB(), 4500, 'Mongo connect');
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: true, where: 'api/db-check.js', msg: 'Mongo reachable' }));
  } catch (err) {
    res.statusCode = 503;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: false, where: 'api/db-check.js', error: String(err.message || err) }));
  }
};


