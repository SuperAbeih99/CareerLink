// backend/api/health.js
module.exports = (req, res) => {
  console.log('[HEALTH-FN] request at', new Date().toISOString(), 'url=', req.url);
  res.setHeader('content-type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true, ts: new Date().toISOString(), where: 'api/health.js' }));
};


