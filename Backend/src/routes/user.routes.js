const express = require("express");
const {
  storeuser,
  verifyuser,
  login,
  forgetpassword,
  resetpassword,
  resendotp,
} = require("../controllers/user.controller");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("API is running...");
});

router.post("/create-user", storeuser);
router.post("/verify-otp", verifyuser);
router.post("/login", login);
router.post("/forgot-password", forgetpassword);
router.post("/reset-password", resetpassword);
router.post("/resend-otp", resendotp);

module.exports = router;
