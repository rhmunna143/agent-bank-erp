import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuthStore } from '@/stores/authStore';
import { useBankStore } from '@/stores/bankStore';
import { FullPageSpinner } from '@/components/common/LoadingSpinner';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  const { bank, loading: bankLoading, loadBank } = useBankStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !bank) {
      loadBank(user.id);
    }
  }, [user, bank, loadBank]);

  // If bank finished loading and no bank found, redirect to create
  useEffect(() => {
    if (!bankLoading && !bank && user) {
      navigate('/create-bank');
    }
  }, [bankLoading, bank, user, navigate]);

  if (bankLoading) return <FullPageSpinner />;

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
