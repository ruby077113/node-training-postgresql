const express = require("express");
const router = express.Router();
const config = require("../../config/index");
const { dataSource } = require("../../db/data-source");
const logger = require("../../utils/logger")("admin-coaches");

const auth = require("../../middlewares/auth")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
});
const isCoach = require("../../middlewares/isCoach");
const {
  createCoachCourse,
  updateCoachCourse,
  createUserToCoach,
} = require("../../controllers/admin");

// 新增教練課程資料
/**
 * body
 * {
	"user_id" : "1c8da31a-5fd2-44f3-897e-4a259e7ec62b",
	"skill_id" : "1c8da31a-5fd2-44f3-897e-4a259e7ec62b",
	"name" : "瑜伽課程",
	"description" : "瑜伽課程介紹",
	"start_at" : "2025-01-01 16:00:00",
	"end_at" : "2025-01-01 18:00:00",
	"max_participants" : 10,
	"meeting_url" : "https://...."
}
 */
router.post("/courses", auth, isCoach, createCoachCourse);

// 更新教練課程資料
router.put("/courses/:courseId", auth, isCoach, updateCoachCourse);

// 將使用者新增為教練
router.post("/:userId", createUserToCoach);

module.exports = router;
