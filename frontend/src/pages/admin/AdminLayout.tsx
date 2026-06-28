import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, BarChart3, FileText, CalendarDays,
  Zap, LogOut, Shield, ChevronRight, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/users', label: 'Users', icon: Users, exact: false },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, exact: false },
  { to: '/admin/reports', label: 'Reports', icon: FileText, exact: false },
  { to: '/admin/events', label: 'Events', icon: CalendarDays, exact: false },
  { to: '/admin/emission-factors', label: 'Emission Factors', icon: Zap, exact: false },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshToken, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (to: string, exact: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const handleLogout = async () => {
    if (refreshToken) {
      try { await authApi.logout(refreshToken); } catch {}
    }
    logout();
    navigate('/auth/login');
  };

  const currentPage = navItems.find(n => isActive(n.to, n.exact))?.label ?? 'Admin';

  return (
    <div className="min-h-screen bg-transparent flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-[#0a0e1a]/95 backdrop-blur-xl border-r border-white/5 flex flex-col transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/5 gap-3">
          <div className="w-7 h-7 rounded-lg bg-[var(--primary)] flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-[var(--foreground)]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--foreground)] leading-none">Admin Panel</p>
            <p className="text-[10px] text-[var(--foreground)]0 mt-0.5">EcoSense AI</p>
          </div>
          <button className="ml-auto md:hidden text-[var(--muted-foreground)]" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, exact }) => {
            const active = isActive(to, exact);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  active
                    ? 'bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/20'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="w-3 h-3 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-white/5 space-y-2">
          <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/5">
            <p className="text-xs font-semibold text-[var(--foreground)] truncate">{user?.full_name}</p>
            <p className="text-[10px] text-[var(--foreground)]0 truncate">{user?.email}</p>
            <span className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] text-[10px] font-bold uppercase tracking-wider">
              {user?.role}
            </span>
          </div>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 transition-all"
          >
            <LayoutDashboard className="w-4 h-4" />
            Back to App
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[var(--muted-foreground)] hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-white/5 bg-[#0a0e1a]/80 backdrop-blur-md flex items-center px-6 gap-4 shrink-0">
          <button className="md:hidden text-[var(--muted-foreground)] hover:text-[var(--foreground)]" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--foreground)]0">Admin</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-[var(--foreground)] font-medium">{currentPage}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
        </header>

        {/* Page Content */}
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto p-6"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
