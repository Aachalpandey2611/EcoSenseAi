import { useState } from 'react';
import { LogOut, LayoutDashboard, Settings, User, Plus, Camera, Sparkles, Target, Users, Brain, Shield, Menu, X } from 'lucide-react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';

import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { t } from '@/i18n';
import type { TranslationKey } from '@/i18n';

const navItems = [
  { to: '/dashboard', labelKey: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, exact: true },
  { to: '/dashboard/track', labelKey: 'logActivity', icon: <Plus className="w-5 h-5" />, exact: false },
  { to: '/dashboard/ocr', labelKey: 'billAnalyzer', icon: <Camera className="w-5 h-5" />, exact: false },
  { to: '/dashboard/coach', labelKey: 'aiCoach', icon: <Sparkles className="w-5 h-5" />, exact: false },
  { to: '/dashboard/goals', labelKey: 'goals', icon: <Target className="w-5 h-5" />, exact: false },
  { to: '/dashboard/community', labelKey: 'community', icon: <Users className="w-5 h-5" />, exact: false },
  { to: '/dashboard/twin', labelKey: 'digitalTwin', icon: <Brain className="w-5 h-5" />, exact: false },
];

// Items shown in the mobile bottom nav (most important 5)
const mobileNavItems = [
  { to: '/dashboard', labelKey: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, exact: true },
  { to: '/dashboard/track', labelKey: 'logActivity', icon: <Plus className="w-5 h-5" />, exact: false },
  { to: '/dashboard/coach', labelKey: 'aiCoach', icon: <Sparkles className="w-5 h-5" />, exact: false },
  { to: '/dashboard/goals', labelKey: 'goals', icon: <Target className="w-5 h-5" />, exact: false },
  { to: '/dashboard/community', labelKey: 'community', icon: <Users className="w-5 h-5" />, exact: false },
];

export default function DashboardLayout() {
  const { user, refreshToken, logout } = useAuthStore();
  const { language } = useSettingsStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (refreshToken) {
      try { await authApi.logout(refreshToken); } catch { /* ignore */ }
    }
    logout();
    navigate('/auth/login');
  };

  const isActive = (to: string, exact: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-transparent flex">
      {/* ── Desktop Sidebar ───────────────────────────────── */}
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--sidebar)] hidden md:flex flex-col shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-[var(--border)]">
          <Logo className="scale-75 origin-left" />
        </div>
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const active = isActive(item.to, item.exact);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 transition-colors group ${
                  active
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-l-[3px] border-[var(--primary)] rounded-r-lg'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--primary)]/5 rounded-lg border-l-[3px] border-transparent'
                }`}
              >
                <span className={`${active ? 'text-[var(--primary)]' : 'group-hover:text-[var(--primary)] transition-colors'}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{t(language, item.labelKey as TranslationKey)}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[var(--border)] space-y-1">
          {user && (user.role === 'admin' || user.role === 'super_admin') && (
            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors border border-[var(--primary)]/20">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Admin Panel</span>
            </Link>
          )}
          <Link to="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--primary)]/5 rounded-lg transition-colors">
            <User className="w-5 h-5" />
            <span className="font-medium">{t(language, 'profile')}</span>
          </Link>
          <Link to="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--primary)]/5 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium">{t(language, 'settings')}</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t(language, 'signOut')}</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Slide-out Drawer ──────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-[var(--sidebar)] border-r border-[var(--border)] flex flex-col md:hidden"
            >
              <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--border)]">
                <Logo className="scale-75 origin-left" />
                <button onClick={() => setMobileMenuOpen(false)} className="text-[var(--muted-foreground)]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                {navItems.map((item) => {
                  const active = isActive(item.to, item.exact);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        active
                          ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-semibold'
                          : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--primary)]/5'
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium">{t(language, item.labelKey as TranslationKey)}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-[var(--border)] space-y-1">
                <Link to="/dashboard/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg">
                  <User className="w-5 h-5" /><span>Profile</span>
                </Link>
                <Link to="/dashboard/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg">
                  <Settings className="w-5 h-5" /><span>Settings</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-500/10 rounded-lg">
                  <LogOut className="w-5 h-5" /><span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ─────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-16 md:h-20 border-b border-[var(--border)] flex items-center justify-between px-4 md:px-8 bg-[var(--background)] backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--foreground)]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base md:text-xl font-semibold text-[var(--foreground)] truncate">
              {navItems.find((n) => isActive(n.to, n.exact))
                ? t(language, navItems.find((n) => isActive(n.to, n.exact))!.labelKey as TranslationKey)
                : t(language, 'dashboard')}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/dashboard/track" className="hidden sm:block">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">{t(language, 'logActivity')}</span>
              </Button>
            </Link>
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-[var(--foreground)]">{user?.full_name}</p>
              <p className="text-xs text-[var(--muted-foreground)] truncate max-w-[160px]">{user?.email}</p>
            </div>
            {/* Theme Toggle */}
            <button
              onClick={() => useSettingsStore.getState().toggleTheme()}
              className="w-9 h-9 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
              title="Toggle Theme"
            >
              <div className="dark:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              </div>
              <div className="hidden dark:block">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              </div>
            </button>
            <Link
              to="/dashboard/profile"
              className="w-9 h-9 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] flex items-center justify-center font-bold hover:bg-[var(--primary)]/30 transition-colors text-sm"
              title="My Profile"
            >
              {user?.full_name?.charAt(0).toUpperCase()}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto relative bg-transparent z-[1] pb-16 md:pb-0">
          <div className="light-bg-blobs dark:hidden">
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Mobile Bottom Navigation Bar ────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-[var(--sidebar)] border-t border-[var(--border)] flex items-center justify-around px-2 h-16 safe-area-inset-bottom">
        {mobileNavItems.map((item) => {
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                active
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--muted-foreground)]'
              }`}
            >
              <span className={`transition-transform ${active ? 'scale-110' : ''}`}>{item.icon}</span>
              <span className="text-[10px] font-medium leading-tight">
                {t(language, item.labelKey as TranslationKey)}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
