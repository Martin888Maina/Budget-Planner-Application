const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getSummary,
  getBudgetPerformance,
  getSpendingTrends,
  getIncomeBySource,
  getCategoryComparison,
} = require('../controllers/reportController');

const router = express.Router();

router.use(authenticate);

router.get('/summary', getSummary);
router.get('/budget-performance', getBudgetPerformance);
router.get('/spending-trends', getSpendingTrends);
router.get('/income-by-source', getIncomeBySource);
router.get('/category-comparison', getCategoryComparison);

module.exports = router;
