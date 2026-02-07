import { transactionService } from './transactionService';
import { dailyLogService } from './dailyLogService';

export const reportService = {
  async generateReportData(bankId, startDate, endDate) {
    const [transactions, cashIns, expenses, dailyLogs] = await Promise.all([
      transactionService.getTransactions(bankId, { startDate, endDate }),
      transactionService.getCashInTransactions(bankId, { startDate, endDate }),
      transactionService.getExpenses(bankId, { startDate, endDate }),
      dailyLogService.getByDateRange(bankId, startDate.split('T')[0], endDate.split('T')[0]),
    ]);

    const depositTxns = (transactions.data || []).filter((t) => t.type === 'deposit');
    const withdrawalTxns = (transactions.data || []).filter((t) => t.type === 'withdrawal');

    const totalDeposits = depositTxns.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalWithdrawals = withdrawalTxns.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalCashIn = (cashIns || []).reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpenses = (expenses || []).reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Group expenses by category
    const expensesByCategory = {};
    (expenses || []).forEach((e) => {
      const catName = e.expense_categories?.name || 'Unknown';
      if (!expensesByCategory[catName]) {
        expensesByCategory[catName] = 0;
      }
      expensesByCategory[catName] += parseFloat(e.amount);
    });

    return {
      summary: {
        totalDeposits,
        totalWithdrawals,
        totalCashIn,
        totalExpenses,
        netFlow: totalDeposits - totalWithdrawals + totalCashIn - totalExpenses,
      },
      deposits: depositTxns,
      withdrawals: withdrawalTxns,
      cashIns: cashIns || [],
      expenses: expenses || [],
      expensesByCategory,
      dailyLogs: dailyLogs || [],
      depositCount: depositTxns.length,
      withdrawalCount: withdrawalTxns.length,
    };
  },
};
