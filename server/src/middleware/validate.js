// wraps a zod schema and passes errors to the central handler
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { validate };
