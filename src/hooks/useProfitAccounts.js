import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { profitAccountService } from '@/services/profitAccountService';
import { useBank } from './useBank';
import { useTransactionStore } from '@/stores/transactionStore';

export function useProfitAccounts() {
  const { bankId } = useBank();
  const { refreshKey } = useTransactionStore();
  const location = useLocation();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    if (!bankId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await profitAccountService.getAll(bankId);
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching profit accounts:', error);
    } finally {
      setLoading(false);
    }
  }, [bankId, refreshKey]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts, location.pathname]);

  return {
    accounts,
    loading,
    refresh: fetchAccounts,
    create: async (account) => {
      const created = await profitAccountService.create({ ...account, bank_id: bankId });
      await fetchAccounts();
      return created;
    },
    update: async (id, updates) => {
      const updated = await profitAccountService.update(id, updates);
      await fetchAccounts();
      return updated;
    },
  };
}
