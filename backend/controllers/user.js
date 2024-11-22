const User = require("../models/user");
const nodemailer = require("nodemailer");
const EmailVerificationToken = require("../models/emailVerificationToken");
exports.create = async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });

  if (oldUser)
    return res.status(401).json({ error: "This email is already in use" });

  const newUser = new User({ name, email, password });
  await newUser.save();

  // generate 6 digit otp
  let OTP = "";
  for (let i = 0; i <= 5; i++) {
    const randomVal = Math.round(Math.random() * 9);
    OTP += randomVal;
  }
  // store otp inside our db
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
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
    to: newUser.email,
    subject: "Email Verification",
    html: `
    <p>Your verification OTP</p>
    <h1> ${OTP} </h1>
    `,
  });

  res.status(201).json({
    message:
      "Please verify your email.OTP has been sent to your email account!",
  });
};
