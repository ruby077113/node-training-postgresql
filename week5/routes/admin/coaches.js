const express = require("express");
const router = express.Router();
const config = require("../../config/index");
const { dataSource } = require("../../db/data-source");
const logger = require("../../utils/logger")("admin-coaches");
const { errorResponse, successResponse } = require("../../utils/response");
const { validateString, validatedInteger } = require("../../utils/validation");
const StatusCode = require("../../constant/StatusCode");

const auth = require("../../middlewares/auth")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
});
const isCoach = require("../../middlewares/isCoach");

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
router.post("/courses", auth, isCoach, async (req, res, next) => {
  try {
    const {
      user_id,
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    } = req.body;

    if (
      !validateString(user_id) ||
      !validateString(skill_id) ||
      !validateString(name) ||
      !validateString(description) ||
      !validateString(start_at) ||
      !validateString(end_at) ||
      !validatedInteger(max_participants) ||
      !validateString(meeting_url) ||
      !meeting_url.startsWith("https")
    ) {
      errorResponse(res, StatusCode.BAD_REQUEST, "欄位未正確填寫");
      return;
    }
    const UserRepo = dataSource.getRepository("User");
    const existingUser = await UserRepo.findOne({
      select: ["id", "name", "role"],
      where: { id: user_id },
    });
    if (!existingUser) {
      errorResponse(res, StatusCode.BAD_REQUEST, "使用者不存在");
      return;
    } else if (existingUser.role !== "COACH") {
      errorResponse(res, StatusCode.BAD_REQUEST, "使用者不是教練");
      return;
    }
    const skillRepo = dataSource.getRepository("Skill");
    const existingSkill = await skillRepo.findOne({
      select: ["id"],
      where: { id: skill_id },
    });
    if (!existingSkill) {
      errorResponse(res, StatusCode.BAD_REQUEST, "技能不存在");
      return;
    }
    const CourseRepo = dataSource.getRepository("Course");

    const newCourse = CourseRepo.create({
      user_id,
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    });
    const course = await CourseRepo.save(newCourse);
    successResponse(
      res,
      {
        data: { course },
      },
      201
    );
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

// 更新教練課程資料
router.put("/courses/:courseId", auth, isCoach, async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const {
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    } = req.body;

    if (
      !validateString(courseId) ||
      !validateString(skill_id) ||
      !validateString(name) ||
      !validateString(description) ||
      !validateString(start_at) ||
      !validateString(end_at) ||
      !validatedInteger(max_participants) ||
      !validateString(meeting_url) ||
      !meeting_url.startsWith("https")
    ) {
      errorResponse(res, StatusCode.BAD_REQUEST, "欄位未正確填寫");
      return;
    }

    const skillRepo = dataSource.getRepository("Skill");
    const existingSkill = await skillRepo.findOne({
      select: ["id"],
      where: { id: skill_id },
    });
    if (!existingSkill) {
      errorResponse(res, StatusCode.BAD_REQUEST, "技能不存在");
      return;
    }
    const CourseRepo = dataSource.getRepository("Course");
    const existingCourse = await CourseRepo.findOne({
      where: { id: courseId },
    });
    if (!existingCourse) {
      errorResponse(res, StatusCode.BAD_REQUEST, "課程不存在");
      return;
    }
    const updateCourseResult = await CourseRepo.update(
      { id: courseId },
      {
        skill_id,
        name,
        description,
        start_at,
        end_at,
        max_participants,
        meeting_url,
      }
    );
    if (updateCourseResult.affected === 0) {
      errorResponse(res, StatusCode.BAD_REQUEST, "更新失敗");
      return;
    }
    const course = await CourseRepo.findOne({
      where: { id: courseId },
    });
    successResponse(res, { course }, 201);
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

// 將使用者新增為教練
router.post("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { experience_years, description, profile_image_url } = req.body;
    if (!validateString(description) || !validatedInteger(experience_years)) {
      errorResponse(res, StatusCode.BAD_REQUEST, "欄位未正確填寫");
      return;
    }
    if (
      profile_image_url &&
      !validateString(profile_image_url) &&
      !profile_image_url.startsWith("https")
    ) {
      logger.warn("大頭貼網址錯誤");
      errorResponse(res, StatusCode.BAD_REQUEST, "欄位未正確填寫");
      return;
    }
    const UserRepo = dataSource.getRepository("User");
    const getUser = await UserRepo.findOne({
      select: ["id", "role"],
      where: { id: userId },
    });
    if (!getUser) {
      errorResponse(res, StatusCode.BAD_REQUEST, "使用者不存在");
      return;
    }
    if (getUser.role === "coach") {
      errorResponse(res, StatusCode.BAD_REQUEST, "使用者已經是教練");
      return;
    }
    const CoachRepo = dataSource.getRepository("Coach");
    const newCoach = CoachRepo.create({
      user_id: userId,
      experience_years,
      description,
      profile_image_url,
    });

    const userUpdateResult = await UserRepo.update(
      { id: userId },
      { role: "COACH" }
    );
    if (userUpdateResult.affected === 0) {
      errorResponse(res, StatusCode.BAD_REQUEST, "更新使用者失敗");
      return;
    }
    const coachResult = await CoachRepo.save(newCoach);
    const getNewUser = await UserRepo.findOne({
      select: ["name", "role"],
      where: { id: userId },
    });

    successResponse(res, {
      data: {
        user: getNewUser,
        coach: coachResult,
      },
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

module.exports = router;
