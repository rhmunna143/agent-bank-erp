import { useState } from 'react';
import { useHandCash } from '@/hooks/useHandCash';
import { useBank } from '@/hooks/useBank';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/utils/currency';
import { Wallet, AlertTriangle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HandCashPage() {
  const { handCash, loading, updateThreshold } = useHandCash();
  const { currencySymbol, role } = useBank();
  const [threshold, setThreshold] = useState('');
  const [saving, setSaving] = useState(false);
  const isAdmin = role === 'admin' || role === 'owner';

  const handleSaveThreshold = async () => {
    if (!threshold || isNaN(Number(threshold))) {
      toast.error('Enter a valid amount');
      return;
    }
    setSaving(true);
    try {
      await updateThreshold(Number(threshold));
      toast.success('Threshold updated!');
    } catch (error) {
      toast.error('Failed to update threshold');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner className="h-64" />;

  if (!handCash) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--color-text-muted)]">
        No hand cash account found.
      </div>
    );
  }

  const isLow = handCash.low_threshold > 0 && handCash.balance < handCash.low_threshold;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hand Cash</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Current cash on hand balance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-5 w-5" /> Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-4xl font-bold ${isLow ? 'text-danger' : ''}`}>
              {formatCurrency(handCash.balance, currencySymbol)}
            </p>
            {isLow && (
              <div className="flex items-center gap-2 mt-3 text-danger text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Balance is below threshold ({formatCurrency(handCash.low_threshold, currencySymbol)})</span>
              </div>
            )}
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Low Balance Threshold</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-[var(--color-text-muted)]">
                Current threshold: {formatCurrency(handCash.low_threshold || 0, currencySymbol)}
              </p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="threshold">New Threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    min="0"
                    placeholder="Enter amount"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                  />
                </div>
                <Button
                  className="self-end"
                  onClick={handleSaveThreshold}
                  disabled={saving}
                >
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">How Hand Cash Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[var(--color-text-muted)] space-y-2">
          <p><strong>Increases when:</strong> Cash-in from mother account or external source, customer deposits</p>
          <p><strong>Decreases when:</strong> Customer withdrawals, expenses deducted from hand cash</p>
          <p>Hand cash represents the physical cash available for daily operations.</p>
        </CardContent>
      </Card>
    </div>
  );
}
