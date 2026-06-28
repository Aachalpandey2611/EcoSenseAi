
import { motion } from 'framer-motion';
import { GlassPanel } from '../ui/Card';
import { Leaf } from 'lucide-react';

import { useSettingsStore } from '@/store/settingsStore';

interface EcoScoreCardProps {
  score: number;
}

export function EcoScoreCard({ score }: EcoScoreCardProps) {
  const theme = useSettingsStore((state) => state.theme);
  // Assuming max score is 2000 based on backend logic
  const percentage = Math.min(100, Math.max(0, (score / 2000) * 100));
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <GlassPanel className="eco-score-card p-6 h-full flex flex-col items-center justify-center text-center relative overflow-hidden group">
      <div className="absolute inset-0 bg-[var(--primary)]/5 blur-3xl rounded-full scale-150 group-hover:bg-[var(--primary)]/10 transition-colors" />
      
      <h3 className="text-lg font-medium text-[var(--foreground)] mb-8 relative z-10">Current Eco Score</h3>
      
      <div className="relative w-48 h-48 flex items-center justify-center mb-6 z-10">
        <svg className="w-full h-full transform -rotate-90" style={{ filter: theme === 'dark' ? 'drop-shadow(0 0 8px rgba(0, 255, 157, 0.4))' : 'none' }}>
          <circle
            cx="96"
            cy="96"
            r="45"
            stroke={theme === 'dark' ? '#1A3A2A' : '#D4EDD8'}
            strokeWidth="8"
            fill="transparent"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="96"
            cy="96"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            className="text-[var(--primary)]"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Leaf className="w-6 h-6 text-[var(--primary)] mb-1 opacity-80" />
          <span className="text-4xl font-bold text-[var(--foreground)]">{score}</span>
        </div>
      </div>
      
      <p className="text-sm text-[var(--muted-foreground)] max-w-[200px] relative z-10">
        You're in the top 15% of users this month. Keep it up!
      </p>
    </GlassPanel>
  );
}
