import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/Card';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

const Signup = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });
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
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Google sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const { signInWithGoogle } = useGoogleAuth(handleGoogleToken);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirm_password) {
      setError("Passwords don't match");
      return;
    }
    
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 1. Register
      await authApi.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name
      });
      
      // 2. Auto-login after registration (as decided)
      const tokens = await authApi.login({ 
        email: formData.email, 
        password: formData.password 
      });
      
      useAuthStore.getState().setTokens(tokens);
      const user = await authApi.getMe();
      
      loginAction(tokens, user);
      navigate('/dashboard');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail) && detail.length > 0) {
        setError(detail[0].msg || 'Invalid data format. Please check your inputs.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassPanel>
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-2">Create an account</h2>
          <p className="text-[var(--muted-foreground)]">Join Ecosense AI to get started</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="full_name"
            type="text"
            placeholder="John Doe"
            value={formData.full_name}
            onChange={handleChange}
            icon={<User className="w-5 h-5" />}
            required
          />
          
          <Input
            label="Email address"
            name="email"
            type="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={handleChange}
            icon={<Mail className="w-5 h-5" />}
            required
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={<Lock className="w-5 h-5" />}
              required
            />
            
            <Input
              label="Confirm Password"
              name="confirm_password"
              type="password"
              placeholder="••••••••"
              value={formData.confirm_password}
              onChange={handleChange}
              icon={<CheckCircle2 className="w-5 h-5" />}
              required
            />
          </div>

          <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
            Create account
          </Button>
          
          <div className="relative flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--foreground)]0">or</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

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
            Sign up with Google
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-medium text-[var(--primary)] hover:text-brand-300 transition-colors">
            Sign in
          </Link>
        </div>
      </GlassPanel>
    </motion.div>
  );
};

export default Signup;
