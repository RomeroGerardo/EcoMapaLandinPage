import React from 'react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, description, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm p-6 relative overflow-hidden group transition-all hover:shadow-md", className)}>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
          {title}
        </h3>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors">
            {icon}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 mt-2">
        <div className="text-3xl font-bold">{value}</div>
        
        {(description || trend) && (
          <div className="flex items-center text-xs mt-1">
            {trend && (
              <span className={cn(
                "font-medium mr-2",
                trend.isPositive ? "text-primary" : "text-destructive"
              )}>
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
            )}
            {description && (
              <span className="text-muted-foreground">{description}</span>
            )}
          </div>
        )}
      </div>
      {/* Decorative background glow */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
    </div>
  );
}
