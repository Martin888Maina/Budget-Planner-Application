const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

const getIncomes = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 15,
      sortBy = 'date',
      sortOrder = 'desc',
      source,
      budgetId,
      startDate,
      endDate,
      isRecurring,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where = { userId: req.user.id };

    if (source) where.source = { contains: source, mode: 'insensitive' };
    if (budgetId) where.budgetId = budgetId;
    if (isRecurring !== undefined) where.isRecurring = isRecurring === 'true';
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const allowedSortFields = ['date', 'amount', 'source', 'createdAt'];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'date';

    const [incomes, total] = await Promise.all([
      prisma.income.findMany({
        where,
        include: {
          category: true,
          budget: { select: { id: true, title: true } },
        },
        orderBy: { [orderField]: sortOrder === 'asc' ? 'asc' : 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.income.count({ where }),
    ]);

    const formatted = incomes.map((i) => ({ ...i, amount: Number(i.amount) }));

    res.json({
      success: true,
      data: { incomes: formatted },
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getIncome = async (req, res, next) => {
  try {
    const income = await prisma.income.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { category: true, budget: { select: { id: true, title: true } } },
    });

    if (!income) return next(new AppError('Income not found', 404));

    res.json({
      success: true,
      data: { income: { ...income, amount: Number(income.amount) } },
    });
  } catch (err) {
    next(err);
  }
};

const createIncome = async (req, res, next) => {
  try {
    const { amount, source, description, date, isRecurring, budgetId, categoryId } = req.body;

    if (budgetId) {
      const budget = await prisma.budget.findFirst({
        where: { id: budgetId, userId: req.user.id },
      });
      if (!budget) return next(new AppError('Budget not found', 404));
    }

    const income = await prisma.income.create({
      data: {
        amount,
        source,
        description,
        date: date ? new Date(date) : new Date(),
        isRecurring: isRecurring || false,
        userId: req.user.id,
        budgetId: budgetId || null,
        categoryId: categoryId || null,
      },
      include: { category: true, budget: { select: { id: true, title: true } } },
    });

    res.status(201).json({
      success: true,
      data: { income: { ...income, amount: Number(income.amount) } },
    });
  } catch (err) {
    next(err);
  }
};

const updateIncome = async (req, res, next) => {
  try {
    const existing = await prisma.income.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return next(new AppError('Income not found', 404));

    const { amount, source, description, date, isRecurring, budgetId, categoryId } = req.body;

    const updated = await prisma.income.update({
      where: { id: req.params.id },
      data: {
        ...(amount !== undefined && { amount }),
        ...(source !== undefined && { source }),
        ...(description !== undefined && { description }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(budgetId !== undefined && { budgetId: budgetId || null }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
      },
      include: { category: true, budget: { select: { id: true, title: true } } },
    });

    res.json({
      success: true,
      data: { income: { ...updated, amount: Number(updated.amount) } },
    });
  } catch (err) {
    next(err);
  }
};

const deleteIncome = async (req, res, next) => {
  try {
    const existing = await prisma.income.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return next(new AppError('Income not found', 404));

    await prisma.income.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Income deleted' } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getIncomes, getIncome, createIncome, updateIncome, deleteIncome };
