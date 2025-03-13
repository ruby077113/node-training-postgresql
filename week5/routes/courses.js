const express = require("express");
const router = express.Router();
const { dataSource } = require("../db/data-source");
const config = require("../config/index");
const logger = require("../utils/logger")("course");
const auth = require("../middlewares/auth")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
});

const {
  getCourseList,
  signUpCourse,
  cancelCourse,
} = require("../controllers/courses");

router.get("/", getCourseList);
router.route("/:courseId").post(auth, signUpCourse).delete(auth, cancelCourse);

module.exports = router;
