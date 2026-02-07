import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBank } from '@/hooks/useBank';
import { useMotherAccounts } from '@/hooks/useMotherAccounts';
import { useHandCash } from '@/hooks/useHandCash';
import { useProfitAccounts } from '@/hooks/useProfitAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useAlerts } from '@/hooks/useAlerts';
import { useTransactionStore } from '@/stores/transactionStore';
import { SummaryCards } from '@/components/charts/SummaryCards';
import { BalanceTrendChart } from '@/components/charts/BalanceTrendChart';
import { ExpenseBreakdownChart } from '@/components/charts/ExpenseBreakdownChart';
import { TransactionTable } from '@/components/tables/TransactionTable';
import { BalanceAlert } from '@/components/alerts/BalanceAlert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { dailyLogService } from '@/services/dailyLogService';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const { bank, bankId } = useBank();
  const { accounts: motherAccounts } = useMotherAccounts();
  const { handCash, balance: handCashBalance } = useHandCash();
  const { accounts: profitAccounts } = useProfitAccounts();
  const { getTodaySummary, getTransactions, getExpenses } = useTransactions();
  const { alerts } = useAlerts();
  const { refreshNeeded } = useTransactionStore();

  const [todaySummary, setTodaySummary] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalCashIn: 0,
    totalExpenses: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingLog, setGeneratingLog] = useState(false);

  const totalMotherBalance = motherAccounts.reduce(
    (sum, acc) => sum + parseFloat(acc.balance || 0), 0
  );
  const totalProfitBalance = profitAccounts.reduce(
    (sum, acc) => sum + parseFloat(acc.balance || 0), 0
  );

  useEffect(() => {
    async function loadData() {
      if (!bankId) return;
      setLoading(true);
      try {
        const [summary, txns, expenses] = await Promise.all([
          getTodaySummary(),
          getTransactions({ limit: 10 }),
          getExpenses({ limit: 100 }),
        ]);

        if (summary) setTodaySummary(summary);
        if (txns?.data) setRecentTransactions(txns.data);

        // Build expense breakdown
        if (expenses) {
          const breakdown = {};
          expenses.forEach((exp) => {
            const cat = exp.expense_categories?.name || 'Other';
            breakdown[cat] = (breakdown[cat] || 0) + parseFloat(exp.amount);
          });
          setExpenseBreakdown(
            Object.entries(breakdown).map(([name, value]) => ({ name, value }))
          );
        }
      } catch (error) {
        console.error('Dashboard load error:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [bankId, refreshNeeded]);

  const handleGenerateDailyLog = async () => {
    setGeneratingLog(true);
    try {
      await dailyLogService.generate(bankId, user.id);
      toast.success('Daily log generated!');
    } catch (error) {
      toast.error('Failed to generate daily log');
    } finally {
      setGeneratingLog(false);
    }
  };

  if (loading && !bank) {
    return <LoadingSpinner className="h-64" />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Dashboard</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Overview of your banking operations
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateDailyLog}
          disabled={generatingLog}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${generatingLog ? 'animate-spin' : ''}`} />
          Generate Daily Log
        </Button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <BalanceAlert alerts={alerts} />
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <SummaryCards
        totalMotherBalance={totalMotherBalance}
        handCashBalance={handCashBalance}
        totalProfitBalance={totalProfitBalance}
        todayDeposits={todaySummary.totalDeposits}
        todayWithdrawals={todaySummary.totalWithdrawals}
        todayExpenses={todaySummary.totalExpenses}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Balance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <BalanceTrendChart data={[]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseBreakdownChart data={expenseBreakdown} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionTable transactions={recentTransactions} />
        </CardContent>
      </Card>
    </div>
  );
}
