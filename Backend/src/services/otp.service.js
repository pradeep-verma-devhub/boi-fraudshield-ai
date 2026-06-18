const TempUser = require("../models/tempuser.models");
const User = require("../models/user.models");
const emailsender = require("../config/email");
const generateotp = require("../utils/generateotp");
const { getOTPEmailTemplate } = require("../utils/emailtemplate");
const userService = require("./user.service");
require("dotenv").config();


module.exports.sendotp = async ({ email }) => {
  if (!email) {
    throw new Error("Email is required");
  }
  const tempUser = await TempUser.findOne({ email });
  if (!tempUser) {
    throw new Error("User not found");
  }
  const otp = generateotp();
  tempUser.otp_code = otp;
  tempUser.otp_expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration
  await tempUser.save();

  try {
    const mailOptions = {
      from: `"DevHub Support" <${process.env.EMAIL_OWNER || process.env.BRAVO_EMAIL}>`,
      to: email,
      replyTo : email,
      subject: "Your OTP Verification Code",
      html: getOTPEmailTemplate(tempUser.username, otp),
    };
    const result = await emailsender.sendMail(mailOptions);
  } catch (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }

  return { email, otp };
};

module.exports.resendotp = async ({ email, type }) => {
  if (!email) {
    throw new Error("Email is required");
  }

  type = type || "register";

  let user;
  const otp = generateotp();

  if (type == "register") {
    user = await TempUser.findOne({ email });
    if (!user) {
      throw new Error("Temporary user not found");
    }
    user.otp_code = otp;
    user.otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
  } else if (type == "login") {
    user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }
    user.otp_code = otp;
    user.otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
  } else {
    throw new Error("Invalid type");
  }

  try {
    const mailOptions = {
      from: `"DevHub Support" <${process.env.EMAIL_OWNER || process.env.BRAVO_EMAIL || 'support@devhub.com'}>`,
      to: email,
      replyTo: email,
      subject: "Your OTP Verification Code (Resent)",
      html: getOTPEmailTemplate(user.username, otp),
    };
    await emailsender.sendMail(mailOptions);
  } catch (error) {
    throw new Error(`Failed to resend verification email: ${error.message}`);
  }

  return { email, otp };
};

module.exports.verifyotp = async ({ email, otp, type }) => {
  if (!email || !otp) {
    throw new Error("Email and OTP are required");
  }

  if (otp.length !== 6) {
    throw new Error("OTP must be 6 digits");
  }

  type = type || "register";

  let user;
  if (type == "register") {
    user = await TempUser.findOne({ email });
  } else if (type == "login") {
    user = await User.findOne({ email });
  } else {
    throw new Error("Invalid type");
  }
  if (!user) {
    throw new Error(
      "Registration details not found or expired. Please register again.",
    );
  }

  if (!user.otp_code || user.otp_code !== otp) {
    throw new Error("Invalid OTP");
  }

  if (Date.now() > user.otp_expires_at) {
    throw new Error("OTP has expired. Please request a new OTP.");
  }

  if (type === "register") {
    user.isVerified = true;
    user.otp_code = null;
    user.otp_expires_at = null;
    await user.save();

    const registeredUser = await userService.createuser({
      tempuser: user
    });

    return registeredUser;
  } else {
    user.otp_code = null;
    user.otp_expires_at = null;
    await user.save();
    return user;
  }
};

module.exports.sendPasswordResetOTP = async ({ email }) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const otp = generateotp();
  user.otp_code = otp;
  user.otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);
  await user.save();

  try {
    const mailOptions = {
      from: `"DevHub Support" <${process.env.EMAIL_OWNER || process.env.BRAVO_EMAIL || 'support@devhub.com'}>`,
      to: email,
      replyTo: email,
      subject: "Reset Your Password - OTP Verification Code",
      html: getOTPEmailTemplate(user.username, otp, "Password Reset"),
    };
    await emailsender.sendMail(mailOptions);
  } catch (error) {
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }

  return { email, otp };
};
