const express = require("express");

const app = express();
app.use(express.json());
const userRouter = require("./routes/user");

app.use("/api/user", userRouter);

app.get("/about", (req, res) => {
  res.send("<h1>Hello I am from your backend about</h1>");
});

app.listen(8000, () => {
  console.log("The port is listening on PORT 8000");
});
