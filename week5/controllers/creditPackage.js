const catchAsync = require("../utils/catchAsync");
const logger = require("../utils/logger")("creditPackage");
const { successResponse, errorResponse } = require("../utils/response");
const { validateString, validatedInteger } = require("../utils/validation");
const StatusCode = require("../constant/StatusCode");
const { dataSource } = require("../db/data-source");

const getCreditPackageList = catchAsync(async (req, res, next) => {
  const packages = await dataSource.getRepository("CreditPackage").find({
    select: ["id", "name", "credit_amount", "price"],
  });
  successResponse(res, packages);
}, logger);

const createCreditPackage = catchAsync(async (req, res, next) => {
  const { name, credit_amount: creditAmount, price } = req.body;
  if (
    !validateString(name) ||
    !validatedInteger(creditAmount) ||
    !validatedInteger(price)
  ) {
    errorResponse(res, StatusCode.BAD_REQUEST, "欄位未填寫正確");
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
}, logger);

const buyCreditPackage = catchAsync(async (req, res, next) => {
  const { creditPackageId } = req.params;
  // user id is from auth
  const { id } = req.user;
  const creditPackageRepo = dataSource.getRepository("CreditPackage");
  const creditPackage = await creditPackageRepo.findOne({
    where: { id: creditPackageId },
  });
  if (!creditPackage) {
    errorResponse(res, StatusCode.BAD_REQUEST, "ID錯誤");
  }
  const creditPurchaseRepo = dataSource.getRepository("CreditPurchase");
  const newCreditPurchase = creditPurchaseRepo.create({
    user_id: id,
    credit_package_id: creditPackageId,
    purchased_credits: creditPackage.credit_amount,
    price_paid: creditPackage.price,
    purchaseAt: new Date().toDateString(),
  });
  await creditPurchaseRepo.save(newCreditPurchase);
  successResponse(res);
}, logger);

const deleteCreditPackage = catchAsync(async (req, res, next) => {
  const { creditPackageId } = req.params;
  if (!validateString(creditPackageId)) {
    errorResponse(res, StatusCode.BAD_REQUEST, "ID錯誤");
    return;
  }
  const result = await dataSource
    .getRepository("CreditPackage")
    .delete(creditPackageId);
  successResponse(res, result);
}, logger);

module.exports = {
  getCreditPackageList,
  createCreditPackage,
  buyCreditPackage,
  deleteCreditPackage,
};
