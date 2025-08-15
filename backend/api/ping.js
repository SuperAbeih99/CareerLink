// backend/api/ping.js
module.exports = (req, res) => {
  res.setHeader('content-type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true, where: 'api/ping.js', ts: new Date().toISOString() }));
};


