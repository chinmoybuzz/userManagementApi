const express = require("express");
const router = express.Router();

router.use("/auth", require("../routes/v1/auth.route"));
router.use("/users", require("../routes/v1/user.route"));

module.exports = router;
