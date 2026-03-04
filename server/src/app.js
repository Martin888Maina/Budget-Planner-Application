const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middleware/errorHandler');

// route imports
const authRoutes = require('./routes/authRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// security headers
app.use(helmet());

// only allow requests from the frontend origin
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reports', reportRoutes);

// simple health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: { message: 'Route not found' } });
});

app.use(errorHandler);

module.exports = app;
