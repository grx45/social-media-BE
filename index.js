const dotenv = require("dotenv");
dotenv.config();
const PORT = 2000 || process.env.PORT;
const express = require("express");
const app = express();
const cors = require("cors");
const bearerToken = require("express-bearer-token");

app.use(cors());
app.use(express.json());
app.use(bearerToken());

app.get("/", (req, res) => {
  res.status(200).send("<h1> Welcome to API </h1>");
});

const userRouter = require("./src/routers/userRouter");
app.use("/user", userRouter);

// ERROR Handling
app.use((error, request, response, next) => {
  if (error) {
    return response.status(500).send(error);
  }
});

app.listen(PORT, () => console.log(`Running API ${PORT}`));
