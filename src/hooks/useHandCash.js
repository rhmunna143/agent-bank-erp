import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { handCashService } from '@/services/handCashService';
import { useBank } from './useBank';
import { useTransactionStore } from '@/stores/transactionStore';

export function useHandCash() {
  const { bankId } = useBank();
  const { refreshKey } = useTransactionStore();
  const location = useLocation();
  const [handCash, setHandCash] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!bankId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await handCashService.get(bankId);
      setHandCash(data);
    } catch (error) {
      console.error('Error fetching hand cash:', error);
    } finally {
      setLoading(false);
    }
  }, [bankId, refreshKey]);

  useEffect(() => {
    fetch();
  }, [fetch, location.pathname]);

  return {
    handCash,
    balance: handCash?.balance || 0,
    loading,
    refresh: fetch,
    updateThreshold: async (threshold) => {
      await handCashService.updateThreshold(bankId, threshold);
      await fetch();
    },
    updateBalance: async (newBalance) => {
      await handCashService.updateBalance(bankId, newBalance);
      await fetch();
    },
  };
}
