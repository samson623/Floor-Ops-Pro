'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    variant?: 'default' | 'success' | 'warning' | 'primary';
    onClick?: () => void;
    className?: string;
}

export function StatCard({
    label,
    value,
    change,
    trend = 'neutral',
    variant = 'default',
    onClick,
    className
}: StatCardProps) {
    return (
        <Card
            className={cn(
                'group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] overflow-hidden relative',
                onClick && 'cursor-pointer',
                className
            )}
            onClick={onClick}
        >
            {/* Gradient overlay based on variant */}
            <div className={cn(
                'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                variant === 'success' && 'bg-gradient-to-br from-success/5 to-transparent',
                variant === 'warning' && 'bg-gradient-to-br from-warning/5 to-transparent',
                variant === 'primary' && 'bg-gradient-to-br from-primary/5 to-transparent',
            )} />

            <CardContent className="p-4 lg:p-6 relative">
                <div className="text-xs lg:text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    {label}
                </div>
                <div className={cn(
                    'text-2xl lg:text-3xl font-bold tracking-tight',
                    variant === 'success' && 'text-success',
                    variant === 'warning' && 'text-warning',
                    variant === 'primary' && 'text-primary',
                )}>
                    {value}
                </div>
                {change && (
                    <div className={cn(
                        'flex items-center gap-1 mt-2 text-xs lg:text-sm font-medium',
                        trend === 'up' && 'text-success',
                        trend === 'down' && 'text-destructive',
                        trend === 'neutral' && 'text-muted-foreground'
                    )}>
                        {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                        {trend === 'down' && <TrendingDown className="w-3 h-3" />}
                        {change}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
