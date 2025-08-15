// backend/api/db-check.js (serverless, bypasses Express)
const mongoose = require('mongoose');

module.exports = async (req, res) => {
  const uri = process.env.MONGO_URI;
  const withTimeout = (p, ms, label = 'op') =>
    Promise.race([
      p,
      new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms)),
    ]);

  let tempConn;
  try {
    tempConn = await withTimeout(
      mongoose.createConnection(uri, {
        dbName: 'careerlink',
        serverSelectionTimeoutMS: 2500,
        connectTimeoutMS: 2500,
        socketTimeoutMS: 8000,
      }).asPromise(),
      4500,
      'Mongo connect'
    );
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: true, where: 'api/db-check.js', msg: 'Mongo reachable' }));
  } catch (err) {
    res.statusCode = 503;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: false, where: 'api/db-check.js', error: String(err.message || err) }));
  } finally {
    if (tempConn) {
      try { await tempConn.close(); } catch (_) {}
    }
  }
};


