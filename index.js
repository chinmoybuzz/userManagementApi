require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const apiRoute = require("../userManagementBackend/routes/api.v1.route");
const connectDb = require("./Db/dbConnect");

const start = async () => {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api/v1", apiRoute);
  await connectDb();
  app.listen(process.env.PORT, () => {
    console.log("running on 3000");
  });
};

start();
