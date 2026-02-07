import { useState, useEffect, useCallback } from 'react';
import { handCashService } from '@/services/handCashService';
import { useBank } from './useBank';

export function useHandCash() {
  const { bankId } = useBank();
  const [handCash, setHandCash] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!bankId) return;
    setLoading(true);
    try {
      const data = await handCashService.get(bankId);
      setHandCash(data);
    } catch (error) {
      console.error('Error fetching hand cash:', error);
    } finally {
      setLoading(false);
    }
  }, [bankId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    handCash,
    balance: handCash?.balance || 0,
    loading,
    refresh: fetch,
    updateThreshold: async (threshold) => {
      await handCashService.updateThreshold(bankId, threshold);
      await fetch();
    },
  };
}
