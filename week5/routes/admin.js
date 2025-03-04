const express = require("express");
const adminRouter = express.Router();
const { dataSource } = require("../db/data-source");
const coachesRouter = require("./admin/coaches");

adminRouter.use("/coaches", coachesRouter);

module.exports = adminRouter;
