const { z } = require('zod');

const createIncomeSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  source: z.string().min(1, 'Source is required'),
  description: z.string().optional().nullable(),
  date: z.string().optional(),
  isRecurring: z.boolean().optional(),
  budgetId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

const updateIncomeSchema = z.object({
  amount: z.number().positive().optional(),
  source: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  date: z.string().optional(),
  isRecurring: z.boolean().optional(),
  budgetId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

module.exports = { createIncomeSchema, updateIncomeSchema };
