const tempusermodel = require("../models/tempuser.models");
const usermodel = require("../models/user.models");
const utils = require("../utils/hashedpassword");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpservice = require("../services/otp.service");

module.exports.storeuser = async ({ username, email, password }) => {
  if (!username || !email || !password) {
    throw new Error("All fields are required");
  }

  const existingUser = await usermodel.findOne({ email });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  let user = await tempusermodel.findOne({ email });
  if (!user) {
    const hashedpassword = await utils.generatehashedpassword(password);
    user = await tempusermodel.create({
      username,
      email,
      password: hashedpassword,
      isVerified: false,
    });
  }

  const otp = await otpservice.sendotp({ email });

  return { user, otp, message: ` stored in temp user ` };
};

module.exports.loginuser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("All fields are required");
  }

  const user = await usermodel.findOne({ email });
  if (!user) {
    throw new Error("Invalid Email");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid Password");
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "1h",
  });

  return { user, token };
};

module.exports.createuser = async ({ tempuser }) => {
  if (!tempuser || tempuser.isVerified === false) {
    throw new Error("Please verify your account first");
  }

  const user = await usermodel.create({
    username: tempuser.username,
    email: tempuser.email,
    password: tempuser.password,
  });

  await tempusermodel.findOneAndDelete({ email: tempuser.email });

  return user;
};

module.exports.forgetpassword = async ({ email }) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const user = await usermodel.findOne({ email });
  if (!user) {
    throw new Error("No user registered with this email address");
  }
  const result = await otpservice.sendPasswordResetOTP({ email });

  return { user, result };
};

module.exports.resetpassword = async ({ email, otp, password }) => {
  if (!email || !otp || !password) {
    throw new Error("Email, OTP, and password are required");
  }

  const user = await usermodel.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.otp_code || user.otp_code !== otp) {
    throw new Error("Invalid OTP");
  }

  if (!user.otp_expires_at || Date.now() > user.otp_expires_at) {
    throw new Error("OTP expired. Please request a new code.");
  }

  const hashed = await utils.generatehashedpassword(password);
  user.password = hashed;
  user.otp_code = null;
  user.otp_expires_at = null;
  await user.save();

  return user;
};
