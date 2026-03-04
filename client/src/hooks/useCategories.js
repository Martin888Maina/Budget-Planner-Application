import { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';

export const useCategories = (type) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = type ? { type } : {};
    categoryService
      .getAll(params)
      .then((res) => setCategories(res.data.data.categories))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, [type]);

  return { categories, loading };
};
