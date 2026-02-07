import { useState, useEffect, useCallback } from 'react';
import { useBank } from '@/hooks/useBank';
import { ExpenseForm } from '@/components/forms/ExpenseForm';
import { ExpenseTable } from '@/components/tables/ExpenseTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import { expenseService } from '@/services/expenseService';
import { transactionService } from '@/services/transactionService';
import { useTransactionStore } from '@/stores/transactionStore';
import { useHandCash } from '@/hooks/useHandCash';
import { useProfitAccounts } from '@/hooks/useProfitAccounts';
import { ITEMS_PER_PAGE } from '@/utils/constants';
import { Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExpensesPage() {
  const { bank, currencySymbol, categories } = useBank();
  const { triggerRefresh } = useTransactionStore();
  const { handCash, refresh: refreshHC } = useHandCash();
  const { accounts: profitAccounts, refresh: refreshPA } = useProfitAccounts();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const fetchExpenses = useCallback(async () => {
    if (!bank?.id) return;
    setLoading(true);
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const { data, count } = await expenseService.getAll(bank.id, {
        limit: ITEMS_PER_PAGE,
        offset,
        category_id: categoryFilter || undefined,
        dateFrom: dateRange.from || undefined,
        dateTo: dateRange.to || undefined,
      });
      setExpenses(data || []);
      setTotal(count || 0);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  }, [bank?.id, page, categoryFilter, dateRange]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleRecordExpense = async (data) => {
    setSubmitting(true);
    try {
      await transactionService.processExpense({
        bank_id: bank.id,
        amount: data.amount,
        category_id: data.category_id,
        deduct_from: data.deducted_from_type,
        profit_account_id: data.deducted_from_type === 'profit_account' ? data.deducted_from_id : null,
        description: data.particulars || null,
        receipt_url: null,
      });
      toast.success('Expense recorded!');
      fetchExpenses();
      refreshHC();
      refreshPA();
      triggerRefresh();
    } catch (error) {
      toast.error(error.message || 'Failed to record expense');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Expenses</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Record and track operational expenses</p>
      </div>

      {/* Record Expense Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-5 w-5" /> Record New Expense
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm
            onSubmit={handleRecordExpense}
            loading={submitting}
            categories={categories}
            profitAccounts={profitAccounts}
          />
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Select>
            <DateRangePicker onChange={(range) => { setDateRange(range); setPage(1); }} />
            <Button variant="outline" onClick={() => { setCategoryFilter(''); setDateRange({ from: '', to: '' }); setPage(1); }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expense List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{total} Expense{total !== 1 ? 's' : ''}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner className="h-48" />
          ) : expenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No Expenses Found"
              description="No expenses match your current filters."
            />
          ) : (
            <>
              <ExpenseTable expenses={expenses} currencySymbol={currencySymbol} />
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border)]">
                  <p className="text-sm text-[var(--color-text-muted)]">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
