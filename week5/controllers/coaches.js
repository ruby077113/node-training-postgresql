const catchAsync = require("../utils/catchAsync");
const { dataSource } = require("../db/data-source");
const StatusCode = require("../constant/StatusCode");
const { errorResponse, successResponse } = require("../utils/response");
const logger = require("../utils/logger")("coaches");

const getCoachList = catchAsync(async (req, res, next) => {
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
}, logger);

const getCoachDetails = catchAsync(async (req, res, next) => {
  const { coachId } = req.params;
  const CoachRepo = dataSource.getRepository("Coach");
  const coach = await CoachRepo.findOne({ where: { id: coachId } });
  if (!coach) {
    errorResponse(res, StatusCode.BAD_REQUEST, "ID錯誤");
    return;
  }
  const userId = coach.user_id;
  const UserRepo = dataSource.getRepository("User");
  const user = await UserRepo.findOne({
    select: ["name", "role"],
    where: { id: userId },
  });
  successResponse(res, { coach, user });
}, logger);

module.exports = {
  getCoachList,
  getCoachDetails,
};
