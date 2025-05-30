const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.get("/list", (req, res) => {
  res.json({
    name: "chinmoy",
    title: "Hembram",
  });
});

app.listen(3000, () => {
  console.log("running on 3000");
});
