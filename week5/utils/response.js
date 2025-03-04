function successResponse(res, data = null, statusCode = 200) {
  res.status(statusCode).json({
    status: "success",
    data,
  });
}

function errorResponse(res, statusCode = 500, message = "伺服器錯誤") {
  res.status(statusCode).json({
    status: "failed",
    message,
  });
}

module.exports = {
  successResponse,
  errorResponse,
};
