module.exports = async (req, res) => {
  if (req.method === "OPTIONS") return res.status(204).end();
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  return res
    .status(200)
    .json({ ok: true, body: req.body || null, ts: new Date().toISOString() });
};
