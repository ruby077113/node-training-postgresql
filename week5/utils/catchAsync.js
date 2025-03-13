const catchAsync =
  (fn, logger = "App") =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next, logger)).catch((err) => {
      if (logger) logger.error(err);
      console.log("err", err);
      return next(err);
    });
  };

module.exports = catchAsync;
