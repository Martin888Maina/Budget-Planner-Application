const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

const getTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 15,
      sortBy = 'date',
      sortOrder = 'desc',
      categoryId,
      budgetId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where = { userId: req.user.id };

    if (categoryId) where.categoryId = categoryId;
    if (budgetId) where.budgetId = budgetId;
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = Number(minAmount);
      if (maxAmount) where.amount.lte = Number(maxAmount);
    }

    // only allow sorting on safe fields
    const allowedSortFields = ['date', 'amount', 'description', 'createdAt'];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'date';

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
          budget: { select: { id: true, title: true } },
        },
        orderBy: { [orderField]: sortOrder === 'asc' ? 'asc' : 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.transaction.count({ where }),
    ]);

    const formatted = transactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
    }));

    res.json({
      success: true,
      data: { transactions: formatted },
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

const getTransaction = async (req, res, next) => {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { category: true, budget: { select: { id: true, title: true } } },
    });

    if (!transaction) return next(new AppError('Transaction not found', 404));

    res.json({
      success: true,
      data: { transaction: { ...transaction, amount: Number(transaction.amount) } },
    });
  } catch (err) {
    next(err);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const { amount, description, date, notes, budgetId, categoryId } = req.body;

    // verify the budget belongs to this user if one was provided
    if (budgetId) {
      const budget = await prisma.budget.findFirst({
        where: { id: budgetId, userId: req.user.id },
      });
      if (!budget) return next(new AppError('Budget not found', 404));
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        description,
        date: date ? new Date(date) : new Date(),
        notes,
        userId: req.user.id,
        budgetId: budgetId || null,
        categoryId: categoryId || null,
      },
      include: { category: true, budget: { select: { id: true, title: true } } },
    });

    res.status(201).json({
      success: true,
      data: { transaction: { ...transaction, amount: Number(transaction.amount) } },
    });
  } catch (err) {
    next(err);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const existing = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return next(new AppError('Transaction not found', 404));

    const { amount, description, date, notes, budgetId, categoryId } = req.body;

    const updated = await prisma.transaction.update({
      where: { id: req.params.id },
      data: {
        ...(amount !== undefined && { amount }),
        ...(description !== undefined && { description }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(notes !== undefined && { notes }),
        ...(budgetId !== undefined && { budgetId: budgetId || null }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
      },
      include: { category: true, budget: { select: { id: true, title: true } } },
    });

    res.json({
      success: true,
      data: { transaction: { ...updated, amount: Number(updated.amount) } },
    });
  } catch (err) {
    next(err);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const existing = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return next(new AppError('Transaction not found', 404));

    await prisma.transaction.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Transaction deleted' } });
  } catch (err) {
    next(err);
  }
};

// delete a batch of transactions in one go
const bulkDeleteTransactions = async (req, res, next) => {
  try {
    const { ids } = req.body;

    // only delete transactions that actually belong to this user
    const result = await prisma.transaction.deleteMany({
      where: { id: { in: ids }, userId: req.user.id },
    });

    res.json({
      success: true,
      data: { message: `${result.count} transaction(s) deleted` },
    });
  } catch (err) {
    next(err);
  }
};

// stream transactions as a CSV download
const exportTransactionsCSV = async (req, res, next) => {
  try {
    const { categoryId, budgetId, startDate, endDate } = req.query;

    const where = { userId: req.user.id };
    if (categoryId) where.categoryId = categoryId;
    if (budgetId) where.budgetId = budgetId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        budget: { select: { id: true, title: true } },
      },
      orderBy: { date: 'desc' },
    });

    const header = 'Date,Description,Category,Budget,Amount,Notes\n';
    const rows = transactions
      .map((t) => {
        const date = t.date.toISOString().split('T')[0];
        const category = t.category?.name || '';
        const budget = t.budget?.title || '';
        const notes = (t.notes || '').replace(/"/g, '""');
        const description = t.description.replace(/"/g, '""');
        return `${date},"${description}","${category}","${budget}",${Number(t.amount)},"${notes}"`;
      })
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.send(header + rows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkDeleteTransactions,
  exportTransactionsCSV,
};
