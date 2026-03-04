const express = require('express');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createIncomeSchema, updateIncomeSchema } = require('../schemas/incomeSchema');
const {
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
} = require('../controllers/incomeController');

const router = express.Router();

router.use(authenticate);

router.get('/', getIncomes);
router.post('/', validate(createIncomeSchema), createIncome);
router.get('/:id', getIncome);
router.put('/:id', validate(updateIncomeSchema), updateIncome);
router.delete('/:id', deleteIncome);

module.exports = router;
