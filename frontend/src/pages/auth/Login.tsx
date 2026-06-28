import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertCircle, Zap, Shield } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/Card';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

type Tab = 'demo' | 'admin';

const Login = () => {
  const [activeTab, setActiveTab] = useState<Tab>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const loginAction = useAuthStore(state => state.login);

  const handleGoogleToken = async (idToken: string) => {
    setIsLoading(true);
    setError('');
    try {
      const tokens = await authApi.googleLogin(idToken);
      useAuthStore.getState().setTokens(tokens);
      const user = await authApi.getMe();
      loginAction(tokens, user);
      if (user.role === 'admin' || user.role === 'super_admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Google sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const { signInWithGoogle } = useGoogleAuth(handleGoogleToken);

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    setError('');
    setIsLoading(true);
    try {
      const tokens = await authApi.login({ email: loginEmail, password: loginPassword });
      useAuthStore.getState().setTokens(tokens);
      const user = await authApi.getMe();
      loginAction(tokens, user);
      if (activeTab === 'admin' || user.role === 'admin' || user.role === 'super_admin') {
        navigate('/admin');
      } else {
        navigate('/onboarding');
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail) && detail.length > 0) {
        setError(detail[0].msg || 'Invalid credentials.');
      } else {
        setError('Failed to login. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doLogin(email, password);
  };

  const handleDemoLogin = async () => {
    const demoEmail = 'testuser_e2e@example.com';
    const demoPassword = 'password123';
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setIsLoading(true);
    try {
      let tokens;
      try {
        tokens = await authApi.login({ email: demoEmail, password: demoPassword });
      } catch (loginErr: any) {
        if (loginErr.response?.status === 401) {
          await authApi.register({ email: demoEmail, password: demoPassword, full_name: 'Demo User' });
          tokens = await authApi.login({ email: demoEmail, password: demoPassword });
        } else {
          throw loginErr;
        }
      }
      useAuthStore.getState().setTokens(tokens);
      const user = await authApi.getMe();
      loginAction(tokens, user);
      navigate('/onboarding');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAdminLogin = async () => {
    const adminEmail = 'demo_admin@ecosense.ai';
    const adminPassword = 'Admin@123';
    setEmail(adminEmail);
    setPassword(adminPassword);
    setError('');
    setIsLoading(true);
    try {
      const tokens = await authApi.login({ email: adminEmail, password: adminPassword });
      useAuthStore.getState().setTokens(tokens);
      const user = await authApi.getMe();
      loginAction(tokens, user);
      navigate('/admin');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Admin demo login failed. Is the backend updated?');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'demo' as Tab, label: 'Demo Login', icon: <Zap className="w-4 h-4" /> },
    { id: 'admin' as Tab, label: 'Admin Login', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassPanel>
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-1">Welcome back</h2>
          <p className="text-[var(--muted-foreground)] text-sm">Sign in to EcoSense AI</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-[var(--card)]/60 p-1 mb-6 border border-[var(--border)]/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setError(''); setEmail(''); setPassword(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? tab.id === 'admin'
                    ? 'bg-purple-500/20 text-purple-300 shadow-lg border border-purple-500/30'
                    : 'bg-[var(--primary)]/20 text-brand-300 shadow-lg border border-[var(--primary)]/30'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <span className={activeTab === tab.id ? (tab.id === 'admin' ? 'text-purple-400' : 'text-[var(--primary)]') : ''}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* ─── DEMO TAB ─── */}
          {activeTab === 'demo' && (
            <motion.div
              key="demo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Info box */}
              <div className="mb-5 p-4 rounded-xl bg-[var(--primary)]/8 border border-[var(--primary)]/20">
                <p className="text-xs text-brand-300 font-medium mb-1">🌱 Demo Account</p>
                <p className="text-xs text-[var(--muted-foreground)]">Explore EcoSense AI with a pre-filled demo account. No sign-up needed.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-5 h-5" />}
                  required
                />
                <div className="space-y-2">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock className="w-5 h-5" />}
                    required
                  />
                  <div className="flex justify-end">
                    <Link to="/auth/forgot-password" className="text-sm font-medium text-[var(--primary)] hover:text-brand-300 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Sign in
                </Button>
                
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full border-[var(--border)] bg-[var(--card)]/50 hover:bg-[var(--card)] text-[var(--foreground)] flex items-center justify-center gap-2 min-h-[44px]"
                  onClick={signInWithGoogle}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </Button>

                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <span className="text-xs text-[var(--foreground)]0">or</span>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full border-[var(--primary)]/40 hover:bg-[var(--primary)]/10 text-[var(--primary)]"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Demo Login
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
                Don't have an account?{' '}
                <Link to="/auth/signup" className="font-medium text-[var(--primary)] hover:text-brand-300 transition-colors">
                  Create an account
                </Link>
              </div>
            </motion.div>
          )}

          {/* ─── ADMIN TAB ─── */}
          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Info box */}
              <div className="mb-5 p-4 rounded-xl bg-purple-500/8 border border-purple-500/20">
                <p className="text-xs text-purple-300 font-medium mb-1">🛡️ Admin Portal</p>
                <p className="text-xs text-[var(--muted-foreground)]">Access restricted to <span className="text-purple-300 font-medium">admin</span> and <span className="text-purple-300 font-medium">super_admin</span> roles. You will be redirected to the admin dashboard.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Admin Email"
                  type="email"
                  placeholder="admin@ecosense.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-5 h-5" />}
                  required
                />
                <div className="space-y-2">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock className="w-5 h-5" />}
                    required
                  />
                  <div className="flex justify-end">
                    <Link to="/auth/forgot-password" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-[var(--foreground)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                >
                  {isLoading ? (
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Access Admin Portal
                    </>
                  )}
                </button>

                <div className="relative flex items-center gap-3 mt-4">
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <span className="text-xs text-[var(--foreground)]0">or</span>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full border-purple-500/40 hover:bg-purple-500/10 text-purple-400"
                  onClick={handleDemoAdminLogin}
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Quick Demo Admin Login
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-[var(--foreground)]0">
                Not an admin?{' '}
                <button onClick={() => setActiveTab('demo')} className="text-[var(--primary)] hover:text-brand-300 transition-colors font-medium">
                  Use Demo Login
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassPanel>
    </motion.div>
  );
};

export default Login;
