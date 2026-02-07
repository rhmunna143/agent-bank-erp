import { supabase } from './supabaseClient';

export const backupService = {
  async createBackup(bankId, label, userId) {
    const { data, error } = await supabase.rpc('create_bank_backup', {
      p_bank_id: bankId,
      p_label: label,
      p_user_id: userId,
    });
    if (error) throw error;
    return data;
  },

  async getBackups(bankId) {
    const { data, error } = await supabase
      .from('bank_backups')
      .select('id, bank_id, label, created_by, created_at')
      .eq('bank_id', bankId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async restoreBackup(backupId, bankId) {
    const { data, error } = await supabase.rpc('restore_bank_backup', {
      p_backup_id: backupId,
      p_bank_id: bankId,
    });
    if (error) throw error;
    return data;
  },

  async deleteBackup(backupId) {
    const { error } = await supabase
      .from('bank_backups')
      .delete()
      .eq('id', backupId);
    if (error) throw error;
  },

  async resetAllData(bankId) {
    const { data, error } = await supabase.rpc('reset_bank_data', {
      p_bank_id: bankId,
    });
    if (error) throw error;
    return data;
  },
};
