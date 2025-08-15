const mongoose = require("mongoose");

// 🔴 stop mongoose from buffering operations if not connected
mongoose.set("bufferCommands", false);
mongoose.set("strictQuery", true);

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
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 4000,
        socketTimeoutMS: 20000,
      })
      .then((m) => {
        console.log("[DB] connected; rs state:", m.connection.readyState);
        return m;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
