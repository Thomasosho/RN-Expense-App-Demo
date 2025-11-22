const express = require('express');
const { body, param } = require('express-validator');
const authenticateToken = require('../middleware/auth.middleware');
const {
  createExpense,
  getExpenses,
  getExpenseSummary,
  updateExpense,
  deleteExpense
} = require('../controllers/expense.controller');

const router = express.Router();

// Protect all these routes - need to be logged in
router.use(authenticateToken);

const expenseValidation = [
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('note')
    .optional()
    .trim()
];

const updateExpenseValidation = [
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty if provided'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('note')
    .optional()
    .trim(),
  param('id')
    .isUUID()
    .withMessage('Invalid expense ID')
];

router.post('/', expenseValidation, createExpense);
router.get('/', getExpenses);
router.get('/summary', getExpenseSummary);
router.put('/:id', updateExpenseValidation, updateExpense);
router.delete('/:id', param('id').isUUID().withMessage('Invalid expense ID'), deleteExpense);

module.exports = router;

