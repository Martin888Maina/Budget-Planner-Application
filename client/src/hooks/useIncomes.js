import { useState, useEffect, useCallback } from 'react';
import { incomeService } from '../services/incomeService';

export const useIncomes = (params = {}) => {
  const [incomes, setIncomes] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIncomes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await incomeService.getAll(params);
      setIncomes(res.data.data.incomes);
      setMeta(res.data.meta);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load incomes');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  return { incomes, meta, loading, error, refetch: fetchIncomes };
};
