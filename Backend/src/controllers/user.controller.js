const userservice = require("../services/user.service");
const otpservice = require("../services/otp.service");

const storeuser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const result = await userservice.storeuser({ username, email, password });

    res.status(201).json({
      message: "Registration successful. Please check your email for the OTP.",
      user: { username: result.user.username, email: result.user.email }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const verifyuser = async (req, res) => {
  try {
    const { email, otp , type } = req.body;
    const result = await otpservice.verifyotp({ email, otp ,type});
    res.status(200).json({
      message: "Email verified successfully. You can now log in.",
      user: { username: result.username, email: result.email }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await userservice.loginuser({ email, password });
    res.status(200).json({
      message: "Login successful",
      token,
      user: { username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const forgetpassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await userservice.forgetpassword({ email });

    res.status(200).json({
      message: "Password reset OTP sent. Please check your email.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resetpassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const result = await userservice.resetpassword({ email, otp, password });
    res.status(200).json({
      message:
        "Password reset successfully. You can now log in with your new password.",
      user: { username: result.username, email: result.email }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const resendotp = async (req, res) => {
  try {
    const { email , type } = req.body;
    const result = await otpservice.resendotp({ email , type});
    res.status(200).json({
      message: "OTP resent successfully."
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


module.exports = {
  storeuser,
  verifyuser,
  login,
  forgetpassword,
  resetpassword,
  resendotp,
};
