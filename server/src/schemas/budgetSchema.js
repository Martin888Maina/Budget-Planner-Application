const { z } = require('zod');

const createBudgetSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  totalAmount: z.number().positive('Total amount must be positive'),
  startDate: z.string().datetime({ offset: true }).or(z.string().min(1)),
  endDate: z.string().datetime({ offset: true }).or(z.string().min(1)),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

const updateBudgetSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  totalAmount: z.number().positive().optional(),
  startDate: z.string().min(1).optional(),
  endDate: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

const allocationSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Allocation amount must be positive'),
});

const updateAllocationSchema = z.object({
  amount: z.number().positive('Allocation amount must be positive'),
});

module.exports = {
  createBudgetSchema,
  updateBudgetSchema,
  allocationSchema,
  updateAllocationSchema,
};
