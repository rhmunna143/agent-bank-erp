import { transactionService } from './transactionService';
import { expenseService } from './expenseService';
import { dailyLogService } from './dailyLogService';
import { handCashService } from './handCashService';

export const reportService = {
  async generateReportData(bankId, startDate, endDate, reportType = 'full') {
    const startISO = `${startDate}T00:00:00`;
    const endISO = `${endDate}T23:59:59`;

    const includeTransactions = reportType !== 'expenses_only';
    const includeExpenses = reportType !== 'no_expenses';

    const promises = [];

    // Transactions (deposits, withdrawals, cash_in)
    if (includeTransactions) {
      promises.push(
        transactionService.getTransactions(bankId, { startDate: startISO, endDate: endISO, limit: 5000 }),
        transactionService.getCashInTransactions(bankId, { startDate: startISO, endDate: endISO }),
      );
    } else {
      promises.push(Promise.resolve({ data: [] }), Promise.resolve([]));
    }

    // Expenses
    if (includeExpenses) {
      promises.push(
        expenseService.getAll(bankId, { startDate: startISO, endDate: endISO, limit: 5000 }),
      );
    } else {
      promises.push(Promise.resolve({ data: [] }));
    }

    // Daily logs + hand cash
    promises.push(
      dailyLogService.getByDateRange(bankId, startDate, endDate),
      handCashService.get(bankId),
    );

    const [transactions, cashIns, expensesResult, dailyLogs, handCash] = await Promise.all(promises);

    // Include deposit, withdrawal and cash_in in transaction details.
    const allTxn = transactions.data || transactions || [];
    const cashInTxns = cashIns || [];
    // Merge main transactions with cash-in records, sort by date descending
    const txnData = [...allTxn, ...cashInTxns]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const expensesData = expensesResult.data || expensesResult || [];

    const depositTxns = txnData.filter((t) => t.type === 'deposit');
    const withdrawalTxns = txnData.filter((t) => t.type === 'withdrawal');

    const totalDeposits = depositTxns.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalWithdrawals = withdrawalTxns.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalCashIn = cashInTxns.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpenses = expensesData.reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Group expenses by category
    const expensesByCategory = {};
    expensesData.forEach((e) => {
      const catName = e.expense_categories?.name || 'Unknown';
      if (!expensesByCategory[catName]) expensesByCategory[catName] = 0;
      expensesByCategory[catName] += parseFloat(e.amount);
    });

    return {
      reportType,
      totalDeposits,
      totalWithdrawals,
      totalCashIn,
      totalExpenses,
      handCashBalance: parseFloat(handCash?.balance || 0),
      netFlow: totalDeposits - totalWithdrawals + totalCashIn - totalExpenses,
      transactions: txnData,
      deposits: depositTxns,
      withdrawals: withdrawalTxns,
      cashIns: cashInTxns,
      expenses: expensesData,
      expensesByCategory,
      dailyLogs: dailyLogs || [],
      depositCount: depositTxns.length,
      withdrawalCount: withdrawalTxns.length,
      cashInCount: cashInTxns.length,
      expenseCount: expensesData.length,
    };
  },
};
