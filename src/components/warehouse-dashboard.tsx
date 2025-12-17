'use client';

import { useMemo } from 'react';
import { useData } from '@/components/data-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
    Package,
    ArrowUpDown,
    AlertTriangle,
    CheckCircle2,
    Clock,
    TrendingUp,
    TrendingDown,
    Truck,
    MapPin,
    History,
    AlertCircle,
    BarChart3,
    Layers,
    RefreshCcw,
    Plus,
    ArrowRight,
    Boxes,
    ClipboardCheck
} from 'lucide-react';
import { calculateWarehouseMetrics } from '@/lib/warehouse-mock-data';

// ══════════════════════════════════════════════════════════════════
// WAREHOUSE DASHBOARD COMPONENT
// Real-time visibility into inventory, transfers, and operations
// ══════════════════════════════════════════════════════════════════

interface WarehouseDashboardProps {
    onReceiveClick?: () => void;
    onTransferClick?: () => void;
    onAdjustClick?: () => void;
    onViewTransactions?: () => void;
}

export function WarehouseDashboard({
    onReceiveClick,
    onTransferClick,
    onAdjustClick,
    onViewTransactions
}: WarehouseDashboardProps) {
    const { data } = useData();

    // Calculate metrics
    const metrics = useMemo(() => calculateWarehouseMetrics(), []);

    // Get recent transactions
    const recentTransactions = useMemo(() => {
        return [...(data.inventoryTransactions || [])]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 8);
    }, [data.inventoryTransactions]);

    // Get active transfers
    const activeTransfers = useMemo(() => {
        return (data.stockTransfers || []).filter(t =>
            ['pending', 'approved', 'picking', 'in_transit'].includes(t.status)
        );
    }, [data.stockTransfers]);

    // Get low stock alerts
    const lowStockItems = useMemo(() => {
        return data.inventory.filter(item => {
            const available = item.stock - item.reserved;
            return available < 5;
        });
    }, [data.inventory]);

    // Get reorder suggestions
    const reorderSuggestions = useMemo(() => {
        return (data.reorderSuggestions || []).slice(0, 5);
    }, [data.reorderSuggestions]);

    // Transaction type styling
    const getTransactionStyle = (type: string) => {
        switch (type) {
            case 'receive':
                return { bg: 'bg-green-500/10', text: 'text-green-600', icon: <Package className="w-4 h-4" /> };
            case 'transfer_out':
            case 'transfer_in':
                return { bg: 'bg-blue-500/10', text: 'text-blue-600', icon: <ArrowUpDown className="w-4 h-4" /> };
            case 'issue':
                return { bg: 'bg-purple-500/10', text: 'text-purple-600', icon: <Truck className="w-4 h-4" /> };
            case 'adjust_up':
            case 'adjust_down':
                return { bg: 'bg-yellow-500/10', text: 'text-yellow-600', icon: <RefreshCcw className="w-4 h-4" /> };
            case 'damage':
            case 'scrap':
                return { bg: 'bg-red-500/10', text: 'text-red-600', icon: <AlertTriangle className="w-4 h-4" /> };
            case 'return':
                return { bg: 'bg-cyan-500/10', text: 'text-cyan-600', icon: <ArrowUpDown className="w-4 h-4" /> };
            default:
                return { bg: 'bg-gray-500/10', text: 'text-gray-600', icon: <History className="w-4 h-4" /> };
        }
    };

    // Priority styling for reorder suggestions
    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'critical':
                return 'bg-red-500/10 text-red-600 border-red-500/30';
            case 'high':
                return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
            case 'medium':
                return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30';
            default:
                return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const date = new Date(timestamp);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
                <Button onClick={onReceiveClick} className="gap-2">
                    <Package className="w-4 h-4" />
                    Receive Delivery
                </Button>
                <Button onClick={onTransferClick} variant="outline" className="gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    New Transfer
                </Button>
                <Button onClick={onAdjustClick} variant="outline" className="gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    Adjust Inventory
                </Button>
                <Button onClick={onViewTransactions} variant="ghost" className="gap-2 ml-auto">
                    <History className="w-4 h-4" />
                    View History
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Card className="col-span-1">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-primary/10">
                                <Boxes className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{metrics.totalSKUs}</div>
                                <div className="text-sm text-muted-foreground">SKUs</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-green-500/10">
                                <Package className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{metrics.totalUnits.toLocaleString()}</div>
                                <div className="text-sm text-muted-foreground">Units</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-blue-500/10">
                                <BarChart3 className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">${(metrics.totalValue / 1000).toFixed(1)}k</div>
                                <div className="text-sm text-muted-foreground">Value</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={cn("col-span-1", metrics.lowStockCount > 0 && "border-yellow-500/50 bg-yellow-500/5")}>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-3 rounded-xl", metrics.lowStockCount > 0 ? "bg-yellow-500/20" : "bg-muted")}>
                                <AlertTriangle className={cn("w-6 h-6", metrics.lowStockCount > 0 ? "text-yellow-600" : "text-muted-foreground")} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{metrics.lowStockCount}</div>
                                <div className="text-sm text-muted-foreground">Low Stock</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-purple-500/10">
                                <Truck className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{activeTransfers.length}</div>
                                <div className="text-sm text-muted-foreground">In Transit</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-green-500/10">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{metrics.inventoryAccuracy}%</div>
                                <div className="text-sm text-muted-foreground">Accuracy</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <History className="w-5 h-5" />
                                    Recent Transactions
                                </CardTitle>
                                <CardDescription>Last 8 inventory movements</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={onViewTransactions}>
                                View All <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {recentTransactions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No transactions recorded yet</p>
                                </div>
                            ) : (
                                recentTransactions.map((txn) => {
                                    const style = getTransactionStyle(txn.type);
                                    return (
                                        <div key={txn.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className={cn("p-2 rounded-lg", style.bg)}>
                                                <span className={style.text}>{style.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium truncate">{txn.itemName}</span>
                                                    <Badge variant="outline" className="text-xs shrink-0">
                                                        {txn.type.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <span>{txn.quantity} {txn.unit}</span>
                                                    <span>•</span>
                                                    <span>{txn.locationCode}</span>
                                                    {txn.projectName && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="truncate">{txn.projectName}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-sm text-muted-foreground">{formatTimeAgo(txn.timestamp)}</div>
                                                <div className="text-xs text-muted-foreground">{txn.performedBy}</div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Reorder Alerts */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Reorder Alerts
                        </CardTitle>
                        <CardDescription>Items below reorder point</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {reorderSuggestions.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">
                                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-500" />
                                    <p className="text-sm">All stock levels healthy</p>
                                </div>
                            ) : (
                                reorderSuggestions.map((item) => (
                                    <div key={item.itemId} className={cn("p-3 rounded-lg border", getPriorityStyle(item.priority))}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="font-medium truncate">{item.itemName}</div>
                                                <div className="text-xs mt-1">
                                                    <span className="font-mono">{item.sku}</span>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={cn("shrink-0", getPriorityStyle(item.priority))}>
                                                {item.priority}
                                            </Badge>
                                        </div>
                                        <div className="mt-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Current:</span>
                                                <span className="font-medium">{item.currentStock}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Suggest Order:</span>
                                                <span className="font-medium text-primary">{item.suggestedQuantity}</span>
                                            </div>
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>Est. Cost:</span>
                                                <span>${item.estimatedCost.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        {item.jobsAffected.length > 0 && (
                                            <div className="mt-2 text-xs text-muted-foreground">
                                                ⚠️ {item.jobsAffected.length} job{item.jobsAffected.length > 1 ? 's' : ''} at risk
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Active Transfers & Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Transfers */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ArrowUpDown className="w-5 h-5" />
                                    Active Transfers
                                </CardTitle>
                                <CardDescription>In-transit and pending transfers</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={onTransferClick}>
                                <Plus className="w-4 h-4 mr-1" /> New
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {activeTransfers.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">
                                    <Truck className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No active transfers</p>
                                </div>
                            ) : (
                                activeTransfers.map((transfer) => (
                                    <div key={transfer.id} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="font-medium">{transfer.transferNumber}</div>
                                                <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {transfer.fromLocationCode} → {transfer.toLocationCode}
                                                </div>
                                            </div>
                                            <Badge variant={transfer.status === 'in_transit' ? 'default' : 'secondary'}>
                                                {transfer.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{transfer.totalItems} items</span>
                                            {transfer.projectName && (
                                                <span className="text-primary text-xs">{transfer.projectName}</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Low Stock Items */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            Low Stock Items
                        </CardTitle>
                        <CardDescription>Items with less than 5 units available</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {lowStockItems.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">
                                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-500" />
                                    <p className="text-sm">All items have healthy stock</p>
                                </div>
                            ) : (
                                lowStockItems.map((item) => {
                                    const available = item.stock - item.reserved;
                                    const percentage = item.stock > 0 ? (available / item.stock) * 100 : 0;
                                    return (
                                        <div key={item.id} className="p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">{item.sku}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-yellow-600">{available}</div>
                                                    <div className="text-xs text-muted-foreground">available</div>
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <Progress value={percentage} className="h-1.5 [&>div]:bg-yellow-500" />
                                            </div>
                                            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                                                <span>Stock: {item.stock}</span>
                                                <span>Reserved: {item.reserved}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Weekly Stats */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        This Week's Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50 text-center">
                            <div className="text-2xl font-bold text-green-600">{metrics.receivesThisWeek}</div>
                            <div className="text-sm text-muted-foreground">Receives</div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 text-center">
                            <div className="text-2xl font-bold text-blue-600">{metrics.transfersThisWeek}</div>
                            <div className="text-sm text-muted-foreground">Transfers</div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 text-center">
                            <div className="text-2xl font-bold text-purple-600">{metrics.issuesThisWeek}</div>
                            <div className="text-sm text-muted-foreground">Issues to Jobs</div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 text-center">
                            <div className="text-2xl font-bold">{metrics.jobsScheduledThisWeek}</div>
                            <div className="text-sm text-muted-foreground">Jobs Scheduled</div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 text-center">
                            <div className="text-2xl font-bold text-green-600">{metrics.jobsReadyForMaterials}</div>
                            <div className="text-sm text-muted-foreground">Jobs Ready</div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 text-center">
                            <div className={cn("text-2xl font-bold", metrics.jobsWithShortages > 0 ? "text-red-600" : "text-muted-foreground")}>
                                {metrics.jobsWithShortages}
                            </div>
                            <div className="text-sm text-muted-foreground">With Shortages</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lot Warnings */}
            {metrics.lotMismatchWarnings > 0 && (
                <Card className="border-orange-500/50 bg-orange-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-orange-500/20">
                                <Layers className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-orange-600">Lot Mismatch Warning</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {metrics.lotMismatchWarnings} project{metrics.lotMismatchWarnings > 1 ? 's have' : ' has'} materials
                                    from multiple dye lots. This may cause visible color variations in the final installation.
                                </p>
                                <Button variant="outline" size="sm" className="mt-3 text-orange-600 border-orange-500/50 hover:bg-orange-500/10">
                                    View Details
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
