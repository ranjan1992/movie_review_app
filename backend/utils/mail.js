const crypto = require("crypto");
const nodemailer = require("nodemailer");
exports.generateOTP = (otp_length = 6) => {
  let OTP = "";
  for (let i = 0; i <= otp_length; i++) {
    const randomVal = Math.round(Math.random() * 9);
    OTP += randomVal;
  }
  return OTP;
};

exports.generateMailTransporter = () =>
  nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "30579383b9f35d",
      pass: "460b96cd73b2e4",
    },
  });

exports.sendError = (res, error, statusCode = 401) =>
  res.status(statusCode).json({ error });

exports.generateRandomByte = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(30, (err, buff) => {
      if (err) reject(err);
      const buffString = buff.toString("hex");
      console.log(buffString);
      resolve(buffString);
    });
  });
};
