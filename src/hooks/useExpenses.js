import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { expenseService } from '@/services/expenseService';
import { useBank } from './useBank';
import { useTransactionStore } from '@/stores/transactionStore';

export function useExpenses(filters = {}) {
  const { bankId } = useBank();
  const { refreshKey } = useTransactionStore();
  const location = useLocation();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    if (!bankId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await expenseService.getAll(bankId, filters);
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  }, [bankId, JSON.stringify(filters), refreshKey]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses, location.pathname]);

  return { expenses, loading, refresh: fetchExpenses };
}
