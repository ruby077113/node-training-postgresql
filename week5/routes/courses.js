const express = require("express");
const router = express.Router();
const config = require("../config/index");
const logger = require("../utils/logger")("CreditPackage");
const { dataSource } = require("../db/data-source");
const { successResponse, errorResponse } = require("../utils/response");
const { StatusCode } = require("../constant/StatusCode");
const auth = require("../middlewares/auth")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
});

router.get("/", async (req, res, next) => {
  try {
    const coursesRepo = dataSource.getRepository("Course");
    const courseList = await dataSource.getRepository("Course").find({
      select: {
        id: true,
        name: true,
        description: true,
        start_at: true,
        end_at: true,
        max_participants: true,
        User: {
          name: true,
        },
        Skill: {
          name: true,
        },
      },
      relations: {
        User: true,
        Skill: true,
      },
    });

    const data = courseList.map((course) => ({
      id: course.id,
      coach_name: course.User.name,
      skill_name: course.Skill.name,
      name: course.name,
      description: course.description,
      start_at: course.start_at,
      end_at: course.end_at,
      max_participants: course.max_participants,
    }));
    successResponse(res, data);
  } catch (error) {
    logger.error("取得課程列表錯誤", error);
    next(error);
  }
});

router
  .route("/:courseId")
  .post(auth, async (req, res, next) => {
    try {
      const { id } = req.user;
      const { courseId } = req.params;
      const CourseRepo = dataSource.getRepository("Course");
      const course = await CourseRepo.findOne({
        where: {
          id: courseId,
        },
      });
      if (!course) {
        errorResponse(res, StatusCode.BAD_REQUEST, "課程不存在");
      }
      const CourseBookingRepo = dataSource.getRepository("CourseBooking");
      const existedBooking = await CourseBookingRepo.findOne({
        where: {
          user_id: id,
          course_id: courseId,
        },
      });
      if (existedBooking) {
        errorResponse(res, StatusCode.BAD_REQUEST, "已報名過此課程");
      }
      const newBooking = CourseBookingRepo.create({
        user_id: id,
        course_id: courseId,
      });
      const result = await CourseBookingRepo.save(newBooking);
      successResponse(res, result);
    } catch (error) {
      logger.error("報名課程錯誤", error);
      next(error);
    }
  })
  .delete(auth, async (req, res, next) => {
    try {
      const { id } = req.user;
      const { courseId } = req.params;
      const CourseBookingRepo = dataSource.getRepository("CourseBooking");
      const existedBooking = await CourseBookingRepo.findOne({
        where: {
          user_id: id,
          course_id: courseId,
        },
      });
      if (!existedBooking) {
        errorResponse(res, StatusCode.BAD_REQUEST, "未報名此課程");
      }
      const result = await CourseBookingRepo.remove(existedBooking);
      if (result.affected === 0) {
        errorResponse(res, StatusCode.BAD_REQUEST, "取消報名失敗");
      }
      successResponse(res, null);
    } catch (error) {
      logger.error("取消報名課程錯誤", error);
      next(error);
    }
  });

module.exports = router;
