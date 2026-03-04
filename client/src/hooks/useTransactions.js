import { useState, useEffect, useCallback } from 'react';
import { transactionService } from '../services/transactionService';

export const useTransactions = (params = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await transactionService.getAll(params);
      setTransactions(res.data.data.transactions);
      setMeta(res.data.meta);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, meta, loading, error, refetch: fetchTransactions };
};
