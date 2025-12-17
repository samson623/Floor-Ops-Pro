'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, MoreHorizontal } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSIVE DATA VIEW
// Automatically switches between table (desktop) and cards (mobile)
// Perfect for field crews on trucks and jobsites
// ═══════════════════════════════════════════════════════════════════════════

export interface Column<T> {
    key: keyof T | string;
    header: string;
    /** Render function for custom cell content */
    render?: (item: T, value: unknown) => React.ReactNode;
    /** Column alignment */
    align?: 'left' | 'center' | 'right';
    /** Hide on mobile card view (shown in table) */
    hideOnMobile?: boolean;
    /** Show as badge on mobile */
    asBadge?: boolean;
    /** Priority for mobile display (lower = more important, shown first) */
    mobilePriority?: number;
    /** Width class for desktop table */
    width?: string;
}

export interface ResponsiveDataViewProps<T> {
    /** Data items to display */
    data: T[];
    /** Column definitions */
    columns: Column<T>[];
    /** Unique key field for each item */
    keyField: keyof T;
    /** Called when row/card is clicked */
    onItemClick?: (item: T) => void;
    /** Action buttons for each item */
    actions?: (item: T) => React.ReactNode;
    /** Empty state content */
    emptyState?: React.ReactNode;
    /** Custom class for container */
    className?: string;
    /** Card title field (for mobile view) */
    titleField?: keyof T;
    /** Card subtitle field (for mobile view) */
    subtitleField?: keyof T;
    /** Status badge field (for mobile view) */
    statusField?: keyof T;
    /** Status badge variant based on value */
    statusVariant?: (value: unknown) => 'default' | 'secondary' | 'destructive' | 'outline';
    /** Force specific view mode */
    forceMode?: 'table' | 'cards';
    /** Show row numbers */
    showRowNumbers?: boolean;
}

function getNestedValue<T>(obj: T, path: string): unknown {
    return path.split('.').reduce((acc: unknown, part) => {
        if (acc && typeof acc === 'object' && part in acc) {
            return (acc as Record<string, unknown>)[part];
        }
        return undefined;
    }, obj);
}

