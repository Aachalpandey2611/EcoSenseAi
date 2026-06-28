import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassPanel } from '../ui/Card';
import { useSettingsStore } from '@/store/settingsStore';

interface TrendChartProps {
  data: { name: string; impact: number }[];
  title: string;
}

export function TrendChart({ data, title }: TrendChartProps) {
  const theme = useSettingsStore((state) => state.theme);
  
  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(0,255,157,0.08)' : 'rgba(26,122,74,0.08)';

  return (
    <GlassPanel className="p-6 h-full flex flex-col relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <h3 className="text-lg font-bold text-[var(--foreground)] mb-6 relative z-10">{title}</h3>
      
      <div className="w-full mt-2 relative z-10">
        <ResponsiveContainer width="100%" aspect={2.5}>
          <AreaChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isDark ? '#00FF9D' : '#1A7A4A'} stopOpacity={0.5}/>
                <stop offset="95%" stopColor={isDark ? '#00CFFF' : '#2D7DD2'} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={isDark ? '#00FF9D' : '#1A7A4A'} />
                <stop offset="50%" stopColor={isDark ? '#00CFFF' : '#2D7DD2'} />
                <stop offset="100%" stopColor={isDark ? '#B254FF' : '#7C3AED'} />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            
            <XAxis 
              dataKey="name" 
              stroke="var(--muted-foreground)" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
              minTickGap={20}
            />
            
            <YAxis 
              stroke="var(--muted-foreground)" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => `${val} kg`} 
              dx={-10}
            />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--card)', 
                borderColor: 'var(--border)', 
                borderRadius: '12px', 
                color: 'var(--foreground)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
              }}
              itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
              labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '4px' }}
            />
            
            <Area 
              type="monotone" 
              dataKey="impact" 
              stroke="url(#lineGradient)" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#fillGradient)" 
              activeDot={{ 
                r: 6, 
                fill: 'var(--card)', 
                stroke: isDark ? '#00FF9D' : '#1A7A4A', 
                strokeWidth: 3, 
                filter: 'url(#glow)' 
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassPanel>
  );
}
