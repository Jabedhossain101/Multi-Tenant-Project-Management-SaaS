import * as React from 'react';
import { Card, CardContent } from '../ui/card.js';
import { cn } from '../../lib/utils.js';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  iconColor = 'text-primary',
}: StatCardProps) {
  return (
    <Card className="hover:border-primary/40 transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
            {title}
          </span>
          <div className={cn('p-2.5 rounded-lg bg-card/60 border border-border/80', iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
          {change && (
            <span
              className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                trend === 'up' && 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
                trend === 'down' && 'text-rose-400 bg-rose-500/10 border border-rose-500/20',
                trend === 'neutral' && 'text-muted-foreground bg-muted',
              )}
            >
              {change}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
