import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, Palette, Globe, Trash2, LogOut, CheckCircle, Moon, Sun, Monitor } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { t } from '@/i18n';

// ── Toggle switch ────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${checked ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
  >
    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

// ── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, accent = 'brand', children }: { title: string; icon: any; accent?: string; children: React.ReactNode }) => {
  const accentMap: Record<string, string> = {
    brand: 'bg-[var(--primary)]/15 text-[var(--primary)]',
    amber: 'bg-amber-500/15 text-amber-400',
    red:   'bg-red-500/15 text-red-400',
    cyan:  'bg-cyan-500/15 text-cyan-400',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-[var(--card)]/50 backdrop-blur-md p-6"
    >
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentMap[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
};

// ── Row for notification toggles ─────────────────────────────────────────────
const NotifRow = ({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-none">
    <div>
      <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
      <p className="text-xs text-[var(--foreground)]0 mt-0.5">{description}</p>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

export default function Settings() {
  const { refreshToken, logout } = useAuthStore();
  const { theme, language, setTheme, setLanguage } = useSettingsStore();
  const navigate = useNavigate();

  const [notifs, setNotifs] = useState({
    weekly_report:      { label: 'Weekly Report',        description: 'Your eco score summary every Monday',         value: true },
    goal_reminders:     { label: 'Goal Reminders',       description: 'Nudges when a goal deadline is approaching', value: true },
    eco_tips:           { label: 'Eco Tips',             description: 'Daily green lifestyle suggestions',           value: true },
    community_updates:  { label: 'Community Updates',    description: 'New posts and leaderboard changes',           value: false },
    bill_alerts:        { label: 'Bill Alerts',          description: 'Notify when a bill is successfully analysed', value: true },
  });

  const [saved, setSaved] = useState(false);

  const toggleNotif = (key: keyof typeof notifs) =>
    setNotifs(n => ({ ...n, [key]: { ...n[key], value: !n[key].value } }));

  const handleSaveNotifs = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleThemeChange = (newTheme: 'dark' | 'light' | 'system') => {
    setTheme(newTheme);
    handleSaveNotifs();
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    handleSaveNotifs();
  };

  const handleLogout = async () => {
    if (refreshToken) {
      try { await authApi.logout(refreshToken); } catch {}
    }
    logout();
    navigate('/auth/login');
  };

  const themeOptions: { id: 'dark' | 'light' | 'system'; label: string; icon: any }[] = [
    { id: 'dark',   label: 'Dark',   icon: Moon },
    { id: 'light',  label: 'Light',  icon: Sun },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{t(language, 'settings')}</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Customize notifications, appearance, and account preferences</p>
      </div>

      {/* Notifications */}
      <Section title={t(language, 'notifications')} icon={Bell} accent="brand">
        <div>
          {(Object.keys(notifs) as (keyof typeof notifs)[]).map(key => (
            <NotifRow
              key={key}
              label={notifs[key].label}
              description={notifs[key].description}
              checked={notifs[key].value}
              onChange={() => toggleNotif(key)}
            />
          ))}
        </div>
        <button
          onClick={handleSaveNotifs}
          className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-brand-400 text-[var(--foreground)] text-sm font-medium transition-all"
        >
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : 'Save Preferences'}
        </button>
      </Section>

      {/* Appearance */}
      <Section title={t(language, 'appearance')} icon={Palette} accent="cyan">
        <p className="text-xs text-[var(--foreground)]0 mb-3">Choose your preferred theme</p>
        <div className="flex gap-3">
          {themeOptions.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleThemeChange(id)}
              className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${
                theme === id
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                  : 'border-white/10 text-[var(--muted-foreground)] hover:border-white/20 hover:text-[var(--foreground)]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Language */}
      <Section title={t(language, 'language')} icon={Globe} accent="amber">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Display Language</label>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="w-full bg-[var(--card)] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition"
          >
            <option value="en">🇬🇧 English</option>
            <option value="hi">🇮🇳 Hindi</option>
            <option value="es">🇪🇸 Spanish</option>
            <option value="fr">🇫🇷 French</option>
            <option value="de">🇩🇪 German</option>
          </select>
        </div>
      </Section>

      {/* Security */}
      <Section title={t(language, 'security')} icon={Shield} accent="cyan">
        <div className="space-y-0">
          {[
            { label: 'Password',       value: 'Managed via login provider' },
            { label: 'Account Status', value: 'Active',  green: true },
            { label: 'Email Verified', value: 'Yes',     green: true },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-none">
              <span className="text-sm text-[var(--muted-foreground)]">{row.label}</span>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${row.green ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[var(--border)]/50 text-[var(--foreground)]'}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Danger zone */}
      <Section title={t(language, 'accountActions')} icon={Trash2} accent="red">
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--card)] hover:bg-[var(--border)] text-[var(--foreground)] hover:text-[var(--foreground)] text-sm font-medium transition-all"
          >
            <LogOut className="w-4 h-4" />
            {t(language, 'signOut')}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/30 hover:bg-red-500/10 text-red-400 text-sm font-medium transition-all">
            <Trash2 className="w-4 h-4" />
            Delete my account
          </button>
        </div>
      </Section>
    </div>
  );
}