export function ResponsiveDataView<T extends object>({
    data,
    columns,
    keyField,
    onItemClick,
    actions,
    emptyState,
    className,
    titleField,
    subtitleField,
    statusField,
    statusVariant,
    forceMode,
    showRowNumbers,
}: ResponsiveDataViewProps<T>) {
    // Sort columns by mobile priority for card view
    const mobileSortedColumns = React.useMemo(() => {
        return [...columns]
            .filter(col => !col.hideOnMobile)
            .sort((a, b) => (a.mobilePriority ?? 99) - (b.mobilePriority ?? 99));
    }, [columns]);

    if (data.length === 0 && emptyState) {
        return <div className="py-12 text-center">{emptyState}</div>;
    }

    return (
        <div className={cn('w-full', className)}>
            {/* Desktop Table View */}
            <div className={cn(
                forceMode === 'cards' ? 'hidden' : 'hidden md:block',
                forceMode === 'table' && 'block'
            )}>
                <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    {showRowNumbers && (
                                        <th className="text-left p-3 font-medium text-muted-foreground w-12">#</th>
                                    )}
                                    {columns.map((col) => (
                                        <th
                                            key={String(col.key)}
                                            className={cn(
                                                'p-3 font-medium text-muted-foreground',
                                                col.align === 'center' && 'text-center',
                                                col.align === 'right' && 'text-right',
                                                col.align !== 'center' && col.align !== 'right' && 'text-left',
                                                col.width
                                            )}
                                        >
                                            {col.header}
                                        </th>
                                    ))}
                                    {actions && <th className="text-right p-3 font-medium text-muted-foreground w-24">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, index) => (
                                    <tr
                                        key={String(item[keyField])}
                                        onClick={() => onItemClick?.(item)}
                                        className={cn(
                                            'border-b last:border-0 transition-colors',
                                            onItemClick && 'cursor-pointer hover:bg-muted/30'
                                        )}
                                    >
                                        {showRowNumbers && (
                                            <td className="p-3 text-muted-foreground">{index + 1}</td>
                                        )}
                                        {columns.map((col) => {
                                            const value = getNestedValue(item, String(col.key));
                                            return (
                                                <td
                                                    key={String(col.key)}
                                                    className={cn(
                                                        'p-3',
                                                        col.align === 'center' && 'text-center',
                                                        col.align === 'right' && 'text-right'
                                                    )}
                                                >
                                                    {col.render ? col.render(item, value) : String(value ?? '')}
                                                </td>
                                            );
                                        })}
                                        {actions && (
                                            <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                {actions(item)}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className={cn(
                forceMode === 'table' ? 'hidden' : 'md:hidden',
                forceMode === 'cards' && 'block'
            )}>
                <div className="space-y-3">
                    {data.map((item) => {
                        const title = titleField ? String(item[titleField] ?? '') : '';
                        const subtitle = subtitleField ? String(item[subtitleField] ?? '') : '';
                        const status = statusField ? item[statusField] : null;

                        return (
                            <div
                                key={String(item[keyField])}
                                onClick={() => onItemClick?.(item)}
                                className={cn(
                                    'mobile-card',
                                    onItemClick && 'cursor-pointer'
                                )}
                            >
                                {/* Card Header */}
                                <div className="mobile-card-header">
                                    <div className="flex-1 min-w-0">
                                        {title && (
                                            <div className="mobile-card-title truncate">{title}</div>
                                        )}
                                        {subtitle && (
                                            <div className="text-sm text-muted-foreground truncate">{subtitle}</div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {status && (
                                            <Badge
                                                variant={statusVariant ? statusVariant(status) : 'outline'}
                                                className="text-xs"
                                            >
                                                {String(status)}
                                            </Badge>
                                        )}
                                        {onItemClick && (
                                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </div>

                                {/* Card Meta - Important fields */}
                                <div className="mobile-card-meta">
                                    {mobileSortedColumns
                                        .filter(col => String(col.key) !== String(titleField) && String(col.key) !== String(subtitleField) && String(col.key) !== String(statusField))
                                        .slice(0, 4) // Show max 4 fields on mobile
                                        .map((col) => {
                                            const value = getNestedValue(item, String(col.key));
                                            if (value === undefined || value === null || value === '') return null;

                                            if (col.asBadge) {
                                                return (
                                                    <Badge key={String(col.key)} variant="secondary" className="text-xs">
                                                        {col.render ? col.render(item, value) : String(value)}
                                                    </Badge>
                                                );
                                            }

                                            return (
                                                <span key={String(col.key)} className="flex items-center gap-1">
                                                    <span className="text-muted-foreground/70">{col.header}:</span>
                                                    <span className="font-medium">
                                                        {col.render ? col.render(item, value) : String(value)}
                                                    </span>
                                                </span>
                                            );
                                        })}
                                </div>

                                {/* Card Actions */}
                                {actions && (
                                    <div className="mobile-card-actions" onClick={(e) => e.stopPropagation()}>
                                        {actions(item)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE-OPTIMIZED STAT CARD
// Touch-optimized stats for dashboard views
// ═══════════════════════════════════════════════════════════════════════════

export interface MobileStatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subValue?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    onClick?: () => void;
    variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export function MobileStatCard({
    icon,
    label,
    value,
    subValue,
    trend,
    trendValue,
    onClick,
    variant = 'default',
}: MobileStatCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'flex items-center gap-3 p-4 rounded-xl border bg-card transition-all',
                onClick && 'cursor-pointer active:scale-[0.98] active:bg-muted/50',
                variant === 'success' && 'border-success/30 bg-success/5',
                variant === 'warning' && 'border-warning/30 bg-warning/5',
                variant === 'destructive' && 'border-destructive/30 bg-destructive/5'
            )}
        >
            <div className={cn(
                'p-2.5 rounded-lg shrink-0',
                variant === 'default' && 'bg-primary/10',
                variant === 'success' && 'bg-success/10',
                variant === 'warning' && 'bg-warning/10',
                variant === 'destructive' && 'bg-destructive/10'
            )}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold truncate">{value}</p>
                <p className="text-xs text-muted-foreground truncate">{label}</p>
                {(subValue || trendValue) && (
                    <p className={cn(
                        'text-xs mt-0.5 flex items-center gap-1',
                        trend === 'up' && 'text-success',
                        trend === 'down' && 'text-destructive',
                        !trend && 'text-muted-foreground'
                    )}>
                        {trendValue || subValue}
                    </p>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE FILTER BAR
// Collapsible filter panel for mobile
// ═══════════════════════════════════════════════════════════════════════════

export interface MobileFilterBarProps {
    children: React.ReactNode;
    activeFiltersCount?: number;
    className?: string;
}

export function MobileFilterBar({
    children,
    activeFiltersCount = 0,
    className,
}: MobileFilterBarProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <div className={cn('space-y-3', className)}>
            {/* Mobile Filter Toggle */}
            <div className="md:hidden">
                <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <span className="flex items-center gap-2">
                        <MoreHorizontal className="w-4 h-4" />
                        Filters
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="ml-1">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </span>
                    <ChevronRight className={cn(
                        'w-4 h-4 transition-transform',
                        isExpanded && 'rotate-90'
                    )} />
                </Button>
            </div>

            {/* Filter Content */}
            <div className={cn(
                'flex flex-col gap-3 md:flex-row md:items-center md:gap-4',
                !isExpanded && 'hidden md:flex'
            )}>
                {children}
            </div>
        </div>
    );
}

export default ResponsiveDataView;
