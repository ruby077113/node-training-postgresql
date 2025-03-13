const express = require("express");
const router = express.Router();
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("CreditPackage");
const config = require("../config/index");

const auth = require("../middlewares/auth")({
  secret: config.get("secret").jwtSecret,
  userRepository: dataSource.getRepository("User"),
  logger,
});

const {
  getCreditPackageList,
  createCreditPackage,
  buyCreditPackage,
  deleteCreditPackage,
} = require("../controllers/creditPackage");

router.get("/", getCreditPackageList);

router.post("/", createCreditPackage);

router
  .post("/:creditPackageId", auth, buyCreditPackage)
  .delete("/:creditPackageId", deleteCreditPackage);

module.exports = router;
