const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/token');
const { AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

// register a new user
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // bail if email is already taken
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return next(new AppError('An account with that email already exists', 409));
    }

    // hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, currency: true, createdAt: true },
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
};

// login and return a JWT
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    const token = generateToken(user);

    // strip the password out before sending back
    const { password: _pw, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: { user: userWithoutPassword, token },
    });
  } catch (err) {
    next(err);
  }
};

// get the currently logged-in user
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, currency: true, createdAt: true },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

// update name, email, or currency preference
const updateProfile = async (req, res, next) => {
  try {
    const { name, email, currency } = req.body;

    // if they're changing email, make sure it's not already taken
    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id: req.user.id } },
      });
      if (existing) {
        return next(new AppError('That email is already in use', 409));
      }
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(currency && { currency }),
      },
      select: { id: true, name: true, email: true, currency: true, createdAt: true },
    });

    res.json({ success: true, data: { user: updated } });
  } catch (err) {
    next(err);
  }
};

// change password — requires the current one to confirm
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return next(new AppError('Current password is incorrect', 400));
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashed },
    });

    res.json({ success: true, data: { message: 'Password updated successfully' } });
  } catch (err) {
    next(err);
  }
};

// delete the account — wipes everything via cascade
const deleteAccount = async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    res.json({ success: true, data: { message: 'Account deleted' } });
  } catch (err) {
    next(err);
  }
};

// logout is handled client-side by dropping the token
const logout = (req, res) => {
  res.json({ success: true, data: { message: 'Logged out successfully' } });
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
  logout,
};
