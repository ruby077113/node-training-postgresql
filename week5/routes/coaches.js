const express = require("express");
const router = express.Router();
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("coaches");
const { errorResponse, successResponse } = require("../utils/response");
const { validateString, validatedInteger } = require("../utils/validation");
const { getCoachDetails, getCoachList } = require("../controllers/coaches");
const StatusCode = require("../constant/StatusCode");

router.get("/:coachId", getCoachDetails);
router.get("/", getCoachList);

module.exports = router;
