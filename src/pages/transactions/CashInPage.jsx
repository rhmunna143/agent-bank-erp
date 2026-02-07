import { useState } from 'react';
import { useMotherAccounts } from '@/hooks/useMotherAccounts';
import { useHandCash } from '@/hooks/useHandCash';
import { useProfitAccounts } from '@/hooks/useProfitAccounts';
import { useBank } from '@/hooks/useBank';
import { CashInForm } from '@/components/forms/CashInForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/utils/currency';
import { ArrowDownToLine, Wallet, Building2, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionService } from '@/services/transactionService';
import { useTransactionStore } from '@/stores/transactionStore';

export default function CashInPage() {
  const { accounts: motherAccounts, loading: maLoading, refresh: refreshMA } = useMotherAccounts();
  const { handCash, loading: hcLoading, refresh: refreshHC } = useHandCash();
  const { accounts: profitAccounts, loading: paLoading, refresh: refreshPA } = useProfitAccounts();
  const { bank, currencySymbol } = useBank();
  const { triggerRefresh } = useTransactionStore();
  const [submitting, setSubmitting] = useState(false);

  const handleCashIn = async (data) => {
    setSubmitting(true);
    try {
      await transactionService.processCashIn({
        bank_id: bank.id,
        amount: data.amount,
        target_type: data.target_type,
        target_id: data.target_type === 'hand_cash' ? null : data.target_id,
        source: data.source || null,
        reference: data.reference || null,
        notes: data.notes || null,
      });
      toast.success('Cash-in recorded successfully!');
      refreshHC();
      refreshMA();
      refreshPA();
      triggerRefresh();
    } catch (error) {
      toast.error(error.message || 'Failed to process cash-in');
    } finally {
      setSubmitting(false);
    }
  };

  if (maLoading || hcLoading || paLoading) return <LoadingSpinner className="h-64" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cash In</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Fund any account from an external source</p>
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
        {(profitAccounts || []).map((pa) => (
          <Card key={pa.id}>
            <CardContent className="py-4 flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">{pa.name}</p>
                <p className="text-xl font-bold">{formatCurrency(pa.balance, currencySymbol)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownToLine className="h-5 w-5" /> Record Cash In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CashInForm
            onSubmit={handleCashIn}
            loading={submitting}
            motherAccounts={motherAccounts.filter(a => a.is_active)}
            profitAccounts={profitAccounts || []}
            handCashId={handCash?.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
