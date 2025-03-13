const catchAsync = require("../utils/catchAsync");
const logger = require("../utils/logger")("skill");
const { successResponse, errorResponse } = require("../utils/response");
const { validateString, validatedInteger } = require("../utils/validation");
const StatusCode = require("../constant/StatusCode");
const { dataSource } = require("../db/data-source");

const getCoachesSkillList = catchAsync(async (req, res, next) => {
  const skills = await dataSource.getRepository("Skill").find({
    select: ["id", "name"],
  });
  successResponse(res, skills);
}, logger);

const createCoachesSkill = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  if (!validateString(name)) {
    errorResponse(res, StatusCode.BAD_REQUEST, "欄位未填寫正確");
    return;
  }
  const skill = dataSource.getRepository("Skill");
  const existSkill = await skill.find({
    where: {
      name,
    },
  });
  if (existSkill.length > 0) {
    errorResponse(res, 409, "資料重複");
    return;
  }
  const newSkill = skill.create({
    name,
  });
  const result = await skill.save(newSkill);
  successResponse(res);
}, logger);

const deleteCoachesSkill = catchAsync(async (req, res, next) => {
  const { skillId } = req.params;
  if (!validateString(skillId)) {
    errorResponse(res, StatusCode.BAD_REQUEST, "ID錯誤");
    return;
  }
  const result = await dataSource.getRepository("Skill").delete(skillId);
  successResponse(res, result);
}, logger);

module.exports = {
  getCoachesSkillList,
  createCoachesSkill,
  deleteCoachesSkill,
};
