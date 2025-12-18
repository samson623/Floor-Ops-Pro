'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    BarChart3,
    ArrowUpDown,
    RefreshCcw,
    Layers,
    History,
    ClipboardCheck,
    TrendingUp,
    TrendingDown,
    Minus,
    Package,
    MapPin,
    AlertTriangle,
    CheckCircle2,
    Clock,
    ChevronRight,
    X
} from 'lucide-react';
import {
    MOCK_INVENTORY_VALUATION_REPORT,
    MOCK_STOCK_MOVEMENT_REPORT,
    MOCK_TURNOVER_ANALYSIS_REPORT,
    MOCK_ABC_ANALYSIS_REPORT,
    MOCK_LOT_TRACEABILITY_REPORT,
    MOCK_CYCLE_COUNT_ACCURACY_REPORT
} from '@/lib/warehouse-mock-data';

type ReportType = 'inventory-valuation' | 'stock-movement' | 'turnover' | 'abc' | 'lot-trace' | 'cycle-count';

interface WarehouseReportModalProps {
    open: boolean;
    onClose: () => void;
    reportType: ReportType | null;
}

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);

const formatCurrencyFull = (value: number): string =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);

const formatPercent = (value: number): string => `${value.toFixed(1)}%`;

const formatNumber = (value: number): string =>
    new Intl.NumberFormat('en-US').format(value);

// ═══════════════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════════

interface MetricCardProps {
    label: string;
    value: string;
    subvalue?: string;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    icon?: React.ReactNode;
}

