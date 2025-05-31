const mongoose = require("mongoose");
require("dotenv").config();
const Db_url = process.env.DB_URL;
const connectDb = () => {
  try {
    mongoose.set("runValidators");
    mongoose.connection.on("connected", () => {
      console.log("Db Connected SuccessFully");
    });
    return mongoose.connect(Db_url);
  } catch (error) {
    mongoose.connection.on("error", (error) => {
      console.log("error", error);
      process.exit(1);
    });
  }
};

module.exports = connectDb;
