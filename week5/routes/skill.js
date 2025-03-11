const express = require("express");
const router = express.Router();
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("Skill");
const { errorResponse, successResponse } = require("../utils/response");
const { validateString, validatedInteger } = require("../utils/validation");
const StatusCode = require("../constant/StatusCode");

router.get("/", async (req, res, next) => {
  try {
    const skills = await dataSource.getRepository("Skill").find({
      select: ["id", "name"],
    });
    successResponse(res, skills);
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
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
  } catch (error) {
    logger.error(error);
    next(error);
  }
});
router.delete("/:skillId", async (req, res, next) => {
  try {
    const { skillId } = req.params;
    if (!validateString(skillId)) {
      errorResponse(res, StatusCode.BAD_REQUEST, "ID錯誤");
      return;
    }
    const result = await dataSource.getRepository("Skill").delete(skillId);
    successResponse(res, result);
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

module.exports = router;