function MetricCard({ label, value, subvalue, variant = 'default', icon }: MetricCardProps) {
    const variantStyles = {
        default: 'bg-card border',
        success: 'bg-emerald-500/10 border-emerald-500/30',
        warning: 'bg-amber-500/10 border-amber-500/30',
        danger: 'bg-rose-500/10 border-rose-500/30',
        info: 'bg-blue-500/10 border-blue-500/30'
    };

    const textStyles = {
        default: 'text-foreground',
        success: 'text-emerald-600 dark:text-emerald-400',
        warning: 'text-amber-600 dark:text-amber-400',
        danger: 'text-rose-600 dark:text-rose-400',
        info: 'text-blue-600 dark:text-blue-400'
    };

    // Auto-size text based on value length for optimal fit
    const getValueSize = (val: string) => {
        if (val.length > 12) return 'text-sm';
        if (val.length > 9) return 'text-base';
        if (val.length > 6) return 'text-lg';
        return 'text-xl';
    };

    return (
        <div className={cn(
            "rounded-xl p-4 border transition-all hover:shadow-md",
            variantStyles[variant]
        )}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                        {label}
                    </p>
                    <p className={cn(
                        "font-bold tracking-tight whitespace-nowrap",
                        getValueSize(value),
                        textStyles[variant]
                    )}>
                        {value}
                    </p>
                    {subvalue && (
                        <p className="text-xs text-muted-foreground mt-1">{subvalue}</p>
                    )}
                </div>
                {icon && (
                    <div className={cn(
                        "p-2 rounded-lg shrink-0",
                        variant === 'default' ? 'bg-muted' : 'bg-white/50 dark:bg-white/10'
                    )}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

interface ProgressBarProps {
    value: number;
    max?: number;
    color?: string;
    showValue?: boolean;
    height?: 'sm' | 'md' | 'lg';
}

function ProgressBar({ value, max = 100, color = 'bg-primary', showValue = false, height = 'md' }: ProgressBarProps) {
    const percent = Math.min(100, (value / max) * 100);
    const heightClass = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

    return (
        <div className="flex items-center gap-3 w-full">
            <div className={cn(
                "flex-1 bg-muted rounded-full overflow-hidden",
                heightClass[height]
            )}>
                <div
                    className={cn("h-full rounded-full transition-all duration-500", color)}
                    style={{ width: `${percent}%` }}
                />
            </div>
            {showValue && (
                <span className="text-xs font-medium text-muted-foreground w-12 text-right">
                    {formatPercent(value)}
                </span>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// INVENTORY VALUATION REPORT
// ═══════════════════════════════════════════════════════════════════
function InventoryValuationContent() {
    const report = MOCK_INVENTORY_VALUATION_REPORT;

    const categoryColors = [
        'bg-blue-500',
        'bg-emerald-500',
        'bg-amber-500',
        'bg-purple-500',
        'bg-rose-500',
        'bg-cyan-500',
        'bg-indigo-500'
    ];

    return (
        <div className="space-y-8">
            {/* Hero Metric */}
            <div className="text-center py-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border">
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Inventory Value</p>
                <p className="text-4xl font-bold text-primary tracking-tight">
                    {formatCurrency(report.totalInventoryValue)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                    Across {report.byCategory.length} categories • {report.topValueItems.length} high-value items
                </p>
            </div>

            {/* Category Breakdown */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    Value by Category
                </h3>
                <div className="space-y-3">
                    {report.byCategory.map((cat, idx) => (
                        <div
                            key={idx}
                            className="group flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className={cn(
                                "w-1 h-8 rounded-full shrink-0",
                                categoryColors[idx % categoryColors.length]
                            )} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="font-medium text-sm truncate pr-2">{cat.category}</span>
                                    <span className="text-sm font-semibold shrink-0">
                                        {formatCurrency(cat.totalValue)}
                                    </span>
                                </div>
                                <ProgressBar
                                    value={cat.percentOfTotal}
                                    color={categoryColors[idx % categoryColors.length]}
                                    showValue
                                    height="sm"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Items */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    Top Value Items
                </h3>
                <div className="rounded-xl border overflow-hidden">
                    {report.topValueItems.map((item, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors",
                                idx !== report.topValueItems.length - 1 && "border-b"
                            )}
                        >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-sm font-bold text-primary">#{idx + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{item.itemName}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatNumber(item.quantity)} units × {formatCurrencyFull(item.unitCost)}
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-semibold">{formatCurrency(item.totalValue)}</p>
                                <p className="text-xs text-muted-foreground">{formatPercent(item.percentOfTotal)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Value Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard label="Raw Materials" value={formatCurrency(report.breakdown.rawMaterials)} />
                <MetricCard label="Finished Goods" value={formatCurrency(report.breakdown.finishedGoods)} />
                <MetricCard label="Accessories" value={formatCurrency(report.breakdown.accessories)} />
                <MetricCard label="Consumables" value={formatCurrency(report.breakdown.consumables)} />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// STOCK MOVEMENT REPORT
// ═══════════════════════════════════════════════════════════════════
function StockMovementContent() {
    const report = MOCK_STOCK_MOVEMENT_REPORT;

    return (
        <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    label="Receives"
                    value={report.receives.count.toString()}
                    subvalue={`${formatNumber(report.receives.totalUnits)} units`}
                    variant="success"
                    icon={<ArrowUpDown className="w-5 h-5 text-emerald-600" />}
                />
                <MetricCard
                    label="Transfers"
                    value={report.transfers.count.toString()}
                    subvalue={`${formatNumber(report.transfers.totalUnits)} units`}
                    variant="info"
                    icon={<RefreshCcw className="w-5 h-5 text-blue-600" />}
                />
                <MetricCard
                    label="Issues"
                    value={report.issues.count.toString()}
                    subvalue={`${formatNumber(report.issues.totalUnits)} units`}
                    variant="warning"
                    icon={<Package className="w-5 h-5 text-amber-600" />}
                />
                <MetricCard
                    label="Adjustments"
                    value={report.adjustments.count.toString()}
                    subvalue={`${report.adjustments.netChange} net change`}
                    variant="danger"
                    icon={<ClipboardCheck className="w-5 h-5 text-rose-600" />}
                />
            </div>

            {/* Daily Activity Chart */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">
                    7-Day Activity Overview
                </h3>
                <div className="rounded-xl border overflow-hidden">
                    <div className="grid grid-cols-5 gap-0 bg-muted/30 p-3 border-b text-xs font-medium text-muted-foreground">
                        <div>Date</div>
                        <div className="text-center text-emerald-600">Receives</div>
                        <div className="text-center text-blue-600">Transfers</div>
                        <div className="text-center text-amber-600">Issues</div>
                        <div className="text-center text-rose-600">Adj.</div>
                    </div>
                    {report.byDay.map((day, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "grid grid-cols-5 gap-0 p-3 hover:bg-muted/30 transition-colors",
                                idx !== report.byDay.length - 1 && "border-b"
                            )}
                        >
                            <div className="text-sm font-medium">
                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-center">
                                {day.receives > 0 ? (
                                    <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/30 min-w-[2rem]">
                                        {day.receives}
                                    </Badge>
                                ) : <span className="text-muted-foreground">—</span>}
                            </div>
                            <div className="text-center">
                                {day.transfers > 0 ? (
                                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-500/30 min-w-[2rem]">
                                        {day.transfers}
                                    </Badge>
                                ) : <span className="text-muted-foreground">—</span>}
                            </div>
                            <div className="text-center">
                                {day.issues > 0 ? (
                                    <Badge variant="secondary" className="bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/30 min-w-[2rem]">
                                        {day.issues}
                                    </Badge>
                                ) : <span className="text-muted-foreground">—</span>}
                            </div>
                            <div className="text-center">
                                {day.adjustments > 0 ? (
                                    <Badge variant="secondary" className="bg-rose-500/20 text-rose-700 dark:text-rose-400 hover:bg-rose-500/30 min-w-[2rem]">
                                        {day.adjustments}
                                    </Badge>
                                ) : <span className="text-muted-foreground">—</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Adjustment Reasons */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Adjustment Reasons</h3>
                <div className="flex flex-wrap gap-2">
                    {report.adjustments.reasons.map((reason, idx) => (
                        <Badge key={idx} variant="outline" className="py-2 px-4 text-sm">
                            {reason.reason}
                            <span className="ml-2 bg-muted rounded-full px-2 py-0.5 text-xs font-semibold">
                                {reason.count}
                            </span>
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// TURNOVER ANALYSIS REPORT
// ═══════════════════════════════════════════════════════════════════
function TurnoverAnalysisContent() {
    const report = MOCK_TURNOVER_ANALYSIS_REPORT;

    const getTrendIcon = (trend: string) => {
        if (trend === 'increasing') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
        if (trend === 'decreasing') return <TrendingDown className="w-4 h-4 text-rose-500" />;
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    };

    const getClassBadge = (classification: string) => {
        const styles = {
            fast: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
            medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
            slow: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30',
            obsolete: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
        };
        return (
            <Badge variant="outline" className={cn("capitalize font-medium", styles[classification as keyof typeof styles] || styles.medium)}>
                {classification}
            </Badge>
        );
    };

    return (
        <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    label="Turnover Rate"
                    value={`${report.overallTurnoverRate}×`}
                    subvalue="per year"
                    variant="info"
                />
                <MetricCard
                    label="Days on Hand"
                    value={report.avgDaysOnHand.toString()}
                    subvalue="average"
                />
                <MetricCard
                    label="Fast Moving"
                    value={report.summary.fastMoving.toString()}
                    subvalue="items"
                    variant="success"
                />
                <MetricCard
                    label="Slow Moving"
                    value={report.summary.slowMoving.toString()}
                    subvalue="items"
                    variant="warning"
                />
            </div>

            {/* Items Table */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">
                    Item Performance ({report.period})
                </h3>
                <div className="rounded-xl border overflow-hidden">
                    {report.items.map((item, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors",
                                idx !== report.items.length - 1 && "border-b"
                            )}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm truncate">{item.itemName}</span>
                                    {getTrendIcon(item.trend)}
                                </div>
                                <p className="text-xs text-muted-foreground">{item.category}</p>
                            </div>
                            <div className="text-center shrink-0 px-4">
                                <p className="text-lg font-bold text-primary">{item.turnoverRate}×</p>
                                <p className="text-xs text-muted-foreground">{item.daysOnHand}d</p>
                            </div>
                            <div className="shrink-0 w-20">
                                {getClassBadge(item.classification)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// ABC ANALYSIS REPORT
// ═══════════════════════════════════════════════════════════════════
function ABCAnalysisContent() {
    const report = MOCK_ABC_ANALYSIS_REPORT;

    return (
        <div className="space-y-8">
            {/* Class Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border-2 border-emerald-500/50 bg-emerald-500/5 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">A</span>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Class A</p>
                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                {report.summary.classA.itemCount} items
                            </p>
                        </div>
                    </div>
                    <div className="pt-3 border-t border-emerald-500/20">
                        <p className="text-sm font-semibold">{formatCurrency(report.summary.classA.totalValue)}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatPercent(report.summary.classA.percentOfValue)} of total value
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border-2 border-amber-500/50 bg-amber-500/5 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">B</span>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Class B</p>
                            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                                {report.summary.classB.itemCount} items
                            </p>
                        </div>
                    </div>
                    <div className="pt-3 border-t border-amber-500/20">
                        <p className="text-sm font-semibold">{formatCurrency(report.summary.classB.totalValue)}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatPercent(report.summary.classB.percentOfValue)} of total value
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border-2 border-slate-400/50 bg-slate-400/5 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-400 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">C</span>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Class C</p>
                            <p className="text-xl font-bold text-slate-600 dark:text-slate-400">
                                {report.summary.classC.itemCount} items
                            </p>
                        </div>
                    </div>
                    <div className="pt-3 border-t border-slate-400/20">
                        <p className="text-sm font-semibold">{formatCurrency(report.summary.classC.totalValue)}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatPercent(report.summary.classC.percentOfValue)} of total value
                        </p>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Item Classification</h3>
                <div className="rounded-xl border overflow-hidden">
                    {report.items.map((item, idx) => {
                        const classColors = {
                            A: 'bg-emerald-500',
                            B: 'bg-amber-500',
                            C: 'bg-slate-400'
                        };

                        return (
                            <div
                                key={idx}
                                className={cn(
                                    "flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors",
                                    idx !== report.items.length - 1 && "border-b"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                    classColors[item.classification as keyof typeof classColors]
                                )}>
                                    <span className="text-sm font-bold text-white">{item.classification}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{item.itemName}</p>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                        {item.recommendedAction}
                                    </p>
                                </div>
                                <div className="text-right shrink-0 pl-4">
                                    <p className="font-semibold text-sm">{formatCurrency(item.annualValue)}</p>
                                    <p className="text-xs text-muted-foreground">{formatPercent(item.percentOfTotalValue)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// LOT TRACEABILITY REPORT
// ═══════════════════════════════════════════════════════════════════
function LotTraceabilityContent() {
    const report = MOCK_LOT_TRACEABILITY_REPORT;

    const getEventIcon = (type: string) => {
        const icons = {
            received: <Package className="w-4 h-4" />,
            moved: <ArrowUpDown className="w-4 h-4" />,
            allocated: <Clock className="w-4 h-4" />,
            issued: <CheckCircle2 className="w-4 h-4" />
        };
        return icons[type as keyof typeof icons] || <History className="w-4 h-4" />;
    };

    const getEventColor = (type: string) => {
        const colors = {
            received: 'bg-emerald-500 text-white',
            moved: 'bg-blue-500 text-white',
            allocated: 'bg-amber-500 text-white',
            issued: 'bg-purple-500 text-white'
        };
        return colors[type as keyof typeof colors] || 'bg-muted text-muted-foreground';
    };

    return (
        <div className="space-y-8">
            {/* Lot Header */}
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold mb-1">{report.itemName}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Lot: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{report.lotNumber}</code></span>
                            {report.dyeLot && (
                                <span>Dye: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{report.dyeLot}</code></span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={report.qcStatus === 'passed' ? 'default' : 'destructive'} className="py-1">
                            QC: {report.qcStatus}
                        </Badge>
                        <Badge variant="outline" className="py-1 capitalize">{report.status}</Badge>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label="Original Qty" value={formatNumber(report.originalQuantity)} />
                <MetricCard label="Current Qty" value={formatNumber(report.currentQuantity)} variant="info" />
                <MetricCard label="Remaining" value={formatPercent(report.percentRemaining)} />
                <MetricCard label="Vendor" value={report.vendorName} />
            </div>

            {/* Current Locations */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Current Locations
                </h3>
                <div className="flex flex-wrap gap-3">
                    {report.currentLocations.map((loc, idx) => (
                        <div key={idx} className="rounded-lg border bg-card p-3">
                            <p className="font-mono text-sm font-semibold">{loc.locationCode}</p>
                            <p className="text-lg font-bold text-primary">{formatNumber(loc.quantity)}</p>
                            <p className="text-xs text-muted-foreground">units</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Timeline */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Lot Timeline</h3>
                <div className="relative">
                    <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-border" />
                    <div className="space-y-4">
                        {report.events.map((event, idx) => (
                            <div key={idx} className="flex gap-4 relative">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10",
                                    getEventColor(event.eventType)
                                )}>
                                    {getEventIcon(event.eventType)}
                                </div>
                                <div className="flex-1 bg-card rounded-lg border p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-sm capitalize">
                                            {event.eventType.replace('-', ' ')}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(event.timestamp).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {event.quantity} units → {event.location} • {event.performedBy}
                                    </p>
                                    {event.notes && (
                                        <p className="text-xs text-muted-foreground mt-1 italic">{event.notes}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Warnings */}
            {report.warnings.length > 0 && (
                <div className="rounded-xl border-2 border-amber-500/50 bg-amber-500/5 p-4">
                    <div className="flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-sm text-amber-700 dark:text-amber-400 mb-1">Attention Required</p>
                            {report.warnings.map((warning, idx) => (
                                <p key={idx} className="text-sm text-muted-foreground">{warning}</p>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// CYCLE COUNT ACCURACY REPORT
// ═══════════════════════════════════════════════════════════════════
function CycleCountAccuracyContent() {
    const report = MOCK_CYCLE_COUNT_ACCURACY_REPORT;

    const getTrendIcon = (trend: string) => {
        if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
        if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-rose-500" />;
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    };

    const getAccuracyColor = (accuracy: number) => {
        if (accuracy >= 98) return 'text-emerald-600 dark:text-emerald-400';
        if (accuracy >= 95) return 'text-amber-600 dark:text-amber-400';
        return 'text-rose-600 dark:text-rose-400';
    };

    const getAccuracyBarColor = (accuracy: number) => {
        if (accuracy >= 98) return 'bg-emerald-500';
        if (accuracy >= 95) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    return (
        <div className="space-y-8">
            {/* Hero Accuracy */}
            <div className="text-center py-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border">
                <p className="text-sm font-medium text-muted-foreground mb-1">Overall Accuracy</p>
                <p className={cn("text-5xl font-bold tracking-tight", getAccuracyColor(report.overallAccuracy))}>
                    {formatPercent(report.overallAccuracy)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                    {report.totalCountsPerformed} counts • {report.totalItemsCounted} items • {report.period}
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    label="Counts Performed"
                    value={report.totalCountsPerformed.toString()}
                />
                <MetricCard
                    label="Items Counted"
                    value={formatNumber(report.totalItemsCounted)}
                />
                <MetricCard
                    label="Variances Found"
                    value={report.totalVarianceCount.toString()}
                    variant="warning"
                />
                <MetricCard
                    label="Variance Value"
                    value={formatCurrencyFull(report.totalVarianceValue)}
                    variant="danger"
                />
            </div>

            {/* Location Accuracy */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Accuracy by Location</h3>
                <div className="rounded-xl border overflow-hidden">
                    {report.byLocation.map((loc, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors",
                                idx !== report.byLocation.length - 1 && "border-b"
                            )}
                        >
                            <div className="w-20 shrink-0">
                                <code className="text-sm font-semibold bg-muted px-2 py-1 rounded">{loc.locationCode}</code>
                            </div>
                            <div className="flex-1 min-w-0">
                                <ProgressBar
                                    value={loc.avgAccuracy}
                                    color={getAccuracyBarColor(loc.avgAccuracy)}
                                    height="md"
                                />
                            </div>
                            <div className={cn("w-16 text-right font-bold", getAccuracyColor(loc.avgAccuracy))}>
                                {formatPercent(loc.avgAccuracy)}
                            </div>
                            <div className="w-8 shrink-0">
                                {getTrendIcon(loc.trend)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Problem Items */}
            {report.topVarianceItems.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-foreground mb-4">Items Needing Attention</h3>
                    <div className="space-y-3">
                        {report.topVarianceItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border bg-rose-500/5 border-rose-500/20">
                                <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
                                    <span className="font-bold text-rose-600">{item.lastVariance}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">{item.itemName}</p>
                                    <p className="text-xs text-muted-foreground">{item.reason}</p>
                                </div>
                                <Badge variant="outline" className="shrink-0">
                                    {item.varianceCount} variances
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            <div className="rounded-xl bg-primary/5 border p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Recommendations
                </h3>
                <ul className="space-y-2">
                    {report.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                            <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span>{rec}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════════
export function WarehouseReportModal({ open, onClose, reportType }: WarehouseReportModalProps) {
    const reportConfig = {
        'inventory-valuation': {
            title: 'Inventory Valuation Report',
            description: 'Total inventory value breakdown by category and top items',
            icon: <BarChart3 className="w-5 h-5" />,
            content: <InventoryValuationContent />
        },
        'stock-movement': {
            title: 'Stock Movement Report',
            description: 'Complete transaction history and activity analysis',
            icon: <ArrowUpDown className="w-5 h-5" />,
            content: <StockMovementContent />
        },
        'turnover': {
            title: 'Turnover Analysis Report',
            description: 'Inventory velocity metrics and item performance',
            icon: <RefreshCcw className="w-5 h-5" />,
            content: <TurnoverAnalysisContent />
        },
        'abc': {
            title: 'ABC Analysis Report',
            description: 'Strategic item classification by annual value',
            icon: <Layers className="w-5 h-5" />,
            content: <ABCAnalysisContent />
        },
        'lot-trace': {
            title: 'Lot Traceability Report',
            description: 'Complete material lineage and movement history',
            icon: <History className="w-5 h-5" />,
            content: <LotTraceabilityContent />
        },
        'cycle-count': {
            title: 'Cycle Count Accuracy Report',
            description: 'Physical count accuracy and variance analysis',
            icon: <ClipboardCheck className="w-5 h-5" />,
            content: <CycleCountAccuracyContent />
        }
    };

    const config = reportType ? reportConfig[reportType] : null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                {config && (
                    <>
                        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30 shrink-0">
                            <DialogTitle className="flex items-center gap-3 text-xl">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    {config.icon}
                                </div>
                                {config.title}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                {config.description}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            {config.content}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default WarehouseReportModal;
