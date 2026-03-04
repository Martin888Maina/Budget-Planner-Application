import { useState, useEffect, useCallback } from 'react';
import { budgetService } from '../services/budgetService';

export const useBudgets = (filters = {}) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await budgetService.getAll(filters);
      setBudgets(res.data.data.budgets);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  return { budgets, loading, error, refetch: fetchBudgets };
};

export const useBudget = (id) => {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBudget = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await budgetService.getOne(id);
      setBudget(res.data.data.budget);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load budget');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  return { budget, loading, error, refetch: fetchBudget };
};
