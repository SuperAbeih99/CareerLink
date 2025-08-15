const mongoose = require("mongoose");
mongoose.set("bufferCommands", false);
mongoose.set("strictQuery", true);

let cached =
  global.mongoose || (global.mongoose = { conn: null, promise: null });

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is not defined");

    // Avoid index build delays on cold start
    try {
      mongoose.set("autoIndex", false);
      mongoose.set("bufferCommands", false);
    } catch (_) {}

    cached.promise = new Promise((resolve, reject) => {
      const timeoutMs = 4000;
      const timer = setTimeout(() => {
        console.error("[DB] connect timed out after", timeoutMs, "ms");
        cached.promise = null; // allow retry on next request
        reject(new Error("Mongo connect timed out"));
      }, timeoutMs + 100); // small buffer over driver timeouts

      mongoose
        .connect(uri, {
          dbName: "careerlink",
          serverSelectionTimeoutMS: 4000,
          connectTimeoutMS: 4000,
          socketTimeoutMS: 20000,
          w: 1,
          wtimeoutMS: 2000,
        })
        .then((m) => {
          clearTimeout(timer);
          console.log("[DB] connected; rs state:", m.connection.readyState);
          resolve(m);
        })
        .catch((err) => {
          clearTimeout(timer);
          console.error("[DB] connect error:", err?.message || err);
          cached.promise = null; // allow retry on next request
          reject(err);
        });
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
