import { supabase } from './supabaseClient';

export const dailyLogService = {
  async generate(bankId, userId) {
    const today = new Date().toISOString().split('T')[0];

    // Check if log already exists
    const { data: existing } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('bank_id', bankId)
      .eq('log_date', today)
      .single();

    if (existing) {
      // Update existing log
      return this.updateLog(existing.id, bankId, today, userId);
    }

    return this.createLog(bankId, today, userId);
  },

  async createLog(bankId, date, userId) {
    const snapshot = await this.getSnapshot(bankId, date);

    const { data, error } = await supabase
      .from('daily_logs')
      .insert({
        bank_id: bankId,
        log_date: date,
        ...snapshot,
        generated_by: userId,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateLog(logId, bankId, date, userId) {
    const snapshot = await this.getSnapshot(bankId, date);

    const { data, error } = await supabase
      .from('daily_logs')
      .update({
        ...snapshot,
        generated_by: userId,
      })
      .eq('id', logId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getSnapshot(bankId, date) {
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const [deposits, withdrawals, cashIns, expenses, handCash, motherAccounts, profitAccounts] =
      await Promise.all([
        supabase
          .from('transactions')
          .select('amount')
          .eq('bank_id', bankId)
          .eq('type', 'deposit')
          .gte('created_at', startOfDay)
          .lte('created_at', endOfDay),
        supabase
          .from('transactions')
          .select('amount')
          .eq('bank_id', bankId)
          .eq('type', 'withdrawal')
          .gte('created_at', startOfDay)
          .lte('created_at', endOfDay),
        supabase
          .from('transactions')
          .select('amount')
          .eq('bank_id', bankId)
          .eq('type', 'cash_in')
          .gte('created_at', startOfDay)
          .lte('created_at', endOfDay),
        supabase
          .from('expenses')
          .select('amount')
          .eq('bank_id', bankId)
          .gte('created_at', startOfDay)
          .lte('created_at', endOfDay),
        supabase
          .from('hand_cash_accounts')
          .select('balance')
          .eq('bank_id', bankId)
          .single(),
        supabase
          .from('mother_accounts')
          .select('id, name, account_number, balance')
          .eq('bank_id', bankId)
          .eq('is_active', true),
        supabase
          .from('profit_accounts')
          .select('id, name, balance')
          .eq('bank_id', bankId),
      ]);

    const sum = (result) =>
      (result.data || []).reduce((acc, item) => acc + parseFloat(item.amount), 0);

    return {
      total_deposits: sum(deposits),
      total_withdrawals: sum(withdrawals),
      total_cash_in: sum(cashIns),
      total_expenses: sum(expenses),
      hand_cash_balance: handCash.data?.balance || 0,
      mother_accounts_snapshot: motherAccounts.data || [],
      profit_accounts_snapshot: profitAccounts.data || [],
    };
  },

  async getByDateRange(bankId, startDate, endDate) {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('bank_id', bankId)
      .gte('log_date', startDate)
      .lte('log_date', endDate)
      .order('log_date', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getLatest(bankId, limit = 30) {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('bank_id', bankId)
      .order('log_date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },
};
