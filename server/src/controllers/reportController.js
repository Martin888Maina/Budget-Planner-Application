const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// monthly/period summary — income, expenses, net
const getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // default to the current month if no dates provided
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const userId = req.user.id;

    const [incomeAgg, expenseAgg, activeBudgets] = await Promise.all([
      prisma.income.aggregate({
        where: { userId, date: { gte: start, lte: end } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { userId, date: { gte: start, lte: end } },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.budget.count({ where: { userId, isActive: true } }),
    ]);

    const totalIncome = Number(incomeAgg._sum.amount) || 0;
    const totalExpenses = Number(expenseAgg._sum.amount) || 0;

    // top 5 spending categories in the period
    const topCategories = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, date: { gte: start, lte: end } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    });

    const categoryIds = topCategories
      .map((c) => c.categoryId)
      .filter(Boolean);

    const categoryDetails = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const categoryMap = Object.fromEntries(categoryDetails.map((c) => [c.id, c]));

    const topSpending = topCategories.map((c) => ({
      categoryId: c.categoryId,
      category: c.categoryId ? categoryMap[c.categoryId] : null,
      total: Number(c._sum.amount) || 0,
    }));

    res.json({
      success: true,
      data: {
        startDate: start,
        endDate: end,
        totalIncome,
        totalExpenses,
        netSavings: totalIncome - totalExpenses,
        transactionCount: expenseAgg._count,
        incomeCount: incomeAgg._count,
        activeBudgets,
        topSpendingCategories: topSpending,
      },
    });
  } catch (err) {
    next(err);
  }
};

// how each allocation performed — planned vs actual
const getBudgetPerformance = async (req, res, next) => {
  try {
    const { budgetId } = req.query;

    if (!budgetId) {
      return res.status(400).json({
        success: false,
        error: { message: 'budgetId is required' },
      });
    }

    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId: req.user.id },
      include: { allocations: { include: { category: true } } },
    });

    if (!budget) {
      return res.status(404).json({ success: false, error: { message: 'Budget not found' } });
    }

    // group actual spending by category for this budget
    const spending = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { budgetId },
      _sum: { amount: true },
    });

    const spendingMap = Object.fromEntries(
      spending.map((s) => [s.categoryId, Number(s._sum.amount) || 0])
    );

    const performance = budget.allocations.map((alloc) => {
      const allocated = Number(alloc.amount);
      const actual = spendingMap[alloc.categoryId] || 0;
      return {
        categoryId: alloc.categoryId,
        category: alloc.category,
        allocated,
        actual,
        remaining: allocated - actual,
        variance: actual - allocated,
        percentUsed: allocated > 0 ? Math.round((actual / allocated) * 100) : 0,
      };
    });

    const totalAllocated = performance.reduce((s, p) => s + p.allocated, 0);
    const totalActual = performance.reduce((s, p) => s + p.actual, 0);

    res.json({
      success: true,
      data: {
        budget: {
          id: budget.id,
          title: budget.title,
          totalAmount: Number(budget.totalAmount),
          startDate: budget.startDate,
          endDate: budget.endDate,
        },
        totalAllocated,
        totalActual,
        totalRemaining: totalAllocated - totalActual,
        performance,
      },
    });
  } catch (err) {
    next(err);
  }
};

// spending aggregated over time for trend charts
const getSpendingTrends = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    const now = new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const end = endDate ? new Date(endDate) : now;

    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id, date: { gte: start, lte: end } },
      select: { amount: true, date: true },
      orderBy: { date: 'asc' },
    });

    // group in JS — easier than raw SQL and good enough for our volumes
    const grouped = {};
    for (const t of transactions) {
      const key = getGroupKey(t.date, groupBy);
      grouped[key] = (grouped[key] || 0) + Number(t.amount);
    }

    const trends = Object.entries(grouped).map(([period, total]) => ({ period, total }));

    res.json({ success: true, data: { trends, groupBy } });
  } catch (err) {
    next(err);
  }
};

// income broken down by source
const getIncomeBySource = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    const grouped = await prisma.income.groupBy({
      by: ['source'],
      where: { userId: req.user.id, date: { gte: start, lte: end } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    const sources = grouped.map((g) => ({
      source: g.source,
      total: Number(g._sum.amount) || 0,
    }));

    res.json({ success: true, data: { sources } });
  } catch (err) {
    next(err);
  }
};

// compare category spending across months — useful for the bar chart
const getCategoryComparison = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;

    const userId = req.user.id;
    const now = new Date();
    const results = [];

    for (let i = Number(months) - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const grouped = await prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { userId, date: { gte: start, lte: end } },
        _sum: { amount: true },
      });

      const label = start.toLocaleString('default', { month: 'short', year: 'numeric' });
      const categories = grouped.map((g) => ({
        categoryId: g.categoryId,
        total: Number(g._sum.amount) || 0,
      }));

      results.push({ period: label, categories });
    }

    res.json({ success: true, data: { comparison: results } });
  } catch (err) {
    next(err);
  }
};

// little helper to turn a date into a period key
const getGroupKey = (date, groupBy) => {
  const d = new Date(date);
  if (groupBy === 'day') return d.toISOString().split('T')[0];
  if (groupBy === 'week') {
    const week = getWeekNumber(d);
    return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
  }
  // default to month
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

module.exports = {
  getSummary,
  getBudgetPerformance,
  getSpendingTrends,
  getIncomeBySource,
  getCategoryComparison,
};
