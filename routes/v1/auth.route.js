const express = require("express");
const router = express.Router();
const AuthController = require("../../controller/auth.controller");

router.route("/login").post(AuthController.login);
router.route("/signup").post(AuthController.signup);
router.route("/refreshToken").post(AuthController.refreshToken);

module.exports = router;
