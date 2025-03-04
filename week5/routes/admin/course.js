const express = require("express");
const router = express.Router();
const { dataSource } = require("../../db/data-source");
const logger = require("../../utils/logger")("coaches");
const { errorResponse, successResponse } = require("../../utils/response");
const { validateString, validatedInteger } = require("../../utils/validation");

router.get("/:userId", async (req, res, next) => {
  try {
    successResponse(res);
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

module.exports = router;
