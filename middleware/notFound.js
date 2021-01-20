const createError = require("http-errors");

const notFound = (req, res, next) => {
  // const error = new Error();
  throw createError(404, `Not-Found- ${req.originalUrl}`);
  next();
};

module.exports = notFound;
