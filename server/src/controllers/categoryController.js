const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

// return default categories + whatever the user has created
const getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;

    const where = {
      OR: [{ isDefault: true }, { userId: req.user.id }],
    };

    if (type) where.type = type;

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    res.json({ success: true, data: { categories } });
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, icon, color, type } = req.body;

    // don't allow duplicates within the user's own categories
    const existing = await prisma.category.findFirst({
      where: { name, userId: req.user.id },
    });
    if (existing) return next(new AppError('You already have a category with that name', 409));

    const category = await prisma.category.create({
      data: {
        name,
        icon,
        color,
        type: type || 'expense',
        userId: req.user.id,
        isDefault: false,
      },
    });

    res.status(201).json({ success: true, data: { category } });
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await prisma.category.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    // only the user's own categories can be edited — not the defaults
    if (!category) return next(new AppError('Category not found or cannot be edited', 404));

    const { name, icon, color, type } = req.body;

    const updated = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(type !== undefined && { type }),
      },
    });

    res.json({ success: true, data: { category: updated } });
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await prisma.category.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!category) return next(new AppError('Category not found or cannot be deleted', 404));

    // check if anything references this category before deleting
    const usageCount = await prisma.transaction.count({
      where: { categoryId: req.params.id },
    });

    if (usageCount > 0) {
      return next(
        new AppError(
          `Cannot delete — this category is used by ${usageCount} transaction(s). Reassign them first.`,
          400
        )
      );
    }

    await prisma.category.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Category deleted' } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
