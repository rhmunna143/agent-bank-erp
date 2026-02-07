import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/services/userService';
import { useBank } from './useBank';

export function useUsers() {
  const { bankId } = useBank();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!bankId) return;
    setLoading(true);
    try {
      const data = await userService.getMembers(bankId);
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  }, [bankId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    loading,
    refresh: fetchMembers,
    invite: async (email, fullName, phone, invitedBy) => {
      await userService.inviteUser(bankId, email, fullName, phone, invitedBy);
      await fetchMembers();
    },
    remove: async (memberId) => {
      await userService.removeMember(memberId);
      await fetchMembers();
    },
    updateRole: async (memberId, role) => {
      await userService.updateRole(memberId, role);
      await fetchMembers();
    },
  };
}
