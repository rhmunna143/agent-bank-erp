import { useState } from 'react';
import { useMotherAccounts } from '@/hooks/useMotherAccounts';
import { useHandCash } from '@/hooks/useHandCash';
import { useBank } from '@/hooks/useBank';
import { WithdrawForm } from '@/components/forms/WithdrawForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/utils/currency';
import { ArrowDownRight, Wallet, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionService } from '@/services/transactionService';
import { useTransactionStore } from '@/stores/transactionStore';

export default function WithdrawPage() {
  const { accounts: motherAccounts, loading: maLoading, refresh: refreshMA } = useMotherAccounts();
  const { handCash, loading: hcLoading, refresh: refreshHC } = useHandCash();
  const { bank, currencySymbol } = useBank();
  const { triggerRefresh } = useTransactionStore();
  const [submitting, setSubmitting] = useState(false);

  const handleWithdraw = async (data) => {
    setSubmitting(true);
    try {
      const deductionAmount = data.shortage_enabled ? parseFloat(data.shortage_deduction_amount || 0) : 0;
      if (data.shortage_enabled && deductionAmount > 0) {
        await transactionService.processWithdrawalWithShortage({
          bank_id: bank.id,
          customer_name: data.customer_name,
          customer_account: data.customer_account_no || null,
          amount: data.amount,
          commission: 0,
          mother_account_id: data.shortage_mother_account_id || data.mother_account_id,
          shortage_amount: deductionAmount,
          notes: data.description || null,
        });
      } else {
        await transactionService.processWithdrawal({
          bank_id: bank.id,
          customer_name: data.customer_name,
          customer_account: data.customer_account_no || null,
          amount: data.amount,
          commission: 0,
          mother_account_id: data.mother_account_id,
          notes: data.description || null,
        });
      }
      toast.success('Withdrawal recorded successfully!');
      refreshMA();
      refreshHC();
      triggerRefresh();
    } catch (error) {
      toast.error(error.message || 'Failed to process withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  if (maLoading || hcLoading) return <LoadingSpinner className="h-64" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customer Withdrawal</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Record a customer withdrawal from mother account</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <Wallet className="h-8 w-8 text-[var(--color-primary)]" />
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Hand Cash</p>
              <p className="text-xl font-bold">{formatCurrency(handCash?.balance || 0, currencySymbol)}</p>
            </div>
          </CardContent>
        </Card>
        {motherAccounts.filter(a => a.is_active).map((ma) => (
          <Card key={ma.id}>
            <CardContent className="py-4 flex items-center gap-3">
              <Building2 className="h-8 w-8 text-[var(--color-accent)]" />
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">{ma.name}</p>
                <p className="text-xl font-bold">{formatCurrency(ma.balance, currencySymbol)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownRight className="h-5 w-5" /> Record Withdrawal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WithdrawForm
            onSubmit={handleWithdraw}
            loading={submitting}
            motherAccounts={motherAccounts.filter(a => a.is_active)}
            handCashBalance={handCash?.balance || 0}
            currencySymbol={currencySymbol}
          />
        </CardContent>
      </Card>
    </div>
  );
}
