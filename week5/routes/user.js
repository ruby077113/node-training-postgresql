const express = require("express");
const bcrypt = require("bcrypt");
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("user");
const { errorResponse, successResponse } = require("../utils/response");
const { validateString, validatedInteger } = require("../utils/validation");

const router = express.Router();
const saltRounds = 10;

router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!validateString(name) || !validateString(email)) {
      errorResponse(res, 400, "欄位未填寫正確");
      return;
    }
    const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/;
    if (!validateString(password) || !passwordPattern.test(password)) {
      errorResponse(
        res,
        400,
        "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
      );
      return;
    }

    const User = dataSource.getRepository("User");

    const existUser = await User.findOne({
      where: {
        email,
      },
    });
    console.log("existUser", existUser);
    if (existUser) {
      errorResponse(res, 409, "Email 已被使用");
      return;
    }
    // 建立新使用者
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const newUser = User.create({
      name,
      email,
      role: "USER",
      password,
    });
    const savedUser = await User.save(newUser);
    const { password: pwd, ...user } = savedUser;
    logger.info("新建立的使用者ID:", savedUser.id);
    successResponse(res, user, 201);
  } catch (error) {
    logger.error("建立使用者錯誤:", error);
    next(error);
  }
});
module.exports = router;
