import { useState, useEffect, useCallback } from 'react';
import { reportService } from '../services/reportService';

export const useSummary = (params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportService.getSummary(params);
      setData(res.data.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
};

export const useBudgetPerformance = (budgetId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!budgetId) return;
    setLoading(true);
    try {
      const res = await reportService.getBudgetPerformance({ budgetId });
      setData(res.data.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [budgetId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
};

export const useSpendingTrends = (params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getSpendingTrends(params)
      .then((res) => setData(res.data.data.trends || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [JSON.stringify(params)]);

  return { data, loading };
};

export const useIncomeBySource = (params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getIncomeBySource(params)
      .then((res) => setData(res.data.data.sources || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [JSON.stringify(params)]);

  return { data, loading };
};

export const useCategoryComparison = (params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getCategoryComparison(params)
      .then((res) => setData(res.data.data.comparison || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [JSON.stringify(params)]);

  return { data, loading };
};
