const nodemailer = require("nodemailer");
require("dotenv").config();

const emailsender = nodemailer.createTransport({
  host: process.env.BRAVO_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.BRAVO_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.BRAVO_EMAIL,
    pass: process.env.BRAVO_PASSWORD,
  }
});

module.exports = emailsender;
