import api from './api';

export const reportService = {
  getSummary: (params) => api.get('/reports/summary', { params }),
  getBudgetPerformance: (params) => api.get('/reports/budget-performance', { params }),
  getSpendingTrends: (params) => api.get('/reports/spending-trends', { params }),
  getIncomeBySource: (params) => api.get('/reports/income-by-source', { params }),
  getCategoryComparison: (params) => api.get('/reports/category-comparison', { params }),
};
