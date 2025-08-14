const mongoose = require("mongoose");

let cached =
  global.mongoose || (global.mongoose = { conn: null, promise: null });

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is not defined");

    cached.promise = mongoose
      .connect(uri, {
        dbName: "careerlink",
        serverSelectionTimeoutMS: 2500,
        connectTimeoutMS: 2500,
        socketTimeoutMS: 10000,
      })
      .then((m) => {
        console.log("[DB] connected");
        return m;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
