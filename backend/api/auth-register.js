// backend/api/auth-register.js (serverless, bypasses Express)
module.exports = async (req, res) => {
  res.statusCode = 200;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify({ ok: true, where: 'api/auth-register.js' }));
};


