const express = require("express");
const router = express.Router();
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("Skill");

const {
  getCoachesSkillList,
  createCoachesSkill,
  deleteCoachesSkill,
} = require("../controllers/skill");

router.get("/", getCoachesSkillList);

router.post("/", createCoachesSkill);
router.delete("/:skillId", deleteCoachesSkill);

module.exports = router;
