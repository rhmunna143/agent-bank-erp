import { useState, useEffect, useCallback } from 'react';
import { motherAccountService } from '@/services/motherAccountService';
import { useBank } from './useBank';

export function useMotherAccounts() {
  const { bankId } = useBank();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    if (!bankId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await motherAccountService.getAll(bankId);
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching mother accounts:', error);
    } finally {
      setLoading(false);
    }
  }, [bankId]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const activeAccounts = accounts.filter((a) => a.is_active);

  return {
    accounts,
    activeAccounts,
    loading,
    refresh: fetchAccounts,
    create: async (account) => {
      const created = await motherAccountService.create({ ...account, bank_id: bankId });
      await fetchAccounts();
      return created;
    },
    update: async (id, updates) => {
      const updated = await motherAccountService.update(id, updates);
      await fetchAccounts();
      return updated;
    },
    toggleActive: async (id, isActive) => {
      await motherAccountService.toggleActive(id, isActive);
      await fetchAccounts();
    },
  };
}
