const { z } = require('zod');

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  icon: z.string().optional(),
  color: z.string().optional(),
  type: z.enum(['expense', 'income', 'both']).optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  type: z.enum(['expense', 'income', 'both']).optional(),
});

module.exports = { createCategorySchema, updateCategorySchema };
