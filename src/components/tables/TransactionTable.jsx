import { formatDateTime } from '@/utils/dateHelpers';
import { formatCurrency } from '@/utils/currency';
import { useBank } from '@/hooks/useBank';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export function TransactionTable({ transactions = [], onEdit }) {
  const { currencySymbol } = useBank();

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-[var(--color-text-muted)]">
        No transactions found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-[var(--color-text-muted)]">Date</th>
            <th className="text-left py-3 px-4 font-medium text-[var(--color-text-muted)]">Type</th>
            <th className="text-left py-3 px-4 font-medium text-[var(--color-text-muted)]">Customer</th>
            <th className="text-left py-3 px-4 font-medium text-[var(--color-text-muted)]">Account</th>
            <th className="text-right py-3 px-4 font-medium text-[var(--color-text-muted)]">Amount</th>
            <th className="text-left py-3 px-4 font-medium text-[var(--color-text-muted)]">By</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr
              key={txn.id}
              className="border-b border-border hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onEdit?.(txn)}
            >
              <td className="py-3 px-4 whitespace-nowrap">{formatDateTime(txn.created_at)}</td>
              <td className="py-3 px-4">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                  txn.type === 'deposit'
                    ? 'bg-success/10 text-success'
                    : 'bg-warning/10 text-warning'
                }`}>
                  {txn.type === 'deposit' ? (
                    <ArrowDownToLine className="h-3 w-3" />
                  ) : (
                    <ArrowUpFromLine className="h-3 w-3" />
                  )}
                  {txn.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                </span>
              </td>
              <td className="py-3 px-4">
                <p className="font-medium">{txn.customer_name}</p>
                {txn.customer_account_no && (
                  <p className="text-xs text-[var(--color-text-muted)]">{txn.customer_account_no}</p>
                )}
              </td>
              <td className="py-3 px-4 text-xs">
                {txn.mother_accounts?.name || 'N/A'}
              </td>
              <td className={`py-3 px-4 text-right font-medium ${
                txn.type === 'deposit' ? 'text-success' : 'text-warning'
              }`}>
                {txn.type === 'deposit' ? '+' : '-'}{formatCurrency(txn.amount, currencySymbol)}
              </td>
              <td className="py-3 px-4 text-xs text-[var(--color-text-muted)]">
                {txn.profiles?.full_name || 'Unknown'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
