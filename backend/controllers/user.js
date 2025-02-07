const User = require("../models/user");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const EmailVerificationToken = require("../models/emailVerificationToken");
const PasswordResetToken = require("../models/passwordResetToken");
const { isValidObjectId } = require("mongoose");
const {
  generateOTP,
  generateMailTransporter,
  sendError,
  generateRandomByte,
} = require("../utils/mail");
exports.create = async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });

  if (oldUser) return sendError(res, "This email is already in use!");

  const newUser = new User({ name, email, password });
  await newUser.save();

  // generate 6 digit otp
  let OTP = generateOTP();
  // store otp inside our db
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();
  // send that otp to our user

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@reviewapp.coom",
    to: newUser.email,
    subject: "Email Verification",
    html: `
    <p>Your verification OTP</p>
    <h1> ${OTP} </h1>
    `,
  });

  return res
    .status(201)
    .json({ message: "OTP is send to your email. Please verify it!" });
};

exports.verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;
  if (!isValidObjectId(userId)) return sendError(res, "Invalid User!");
  const user = await User.findById(userId);

  if (!user) return sendError(res, "User not found!");

  if (user.isVerified) return sendError(res, "User is already verified!");

  const token = await EmailVerificationToken.findOne({ owner: userId });

  if (!token) return sendError(res, "Token not found!");

  const isMatched = await token.compareToken(OTP);

  if (!isMatched) return sendError(res, "Please submit a valid OTP");

  user.isVerified = true;
  await user.save();

  await EmailVerificationToken.findByIdAndDelete(token._id);

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@reviewapp.com",
    to: user.email,
    subject: "Welcome Email",
    html: "<h1>Welcome to our app and thanks for choosing us.</h1>",
  });

  return res.status(200).json({ message: "Your email is verified!" });
};

exports.resendEmailVerificationToken = async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user) return sendError(res, "User not found!");

  if (user.isVerified) {
    return sendError(res, "This email is already verified!");
  }

  const alreadyHasToken = await EmailVerificationToken.findOne({
    owner: userId,
  });

  if (alreadyHasToken) {
    return sendError(
      res,
      "Only after one hour you can request for another token!"
    );
  }
  let OTP = generateOTP();

  // store otp inside our db
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: user._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();
  // send that otp to our user

  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "30579383b9f35d",
      pass: "460b96cd73b2e4",
    },
  });

  transport.sendMail({
    from: "verification@reviewapp.coom",
    to: user.email,
    subject: "Email Verification",
    html: `
    <p>Your verification OTP</p>
    <h1> ${OTP} </h1>
    `,
  });

  return res.json({ message: "New OTP has been sent to your email account." });
};

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return sendError(res, "Email is missing!");

  const user = await User.findOne({ email });

  if (!user) return sendError(res, "User not found!", 404);

  const alreadyHasToken = await PasswordResetToken.findOne({ owner: user._id });

  if (alreadyHasToken) {
    return sendError(
      res,
      "Only after one hour you can request for another token!"
    );
  }

  const token = await generateRandomByte();

  const newPasswordResetToken = await PasswordResetToken({
    owner: user._id,
    token,
  });
  await newPasswordResetToken.save();

  const resetPasswordUrl = `http://localhost:3000/reset-password?token=${token}&id=${user._id}`;

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "security@reviewapp.coom",
    to: user.email,
    subject: "Reset Password Link",
    html: `
    <p>Click here to change password</p>
    <a href='${resetPasswordUrl}'> Change Password</a>
    `,
  });

  res.json({ message: "Link send to your mail" });
};
