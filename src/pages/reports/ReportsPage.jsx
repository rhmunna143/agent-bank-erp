import { useState, useCallback } from 'react';
import { useBank } from '@/hooks/useBank';
import { useAuth } from '@/hooks/useAuth';
import { useReports } from '@/hooks/useReports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import {
  Select as RadixSelect,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/Select';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/dateHelpers';
import { REPORT_PERIODS } from '@/utils/constants';
import { generateReportPdf } from '@/utils/generateReportPdf';
import { FileText, Calendar, Printer, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const REPORT_TYPES = {
  full: 'Full Report (Everything)',
  with_expenses: 'Include Expenses Report',
  no_expenses: 'Without Expenses Report',
  expenses_only: 'Only Expenses Report',
};

export default function ReportsPage() {
  const { bank, currencySymbol } = useBank();
  const { profile } = useAuth();
  const { generateReport, loading } = useReports();
  const [period, setPeriod] = useState('today');
  const [reportType, setReportType] = useState('full');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [reportData, setReportData] = useState(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [actualHandCash, setActualHandCash] = useState('');

  const erpHandCash = reportData?.handCashBalance || 0;
  const handCashMatch =
    actualHandCash !== '' &&
    Math.floor(parseFloat(actualHandCash) || 0) === Math.floor(erpHandCash);

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
          dateFrom = new Date(today.getFullYear(), today.getMonth(), 1)
            .toISOString()
            .split('T')[0];
          dateTo = today.toISOString().split('T')[0];
          break;
        }
        case 'quarter': {
          const qtr = new Date(today);
          qtr.setMonth(qtr.getMonth() - 3);
          dateFrom = qtr.toISOString().split('T')[0];
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

      const data = await generateReport(dateFrom, dateTo, reportType);
      setReportData({ ...data, dateFrom, dateTo });
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const showTransactions = reportType !== 'expenses_only';
  const showExpenses = reportType !== 'no_expenses';

  const openPrintModal = () => {
    setActualHandCash('');
    setPrintModalOpen(true);
  };

  const handlePrintReport = useCallback(() => {
    if (!reportData || !handCashMatch) return;
    try {
      generateReportPdf({
        reportData,
        bank,
        currencySymbol,
        reportTypeLabel: REPORT_TYPES[reportType],
        showTransactions,
        showExpenses,
        actualHandCash: parseFloat(actualHandCash),
        generatedBy: profile?.full_name || 'Unknown User',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
    setPrintModalOpen(false);
  }, [reportData, bank, currencySymbol, reportType, showTransactions, showExpenses, actualHandCash, handCashMatch, profile]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Generate and download business reports
        </p>
      </div>

      {/* Report Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Report Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <Label>Period</Label>
              <RadixSelect value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REPORT_PERIODS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </RadixSelect>
            </div>
            <div>
              <Label>Report Type</Label>
              <RadixSelect value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REPORT_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </RadixSelect>
            </div>
            {period === 'custom' && (
              <>
                <div>
                  <Label>From</Label>
                  <Input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label>To</Label>
                  <Input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
            {reportData && (
              <Button variant="outline" onClick={openPrintModal}>
                <Printer className="h-4 w-4 mr-2" /> Print Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Print Verification Modal */}
      <Dialog open={printModalOpen} onOpenChange={setPrintModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Hand Cash Before Printing</DialogTitle>
            <DialogDescription>
              Enter the actual counted hand cash amount to verify against the system balance before printing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
              <span className="text-sm text-[var(--color-text-muted)]">System Hand Cash</span>
              <span className="text-lg font-bold text-[var(--color-primary)]">
                {formatCurrency(erpHandCash, currencySymbol)}
              </span>
            </div>
            <div>
              <Label>Actual Hand Cash (Counted)</Label>
              <Input
                type="number"
                step="any"
                placeholder="Enter counted hand cash amount"
                value={actualHandCash}
                onChange={(e) => setActualHandCash(e.target.value)}
                autoFocus
              />
            </div>
            {actualHandCash !== '' && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${
                handCashMatch
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {handCashMatch ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Hand cash matches! You can print the report.
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Hand cash does not match. System: {Math.floor(erpHandCash)}, Entered: {Math.floor(parseFloat(actualHandCash) || 0)}
                  </>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrintModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePrintReport} disabled={!handCashMatch}>
              <Printer className="h-4 w-4 mr-2" /> Print as PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Results */}
      {reportData && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Report Summary
                </span>
                <span className="text-sm font-normal text-[var(--color-text-muted)]">
                  {formatDate(reportData.dateFrom)} – {formatDate(reportData.dateTo)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {showTransactions && (
                  <>
                    <div className="p-3 bg-[var(--color-surface)] rounded-lg">
                      <p className="text-xs text-[var(--color-text-muted)]">Total Deposits</p>
                      <p className="text-lg font-bold text-success">
                        {formatCurrency(reportData.totalDeposits || 0, currencySymbol)}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {reportData.depositCount || 0} txns
                      </p>
                    </div>
                    <div className="p-3 bg-[var(--color-surface)] rounded-lg">
                      <p className="text-xs text-[var(--color-text-muted)]">Total Withdrawals</p>
                      <p className="text-lg font-bold text-danger">
                        {formatCurrency(reportData.totalWithdrawals || 0, currencySymbol)}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {reportData.withdrawalCount || 0} txns
                      </p>
                    </div>
                    <div className="p-3 bg-[var(--color-surface)] rounded-lg">
                      <p className="text-xs text-[var(--color-text-muted)]">Total Cash In</p>
                      <p className="text-lg font-bold text-blue-500">
                        {formatCurrency(reportData.totalCashIn || 0, currencySymbol)}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {reportData.cashInCount || 0} txns
                      </p>
                    </div>
                  </>
                )}
                {showExpenses && (
                  <div className="p-3 bg-[var(--color-surface)] rounded-lg">
                    <p className="text-xs text-[var(--color-text-muted)]">Total Expenses</p>
                    <p className="text-lg font-bold text-warning">
                      {formatCurrency(reportData.totalExpenses || 0, currencySymbol)}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {reportData.expenseCount || 0} items
                    </p>
                  </div>
                )}
                <div className="p-3 bg-[var(--color-surface)] rounded-lg border-2 border-[var(--color-primary)]">
                  <p className="text-xs text-[var(--color-text-muted)]">Hand Cash Balance</p>
                  <p className="text-lg font-bold text-[var(--color-primary)]">
                    {formatCurrency(reportData.handCashBalance || 0, currencySymbol)}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">Current</p>
                </div>
              </div>
              {/* Net Flow */}
              <div className="mt-4 p-4 border border-[var(--color-border)] rounded-lg text-center">
                <p className="text-sm text-[var(--color-text-muted)]">Net Flow</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(reportData.netFlow || 0, currencySymbol)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Expense Breakdown by Category */}
          {showExpenses &&
            reportData.expensesByCategory &&
            Object.keys(reportData.expensesByCategory).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Expenses by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(reportData.expensesByCategory).map(([cat, amount]) => (
                      <div
                        key={cat}
                        className="flex justify-between items-center py-2 border-b border-[var(--color-border)]"
                      >
                        <span className="text-sm">{cat}</span>
                        <span className="text-sm font-semibold">
                          {formatCurrency(amount, currencySymbol)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Transaction Details */}
          {showTransactions &&
            reportData.transactions &&
            reportData.transactions.length > 0 && (
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
                          <th className="text-left py-2 px-3">Notes</th>
                          <th className="text-right py-2 px-3">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.transactions.map((txn, i) => (
                          <tr key={i} className="border-b border-[var(--color-border)]">
                            <td className="py-2 px-3">{formatDate(txn.created_at)}</td>
                            <td className="py-2 px-3 capitalize">
                              {txn.type?.replace('_', ' ')}
                            </td>
                            <td className="py-2 px-3">
                              {txn.customer_name || txn.customer_account || '-'}
                            </td>
                            <td className="py-2 px-3">{txn.notes || '-'}</td>
                            <td className="py-2 px-3 text-right">
                              {formatCurrency(txn.amount, currencySymbol)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Expense Details */}
          {showExpenses && reportData.expenses && reportData.expenses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Expense Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        <th className="text-left py-2 px-3">Date</th>
                        <th className="text-left py-2 px-3">Category</th>
                        <th className="text-left py-2 px-3">Description</th>
                        <th className="text-left py-2 px-3">Deducted From</th>
                        <th className="text-right py-2 px-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.expenses.map((exp, i) => (
                        <tr key={i} className="border-b border-[var(--color-border)]">
                          <td className="py-2 px-3">{formatDate(exp.created_at)}</td>
                          <td className="py-2 px-3">
                            {exp.expense_categories?.name || '-'}
                          </td>
                          <td className="py-2 px-3">{exp.description || '-'}</td>
                          <td className="py-2 px-3 capitalize">
                            {exp.deduct_from?.replace('_', ' ') || '-'}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {formatCurrency(exp.amount, currencySymbol)}
                          </td>
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
