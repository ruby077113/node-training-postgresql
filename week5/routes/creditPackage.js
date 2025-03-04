const express = require("express");
const router = express.Router();
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("CreditPackage");
const { errorResponse, successResponse } = require("../utils/response");
const { validateString, validatedInteger } = require("../utils/validation");

router.get("/", async (req, res, next) => {
  try {
    const packages = await dataSource.getRepository("CreditPackage").find({
      select: ["id", "name", "credit_amount", "price"],
    });
    successResponse(res, packages);
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, credit_amount: creditAmount, price } = req.body;
    if (
      !validateString(name) ||
      !validatedInteger(creditAmount) ||
      !validatedInteger(price)
    ) {
      errorResponse(res, 400, "欄位未填寫正確");
      return;
    }
    const creditPackage = dataSource.getRepository("CreditPackage");
    const existPackage = await creditPackage.find({
      where: {
        name,
      },
    });
    if (existPackage.length > 0) {
      errorResponse(res, 409, "資料重複");
      return;
    }
    const newPackage = creditPackage.create({
      name,
      credit_amount: creditAmount,
      price,
    });
    const result = await creditPackage.save(newPackage);
    successResponse(res);
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

router.delete("/:creditPackageId", async (req, res, next) => {
  try {
    const { creditPackageId } = req.params;
    if (!validateString(creditPackageId)) {
      errorResponse(res, 400, "ID錯誤");
      return;
    }
    const result = await dataSource
      .getRepository("CreditPackage")
      .delete(creditPackageId);
    successResponse(res, result);
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

module.exports = router;
