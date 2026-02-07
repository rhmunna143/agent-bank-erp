import { formatDateTime } from '@/utils/dateHelpers';
import { formatCurrency } from '@/utils/currency';
import { useBank } from '@/hooks/useBank';

export function ExpenseTable({ expenses = [] }) {
  const { currencySymbol } = useBank();

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-[var(--color-text-muted)]">
        No expenses found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-[var(--color-text-muted)]">Date</th>
            <th className="text-left py-3 px-4 font-medium text-[var(--color-text-muted)]">Category</th>
            <th className="text-left py-3 px-4 font-medium text-[var(--color-text-muted)]">Particulars</th>
            <th className="text-right py-3 px-4 font-medium text-[var(--color-text-muted)]">Amount</th>
            <th className="text-left py-3 px-4 font-medium text-[var(--color-text-muted)]">Deducted From</th>
            <th className="text-left py-3 px-4 font-medium text-[var(--color-text-muted)]">By</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="border-b border-border hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 whitespace-nowrap">{formatDateTime(expense.created_at)}</td>
              <td className="py-3 px-4">
                <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                  {expense.expense_categories?.name || 'Unknown'}
                </span>
              </td>
              <td className="py-3 px-4 text-[var(--color-text-muted)]">
                {expense.particulars || '-'}
              </td>
              <td className="py-3 px-4 text-right font-medium text-danger">
                -{formatCurrency(expense.amount, currencySymbol)}
              </td>
              <td className="py-3 px-4 text-xs">
                {expense.deducted_from_type?.replace('_', ' ')}
              </td>
              <td className="py-3 px-4 text-xs text-[var(--color-text-muted)]">
                {expense.profiles?.full_name || 'Unknown'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
