const express = require("express");
const router = express.Router();

const { dataSource } = require("../db/data-source");
const config = require("../config/index");

const StatusCode = require("../constant/StatusCode");
const logger = require("../utils/logger")("user");

const auth = require("../middlewares/auth")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
});

const {
  userSignup,
  userLogin,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/user");

const { errorResponse, successResponse } = require("../utils/response");
const { validateString, validatedInteger } = require("../utils/validation");

router.post("/signup", userSignup);

router.post("/login", userLogin);

router.route("/profile").get(auth, getUserProfile).put(auth, updateUserProfile);

module.exports = router;
