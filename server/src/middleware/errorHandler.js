// central error handler — all thrown errors end up here
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let details = null;

  // zod validation errors come through as arrays
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation failed';
    details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // prisma unique constraint
  if (err.code === 'P2002') {
    statusCode = 409;
    const field = err.meta?.target?.[0] || 'field';
    message = `A record with that ${field} already exists`;
  }

  // prisma record not found
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  // foreign key constraint failed
  if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Related record does not exist';
  }

  // don't leak stack traces in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details && { details }),
    },
  });
};

module.exports = { AppError, errorHandler };
