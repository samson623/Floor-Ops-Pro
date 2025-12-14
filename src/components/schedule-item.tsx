'use client';

import { cn } from '@/lib/utils';
import { ScheduleItem as ScheduleItemType } from '@/lib/data';
import { Clock } from 'lucide-react';

interface ScheduleItemProps {
    item: ScheduleItemType;
    onClick?: () => void;
}

const typeStyles = {
    primary: 'border-l-primary bg-primary/5 hover:bg-primary/10',
    success: 'border-l-success bg-success/5 hover:bg-success/10',
    warning: 'border-l-warning bg-warning/5 hover:bg-warning/10',
    muted: 'border-l-muted-foreground bg-muted/50 hover:bg-muted',
};

export function ScheduleItemCard({ item, onClick }: ScheduleItemProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'flex items-center gap-4 p-4 rounded-lg border-l-4 cursor-pointer transition-all duration-200',
                typeStyles[item.type]
            )}
        >
            <div className="flex items-center gap-2 text-sm font-medium min-w-[80px]">
                <Clock className="w-4 h-4 text-muted-foreground" />
                {item.time}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.title}</div>
                <div className="text-sm text-muted-foreground truncate">{item.subtitle}</div>
            </div>
        </div>
    );
}
