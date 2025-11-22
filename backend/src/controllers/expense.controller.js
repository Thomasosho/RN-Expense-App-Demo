const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

const createExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, category, date, note } = req.body;
    const userId = req.user.id;

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        note: note || null,
        userId
      }
    });

    res.status(201).json({
      message: 'Expense created successfully',
      expense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, startDate, endDate, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build the query filter based on what they're asking for
    const where = {
      userId
    };

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Get both the expenses and total count at the same time
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          date: 'desc'
        }
      }),
      prisma.expense.count({ where })
    ]);

    res.json({
      expenses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getExpenseSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const expenses = await prisma.expense.findMany({
      where: { userId },
      select: {
        category: true,
        amount: true
      }
    });

    // Add up all the expenses by category
    const summary = expenses.reduce((acc, expense) => {
      const category = expense.category;
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {});

    res.json(summary);
  } catch (error) {
    console.error('Get expense summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user.id;
    const { amount, category, date, note } = req.body;

    // Make sure this expense actually exists and belongs to the user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        amount: amount ? parseFloat(amount) : undefined,
        category: category || undefined,
        date: date ? new Date(date) : undefined,
        note: note !== undefined ? note : undefined
      }
    });

    res.json({
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Double check this expense belongs to them before deleting
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await prisma.expense.delete({
      where: { id }
    });

    res.json({
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseSummary,
  updateExpense,
  deleteExpense
};

