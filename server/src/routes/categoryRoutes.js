const express = require('express');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createCategorySchema, updateCategorySchema } = require('../schemas/categorySchema');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const router = express.Router();

router.use(authenticate);

router.get('/', getCategories);
router.post('/', validate(createCategorySchema), createCategory);
router.put('/:id', validate(updateCategorySchema), updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
