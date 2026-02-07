import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { FullPageSpinner } from '@/components/common/LoadingSpinner';

// Lazy-load page components
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const CreateBankPage = lazy(() => import('@/pages/onboarding/CreateBankPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const MotherAccountsPage = lazy(() => import('@/pages/accounts/MotherAccountsPage'));
const HandCashPage = lazy(() => import('@/pages/accounts/HandCashPage'));
const ProfitAccountsPage = lazy(() => import('@/pages/accounts/ProfitAccountsPage'));
const CashInPage = lazy(() => import('@/pages/transactions/CashInPage'));
const DepositPage = lazy(() => import('@/pages/transactions/DepositPage'));
const WithdrawPage = lazy(() => import('@/pages/transactions/WithdrawPage'));
const TransactionHistoryPage = lazy(() => import('@/pages/transactions/TransactionHistoryPage'));
const ExpensesPage = lazy(() => import('@/pages/expenses/ExpensesPage'));
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'));
const UserManagementPage = lazy(() => import('@/pages/users/UserManagementPage'));
const BankSettingsPage = lazy(() => import('@/pages/settings/BankSettingsPage'));
const ThemeSettingsPage = lazy(() => import('@/pages/settings/ThemeSettingsPage'));
const ProfilePage = lazy(() => import('@/pages/settings/ProfilePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />
        </Route>

        {/* Onboarding */}
        <Route
          path="/create-bank"
          element={
            <ProtectedRoute>
              <CreateBankPage />
            </ProtectedRoute>
          }
        />

        {/* Protected App Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          
          {/* Accounts */}
          <Route path="mother-accounts" element={<MotherAccountsPage />} />
          <Route path="hand-cash" element={<HandCashPage />} />
          <Route path="profit-accounts" element={<ProfitAccountsPage />} />
          
          {/* Transactions */}
          <Route path="cash-in" element={<CashInPage />} />
          <Route path="deposit" element={<DepositPage />} />
          <Route path="withdraw" element={<WithdrawPage />} />
          <Route path="transactions" element={<TransactionHistoryPage />} />
          
          {/* Expenses */}
          <Route path="expenses" element={<ExpensesPage />} />
          
          {/* Reports */}
          <Route path="reports" element={<ReportsPage />} />
          
          {/* Users */}
          <Route path="users" element={<UserManagementPage />} />
          
          {/* Settings */}
          <Route path="settings" element={<BankSettingsPage />} />
          <Route path="settings/theme" element={<ThemeSettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
