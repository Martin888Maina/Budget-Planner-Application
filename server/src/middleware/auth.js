const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

// pull the token out of the Authorization header
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Not authenticated. Please log in.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // expired or tampered token
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }
};

module.exports = { authenticate };
