import { useState, useEffect, useCallback } from 'react';
import { useBank } from '@/hooks/useBank';
import { useReports } from '@/hooks/useReports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/dateHelpers';
import { REPORT_PERIODS } from '@/utils/constants';
import { FileText, Download, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const { bank, currencySymbol } = useBank();
  const { generateReport, loading } = useReports();
  const [period, setPeriod] = useState('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [reportData, setReportData] = useState(null);

  const handleGenerate = async () => {
    try {
      let dateFrom, dateTo;
      const today = new Date();
      
      switch (period) {
        case 'today':
          dateFrom = dateTo = today.toISOString().split('T')[0];
          break;
        case 'week': {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          dateFrom = weekAgo.toISOString().split('T')[0];
          dateTo = today.toISOString().split('T')[0];
          break;
        }
        case 'month': {
          dateFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
          dateTo = today.toISOString().split('T')[0];
          break;
        }
        case 'custom':
          if (!customFrom || !customTo) {
            toast.error('Please select date range');
            return;
          }
          dateFrom = customFrom;
          dateTo = customTo;
          break;
        default:
          dateFrom = dateTo = today.toISOString().split('T')[0];
      }

      const data = await generateReport(bank.id, dateFrom, dateTo);
      setReportData({ ...data, dateFrom, dateTo });
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Generate and download business reports</p>
      </div>

      {/* Report Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Report Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>Period</Label>
              <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
                {Object.entries(REPORT_PERIODS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
            </div>
            {period === 'custom' && (
              <>
                <div>
                  <Label>From</Label>
                  <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
                </div>
                <div>
                  <Label>To</Label>
                  <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
                </div>
              </>
            )}
          </div>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Report Summary
                </span>
                <span className="text-sm font-normal text-[var(--color-text-muted)]">
                  {formatDate(reportData.dateFrom)} - {formatDate(reportData.dateTo)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-[var(--color-surface)] rounded-lg">
                  <p className="text-xs text-[var(--color-text-muted)]">Total Deposits</p>
                  <p className="text-lg font-bold text-success">
                    {formatCurrency(reportData.totalDeposits || 0, currencySymbol)}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">{reportData.depositCount || 0} txns</p>
                </div>
                <div className="p-3 bg-[var(--color-surface)] rounded-lg">
                  <p className="text-xs text-[var(--color-text-muted)]">Total Withdrawals</p>
                  <p className="text-lg font-bold text-danger">
                    {formatCurrency(reportData.totalWithdrawals || 0, currencySymbol)}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">{reportData.withdrawalCount || 0} txns</p>
                </div>
                <div className="p-3 bg-[var(--color-surface)] rounded-lg">
                  <p className="text-xs text-[var(--color-text-muted)]">Total Expenses</p>
                  <p className="text-lg font-bold text-warning">
                    {formatCurrency(reportData.totalExpenses || 0, currencySymbol)}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">{reportData.expenseCount || 0} items</p>
                </div>
                <div className="p-3 bg-[var(--color-surface)] rounded-lg">
                  <p className="text-xs text-[var(--color-text-muted)]">Net Commission</p>
                  <p className="text-lg font-bold text-[var(--color-primary)]">
                    {formatCurrency(reportData.totalCommissions || 0, currencySymbol)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          {reportData.transactions && reportData.transactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Transaction Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        <th className="text-left py-2 px-3">Date</th>
                        <th className="text-left py-2 px-3">Type</th>
                        <th className="text-left py-2 px-3">Customer</th>
                        <th className="text-right py-2 px-3">Amount</th>
                        <th className="text-right py-2 px-3">Commission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.transactions.map((txn, i) => (
                        <tr key={i} className="border-b border-[var(--color-border)]">
                          <td className="py-2 px-3">{formatDate(txn.created_at)}</td>
                          <td className="py-2 px-3 capitalize">{txn.type?.replace('_', ' ')}</td>
                          <td className="py-2 px-3">{txn.customer_name || '-'}</td>
                          <td className="py-2 px-3 text-right">{formatCurrency(txn.amount, currencySymbol)}</td>
                          <td className="py-2 px-3 text-right">{formatCurrency(txn.commission || 0, currencySymbol)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
