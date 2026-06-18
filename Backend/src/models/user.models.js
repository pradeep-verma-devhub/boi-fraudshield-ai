const mongoose = require("mongoose");

const userschema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp_code: {
    type: String,
    default: null,
  },
  otp_expires_at: {
    type: Date,
    default: null,
  }
});

module.exports = mongoose.model("User", userschema);


