const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

// helper — sum up spending per category for a given budget
const getSpendingByCategory = async (budgetId) => {
  const grouped = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { budgetId },
    _sum: { amount: true },
  });

  const map = {};
  for (const row of grouped) {
    if (row.categoryId) {
      map[row.categoryId] = Number(row._sum.amount) || 0;
    }
  }
  return map;
};

// list all budgets for the logged-in user, with spent totals attached
const getBudgets = async (req, res, next) => {
  try {
    const { isActive } = req.query;

    const where = { userId: req.user.id };
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        allocations: { include: { category: true } },
        _count: { select: { transactions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // attach total spent per budget
    const result = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await prisma.transaction.aggregate({
          where: { budgetId: budget.id },
          _sum: { amount: true },
        });
        return {
          ...budget,
          totalSpent: Number(spent._sum.amount) || 0,
          totalAmount: Number(budget.totalAmount),
        };
      })
    );

    res.json({ success: true, data: { budgets: result } });
  } catch (err) {
    next(err);
  }
};

// get a single budget with its allocations and spending breakdown
const getBudget = async (req, res, next) => {
  try {
    const budget = await prisma.budget.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        allocations: { include: { category: true } },
        transactions: {
          include: { category: true },
          orderBy: { date: 'desc' },
          take: 50,
        },
        incomes: { orderBy: { date: 'desc' } },
      },
    });

    if (!budget) return next(new AppError('Budget not found', 404));

    const spendingMap = await getSpendingByCategory(budget.id);

    // enrich each allocation with the spent amount for that category
    const allocations = budget.allocations.map((alloc) => ({
      ...alloc,
      amount: Number(alloc.amount),
      spent: spendingMap[alloc.categoryId] || 0,
      remaining: Number(alloc.amount) - (spendingMap[alloc.categoryId] || 0),
    }));

    const totalSpent = Object.values(spendingMap).reduce((sum, v) => sum + v, 0);

    res.json({
      success: true,
      data: {
        budget: {
          ...budget,
          totalAmount: Number(budget.totalAmount),
          totalSpent,
          allocations,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const createBudget = async (req, res, next) => {
  try {
    const { title, description, totalAmount, startDate, endDate } = req.body;

    const budget = await prisma.budget.create({
      data: {
        title,
        description,
        totalAmount,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      data: { budget: { ...budget, totalAmount: Number(budget.totalAmount) } },
    });
  } catch (err) {
    next(err);
  }
};

const updateBudget = async (req, res, next) => {
  try {
    // make sure the budget belongs to this user
    const existing = await prisma.budget.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return next(new AppError('Budget not found', 404));

    const { title, description, totalAmount, startDate, endDate, isActive } = req.body;

    const updated = await prisma.budget.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(totalAmount !== undefined && { totalAmount }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({
      success: true,
      data: { budget: { ...updated, totalAmount: Number(updated.totalAmount) } },
    });
  } catch (err) {
    next(err);
  }
};

const deleteBudget = async (req, res, next) => {
  try {
    const existing = await prisma.budget.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return next(new AppError('Budget not found', 404));

    await prisma.budget.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Budget deleted' } });
  } catch (err) {
    next(err);
  }
};

// toggle active/inactive without a full update
const toggleBudgetStatus = async (req, res, next) => {
  try {
    const existing = await prisma.budget.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return next(new AppError('Budget not found', 404));

    const updated = await prisma.budget.update({
      where: { id: req.params.id },
      data: { isActive: !existing.isActive },
    });

    res.json({
      success: true,
      data: { budget: { ...updated, totalAmount: Number(updated.totalAmount) } },
    });
  } catch (err) {
    next(err);
  }
};

// --- allocation handlers ---

const getAllocations = async (req, res, next) => {
  try {
    const budget = await prisma.budget.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!budget) return next(new AppError('Budget not found', 404));

    const allocations = await prisma.allocation.findMany({
      where: { budgetId: req.params.id },
      include: { category: true },
    });

    const spendingMap = await getSpendingByCategory(req.params.id);

    const enriched = allocations.map((a) => ({
      ...a,
      amount: Number(a.amount),
      spent: spendingMap[a.categoryId] || 0,
      remaining: Number(a.amount) - (spendingMap[a.categoryId] || 0),
    }));

    res.json({ success: true, data: { allocations: enriched } });
  } catch (err) {
    next(err);
  }
};

const createAllocation = async (req, res, next) => {
  try {
    const budget = await prisma.budget.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!budget) return next(new AppError('Budget not found', 404));

    const { categoryId, amount } = req.body;

    const allocation = await prisma.allocation.create({
      data: { budgetId: req.params.id, categoryId, amount },
      include: { category: true },
    });

    res.status(201).json({
      success: true,
      data: { allocation: { ...allocation, amount: Number(allocation.amount) } },
    });
  } catch (err) {
    next(err);
  }
};

const updateAllocation = async (req, res, next) => {
  try {
    // verify ownership through the budget
    const allocation = await prisma.allocation.findFirst({
      where: {
        id: req.params.allocId,
        budget: { userId: req.user.id },
      },
    });
    if (!allocation) return next(new AppError('Allocation not found', 404));

    const updated = await prisma.allocation.update({
      where: { id: req.params.allocId },
      data: { amount: req.body.amount },
      include: { category: true },
    });

    res.json({
      success: true,
      data: { allocation: { ...updated, amount: Number(updated.amount) } },
    });
  } catch (err) {
    next(err);
  }
};

const deleteAllocation = async (req, res, next) => {
  try {
    const allocation = await prisma.allocation.findFirst({
      where: {
        id: req.params.allocId,
        budget: { userId: req.user.id },
      },
    });
    if (!allocation) return next(new AppError('Allocation not found', 404));

    await prisma.allocation.delete({ where: { id: req.params.allocId } });

    res.json({ success: true, data: { message: 'Allocation removed' } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  toggleBudgetStatus,
  getAllocations,
  createAllocation,
  updateAllocation,
  deleteAllocation,
};
