const { default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt");

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userAgent: { type: String }, // optional: browser/device info
  ip: { type: String }, // optional: IP address
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String },
  status: { type: Boolean, default: false },
  role: {
    type: String,
    enum: ["admin", "subadmin", "user"],
    default: "user",
  },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  refreshTokens: [refreshTokenSchema],
  deletedAt: { type: String, default: null },
});
// Password hashing middleware (optional but recommended)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
const User = mongoose.model("Users", userSchema);

module.exports = User;
