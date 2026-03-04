const express = require('express');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createTransactionSchema,
  updateTransactionSchema,
  bulkDeleteSchema,
} = require('../schemas/transactionSchema');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkDeleteTransactions,
  exportTransactionsCSV,
} = require('../controllers/transactionController');

const router = express.Router();

router.use(authenticate);

// export and bulk routes need to come before /:id to avoid conflicts
router.get('/export/csv', exportTransactionsCSV);
router.delete('/bulk', validate(bulkDeleteSchema), bulkDeleteTransactions);

router.get('/', getTransactions);
router.post('/', validate(createTransactionSchema), createTransaction);
router.get('/:id', getTransaction);
router.put('/:id', validate(updateTransactionSchema), updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
