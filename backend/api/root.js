// backend/api/root.js
module.exports = (req, res) => {
  res.setHeader('content-type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({
    ok: true,
    name: 'CareerLink API',
    where: 'api/root.js',
    endpoints: ['/health', '/api/v1/*'],
    ts: new Date().toISOString()
  }));
};


