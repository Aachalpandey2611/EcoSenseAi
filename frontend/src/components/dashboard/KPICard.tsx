import * as React from 'react';
import { motion } from 'framer-motion';
import { GlassPanel } from '../ui/Card';
import AnimatedCounter from '../ui/AnimatedCounter';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function KPICard({ title, value, icon, trend, trendUp }: KPICardProps) {
  // Extract number and affix if it's a string like "$12.5k" or "150 kg"
  let parsedValue = typeof value === 'number' ? value : NaN;
  let prefix = '';
  let suffix = '';
  let decimals = 0;

  if (typeof value === 'string') {
    const match = value.match(/^([^0-9.-]*)([\d,.]+)(.*)$/);
    if (match) {
      prefix = match[1];
      const numStr = match[2].replace(/,/g, '');
      parsedValue = parseFloat(numStr);
      suffix = match[3];
      if (numStr.includes('.')) {
        decimals = numStr.split('.')[1].length;
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassPanel className="p-6 flex flex-col h-full justify-between group">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--card)]/80 border border-[var(--border)] flex items-center justify-center text-[var(--primary)] group-hover:scale-110 transition-transform">
            {icon}
          </div>
          {trend && (
            <span className={`px-[8px] py-[2px] rounded-[20px] text-[11px] font-semibold ${trendUp ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'bg-red-500/10 text-red-500'}`}>
              {trend}
            </span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--muted-foreground)] mb-1">{title}</p>
          <h3 className="text-[1.75rem] font-semibold text-[var(--primary)] tracking-tight">
            {!isNaN(parsedValue) ? (
              <AnimatedCounter value={parsedValue} prefix={prefix} suffix={suffix} decimals={decimals} />
            ) : (
              value
            )}
          </h3>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
