import api from './api';

export const budgetService = {
  getAll: (params) => api.get('/budgets', { params }),
  getOne: (id) => api.get(`/budgets/${id}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  remove: (id) => api.delete(`/budgets/${id}`),
  toggleStatus: (id) => api.put(`/budgets/${id}/status`),

  getAllocations: (budgetId) => api.get(`/budgets/${budgetId}/allocations`),
  createAllocation: (budgetId, data) => api.post(`/budgets/${budgetId}/allocations`, data),
  updateAllocation: (budgetId, allocId, data) =>
    api.put(`/budgets/${budgetId}/allocations/${allocId}`, data),
  deleteAllocation: (budgetId, allocId) =>
    api.delete(`/budgets/${budgetId}/allocations/${allocId}`),
};
