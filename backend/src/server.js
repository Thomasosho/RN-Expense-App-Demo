require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const expenseRoutes = require('./routes/expense.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Need CORS so the mobile app can actually talk to this server
app.use(cors());
// Parse JSON bodies - makes life easier
app.use(express.json());

// All the auth stuff goes here
app.use('/auth', authRoutes);
// And all expense endpoints here
app.use('/expenses', expenseRoutes);

// Quick way to check if the server is alive
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Expense Tracker API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

