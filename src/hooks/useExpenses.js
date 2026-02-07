import { useState, useEffect, useCallback } from 'react';
import { expenseService } from '@/services/expenseService';
import { useBank } from './useBank';

export function useExpenses(filters = {}) {
  const { bankId } = useBank();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    if (!bankId) return;
    setLoading(true);
    try {
      const data = await expenseService.getAll(bankId, filters);
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  }, [bankId, JSON.stringify(filters)]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return { expenses, loading, refresh: fetchExpenses };
}
