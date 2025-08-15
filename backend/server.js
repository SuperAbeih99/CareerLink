require("dotenv").config();
const app = require("./app");

if (require.main === module) {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`CareerLink backend listening on ${PORT}`);
  });
}

module.exports = app;
