const { z } = require('zod');

const createTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().optional(),
  notes: z.string().optional(),
  budgetId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().min(1).optional(),
  date: z.string().optional(),
  notes: z.string().optional().nullable(),
  budgetId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one ID is required'),
});

module.exports = { createTransactionSchema, updateTransactionSchema, bulkDeleteSchema };
