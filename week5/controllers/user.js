const bcrypt = require("bcrypt");

const config = require("../config/index");
const generateJWT = require("../utils/generateJWT");
const catchAsync = require("../utils/catchAsync");
const logger = require("../utils/logger")("user");
const { successResponse, errorResponse } = require("../utils/response");
const { validateString, validatedInteger } = require("../utils/validation");
const StatusCode = require("../constant/StatusCode");
const { dataSource } = require("../db/data-source");

const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/;
const pwdPatternError =
  "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字";

const userSignup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!validateString(name) || !validateString(email)) {
    errorResponse(res, StatusCode.BAD_REQUEST, "欄位未填寫正確");
    return;
  }
  if (!validateString(password) || !passwordPattern.test(password)) {
    errorResponse(res, StatusCode.BAD_REQUEST, pwdPatternError);
    return;
  }

  const User = dataSource.getRepository("User");

  const existUser = await User.findOne({
    where: {
      email,
    },
  });
  if (existUser) {
    errorResponse(res, StatusCode.CONFLICT, "Email 已被使用");
    return;
  }
  // 建立新使用者
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  const newUser = User.create({
    name,
    email,
    role: "USER",
    password: hashPassword,
  });
  const savedUser = await User.save(newUser);
  const { password: pwd, ...user } = savedUser;
  logger.info("新建立的使用者ID:", savedUser.id);
  successResponse(res, user, StatusCode.CREATED);
}, logger);

const userLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!validateString(email)) {
    errorResponse(res, StatusCode.BAD_REQUEST, "欄位未填寫正確");
    return;
  }
  if (!validateString(password) || !passwordPattern.test(password)) {
    logger.warn(pwdPatternError);
    errorResponse(res, StatusCode.BAD_REQUEST, pwdPatternError);
    return;
  }
  const userRepository = dataSource.getRepository("User");
  const existingUser = await userRepository.findOne({
    select: ["id", "name", "password"],
    where: { email },
  });

  if (!existingUser) {
    errorResponse(res, StatusCode.BAD_REQUEST, "使用者不存在或密碼輸入錯誤");
    return;
  }
  logger.info(`使用者資料: ${JSON.stringify(existingUser)}`);
  const isMatch = await bcrypt.compare(password, existingUser.password);
  if (!isMatch) {
    errorResponse(res, StatusCode.BAD_REQUEST, "使用者不存在或密碼輸入錯誤");
    return;
  }
  const token = await generateJWT(
    { id: existingUser.id, role: existingUser.role },
    config.get("secret.jwtSecret"),
    { expiresIn: `${config.get("secret.jwtExpiresDay")}` }
  );
  successResponse(res, { token, user: { name: existingUser.name } });
}, logger);

const getUserProfile = catchAsync(async (req, res, next) => {
  // req.user 是 auth middleware 加入的
  const { user } = req;
  const respData = {
    user: {
      name: user.name,
      email: user.email,
    },
  };
  successResponse(res, respData);
}, logger);

const updateUserProfile = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const { name } = req.body;
  if (!validateString(name)) {
    logger.warn("欄位未填寫正確");
    errorResponse(res, StatusCode.BAD_REQUEST, "欄位未填寫正確");
    return;
  }
  const userRepository = dataSource.getRepository("User");
  const user = await userRepository.findOne({
    select: ["name"],
    where: {
      id,
    },
  });
  if (user.name === name) {
    errorResponse(res, StatusCode.BAD_REQUEST, "使用者名稱未變更");
    return;
  }
  const updatedResult = await userRepository.update(
    { id, name: user.name },
    { name }
  );
  if (updatedResult.affected === 0) {
    errorResponse(res, StatusCode.BAD_REQUEST, "更新使用者資料失敗");
    return;
  }
  const result = await userRepository.findOne({
    select: ["name"],
    where: {
      id,
    },
  });
  successResponse(res, { user: result });
}, logger);

module.exports = { userSignup, userLogin, getUserProfile, updateUserProfile };
