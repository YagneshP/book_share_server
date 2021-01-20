//async wrapper for  async error handling

function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
}

module.exports = {
  wrapAsync,
};
