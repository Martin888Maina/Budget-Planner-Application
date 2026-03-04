const express = require('express');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createBudgetSchema,
  updateBudgetSchema,
  allocationSchema,
  updateAllocationSchema,
} = require('../schemas/budgetSchema');
const {
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
} = require('../controllers/budgetController');

const router = express.Router();

// all budget routes require auth
router.use(authenticate);

router.get('/', getBudgets);
router.post('/', validate(createBudgetSchema), createBudget);
router.get('/:id', getBudget);
router.put('/:id', validate(updateBudgetSchema), updateBudget);
router.delete('/:id', deleteBudget);
router.put('/:id/status', toggleBudgetStatus);

// allocation sub-routes
router.get('/:id/allocations', getAllocations);
router.post('/:id/allocations', validate(allocationSchema), createAllocation);
router.put('/:id/allocations/:allocId', validate(updateAllocationSchema), updateAllocation);
router.delete('/:id/allocations/:allocId', deleteAllocation);

module.exports = router;
