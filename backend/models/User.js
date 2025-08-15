const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["jobseeker", "employer"],
      default: "jobseeker",
    },
    profileImageUrl: { type: String, default: null },
  },
  { timestamps: true, bufferCommands: false }
);

// Only skip re-hash; controller hashes before save
userSchema.pre("save", function (next) {
  const p = this.password || "";
  if (!this.isModified("password")) return next();
  if (p.startsWith("$2a$") || p.startsWith("$2b$") || p.startsWith("$2y$"))
    return next();
  return next();
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
