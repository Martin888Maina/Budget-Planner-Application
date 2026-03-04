import api from './api';

export const transactionService = {
  getAll: (params) => api.get('/transactions', { params }),
  getOne: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  remove: (id) => api.delete(`/transactions/${id}`),
  bulkDelete: (ids) => api.delete('/transactions/bulk', { data: { ids } }),
  exportCSV: (params) =>
    api.get('/transactions/export/csv', { params, responseType: 'blob' }),
};
