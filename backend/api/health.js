// backend/api/health.js
module.exports = (req, res) => {
  res.setHeader('content-type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true, ts: new Date().toISOString(), where: 'api/health.js' }));
};


