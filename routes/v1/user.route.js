const express = require("express");
const router = express.Router();
const UserController = require("../../controller/user.controller");
const { authMiddleware, roleChecker } = require("../../middleware/authMiddleware");
router.route("/list").get(authMiddleware, UserController.list);
router.route("/tree-view").get(authMiddleware, UserController.tree);
router.route("/update-parent/parent").patch(authMiddleware, UserController.updateParentId);
module.exports = router;
