const express = require("express");
const router = express.Router();
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("coaches");
const { errorResponse, successResponse } = require("../utils/response");
const { validateString, validatedInteger } = require("../utils/validation");

router.get("/:coachId", async (req, res, next) => {
  try {
    const { coachId } = req.params;
    const CoachRepo = dataSource.getRepository("Coach");
    const coach = await CoachRepo.findOne({ where: { id: coachId } });
    const userId = coach.user_id;
    const UserRepo = dataSource.getRepository("User");
    const user = await UserRepo.findOne({
      select: ["name", "role"],
      where: { id: userId },
    });
    console.log("user", user);
    successResponse(res, { coach, user });
  } catch (error) {
    logger.error(error);
    next(error);
  }
});
router.get("/", async (req, res, next) => {
  try {
    const { page, per } = req.query;
    const CoachRepo = dataSource.getRepository("Coach");

    const coachList = await dataSource
      .getRepository("Coach")
      .createQueryBuilder("coach")
      .innerJoin("USER", "user", "coach.user_id = user.id")
      .select(["coach.id AS id", "user.name AS name"])
      .skip((page - 1) * per)
      .take(per)
      .getRawMany();

    successResponse(res, coachList);
  } catch (error) {
    logger.error(error);
    next(error);
  }
});
module.exports = router;
