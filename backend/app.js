const express = require("express");
require("./db");
const app = express();
app.use(express.json());
const userRouter = require("./routes/user");

app.use("/api/user", userRouter);

app.post(
  "/sign-in",
  (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ error: "email/password missing!" });
    }
    next();
  },
  (req, res) => {
    res.send("<h1>Hello I am from Sign In Page</h1>");
  }
);

app.listen(8000, () => {
  console.log("The port is listening on PORT 8000");
});
