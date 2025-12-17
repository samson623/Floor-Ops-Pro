'use client';

import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useData } from '@/components/data-provider';
import { usePermissions } from '@/components/permission-context';
import { cn } from '@/lib/utils';
import type { InventoryItem } from '@/lib/data';
import {
    Package,
    MapPin,
    History,
    Layers,
    AlertTriangle,
    ArrowUpDown,
    Edit,
    ClipboardCheck,
    TrendingUp,
    Box,
    Calendar,
    Truck,
    Home,
    RefreshCcw,
    Bookmark
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════
// INVENTORY ITEM DETAIL MODAL
// Comprehensive view of stock levels, locations, lots, and history
// ══════════════════════════════════════════════════════════════════

interface InventoryDetailModalProps {
    open: boolean;
    onClose: () => void;
    item: InventoryItem | null;
    onAdjust?: (item: InventoryItem) => void;
    onTransfer?: (item: InventoryItem) => void;
    onReserve?: (item: InventoryItem) => void;
}

export function InventoryDetailModal({
    open,
    onClose,
    item,
    onAdjust,
    onTransfer,
    onReserve
}: InventoryDetailModalProps) {
    const { data } = useData();
    const { can } = usePermissions();

    // Get transactions for this item
    const itemTransactions = useMemo(() => {
        if (!item) return [];
        return (data.inventoryTransactions || [])
            .filter(t => t.itemId === item.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);
    }, [item, data.inventoryTransactions]);

    // Get lots for this item
    const itemLots = useMemo(() => {
        if (!item) return [];
        return (data.enhancedLots || []).filter(l => l.itemId === item.id);
    }, [item, data.enhancedLots]);

    // Get reservations for this item
    const itemReservations = useMemo(() => {
        if (!item) return [];
        return (data.stockReservations || []).filter(r => r.itemId === item.id && r.status === 'active');
    }, [item, data.stockReservations]);

    // Calculate available stock
    const stockInfo = useMemo(() => {
        if (!item) return { available: 0, reserved: 0, total: 0, utilizationPct: 0 };
        const available = item.stock - item.reserved;
        return {
            available,
            reserved: item.reserved,
            total: item.stock,
            utilizationPct: item.stock > 0 ? Math.round((item.reserved / item.stock) * 100) : 0
        };
    }, [item]);

    // Get stock by location type
    const stockByLocationType = useMemo(() => {
        if (!item || !itemLots.length) return { warehouse: 0, truck: 0, jobsite: 0, staging: 0 };

        const locations = data.warehouseLocations || [];
        let warehouse = 0, truck = 0, jobsite = 0, staging = 0;

        itemLots.forEach(lot => {
            lot.locations.forEach(loc => {
                const location = locations.find(l => l.id === loc.locationId);
                if (location) {
                    switch (location.type) {
                        case 'warehouse':
                        case 'zone':
                        case 'aisle':
                        case 'bay':
                        case 'shelf':
                        case 'bin':
                            warehouse += loc.quantity;
                            break;
                        case 'truck':
                            truck += loc.quantity;
                            break;
                        case 'jobsite':
                            jobsite += loc.quantity;
                            break;
                        case 'staging':
                            staging += loc.quantity;
                            break;
                    }
                }
            });
        });

        return { warehouse, truck, jobsite, staging };
    }, [item, itemLots, data.warehouseLocations]);

    // Transaction type styling
    const getTransactionStyle = (type: string) => {
        switch (type) {
            case 'receive':
                return { color: 'text-green-600', bg: 'bg-green-500/10' };
            case 'transfer_out':
            case 'transfer_in':
                return { color: 'text-blue-600', bg: 'bg-blue-500/10' };
            case 'issue':
                return { color: 'text-purple-600', bg: 'bg-purple-500/10' };
            case 'adjust_up':
            case 'adjust_down':
                return { color: 'text-yellow-600', bg: 'bg-yellow-500/10' };
            case 'damage':
            case 'scrap':
                return { color: 'text-red-600', bg: 'bg-red-500/10' };
            default:
                return { color: 'text-gray-600', bg: 'bg-gray-500/10' };
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

    if (!item) return null;

    const isLowStock = stockInfo.available < 10;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/10">
                                <Package className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">{item.name}</DialogTitle>
                                <DialogDescription className="flex items-center gap-2 mt-1">
                                    <code className="text-xs bg-muted px-2 py-0.5 rounded">{item.sku}</code>
                                    <span>•</span>
                                    <span>{itemLots.length} lot{itemLots.length !== 1 ? 's' : ''}</span>
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isLowStock && (
                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Low Stock
                                </Badge>
                            )}
                            {!isLowStock && (
                                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                                    In Stock
                                </Badge>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto -mx-6 px-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="pt-4 pb-3">
                                <div className="flex items-center gap-2">
                                    <Box className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Total Stock</span>
                                </div>
                                <div className="text-2xl font-bold mt-1">{stockInfo.total}</div>
                            </CardContent>
                        </Card>
                        <Card className={cn(stockInfo.reserved > 0 && "border-blue-500/30 bg-blue-500/5")}>
                            <CardContent className="pt-4 pb-3">
                                <div className="flex items-center gap-2">
                                    <Bookmark className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-muted-foreground">Reserved</span>
                                </div>
                                <div className="text-2xl font-bold mt-1 text-blue-600">{stockInfo.reserved}</div>
                            </CardContent>
                        </Card>
                        <Card className={cn(isLowStock && "border-yellow-500/30 bg-yellow-500/5")}>
                            <CardContent className="pt-4 pb-3">
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-muted-foreground">Available</span>
                                </div>
                                <div className={cn("text-2xl font-bold mt-1", isLowStock ? "text-yellow-600" : "text-green-600")}>
                                    {stockInfo.available}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 pb-3">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Dye Lots</span>
                                </div>
                                <div className="text-2xl font-bold mt-1">{itemLots.length}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stock Distribution */}
                    <Card className="mb-6">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Stock Distribution by Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                                    <Box className="w-5 h-5 text-primary" />
                                    <div>
                                        <div className="text-lg font-bold">{stockByLocationType.warehouse}</div>
                                        <div className="text-xs text-muted-foreground">Warehouse</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/5">
                                    <Truck className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <div className="text-lg font-bold">{stockByLocationType.truck}</div>
                                        <div className="text-xs text-muted-foreground">On Trucks</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5">
                                    <Home className="w-5 h-5 text-green-600" />
                                    <div>
                                        <div className="text-lg font-bold">{stockByLocationType.jobsite}</div>
                                        <div className="text-xs text-muted-foreground">At Jobsites</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/5">
                                    <ClipboardCheck className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <div className="text-lg font-bold">{stockByLocationType.staging}</div>
                                        <div className="text-xs text-muted-foreground">Staging</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabs for Details */}
                    <Tabs defaultValue="lots" className="mb-6">
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="lots" className="gap-1.5">
                                <Layers className="w-4 h-4" />
                                Lots ({itemLots.length})
                            </TabsTrigger>
                            <TabsTrigger value="reservations" className="gap-1.5">
                                <Bookmark className="w-4 h-4" />
                                Reservations ({itemReservations.length})
                            </TabsTrigger>
                            <TabsTrigger value="history" className="gap-1.5">
                                <History className="w-4 h-4" />
                                History ({itemTransactions.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* Lots Tab */}
                        <TabsContent value="lots" className="mt-4">
                            {itemLots.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Layers className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No lot information available</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {itemLots.map((lot) => (
                                        <div key={lot.id} className={cn(
                                            "p-4 rounded-lg border transition-colors",
                                            lot.status === 'damaged' && "border-red-500/50 bg-red-500/5",
                                            lot.qcStatus === 'failed' && "border-orange-500/50 bg-orange-500/5"
                                        )}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium font-mono">{lot.lotNumber}</span>
                                                        {lot.dyeLot && (
                                                            <Badge variant="outline" className="text-xs">
                                                                Dye: {lot.dyeLot}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground mt-1">
                                                        {lot.vendorName} • Received {new Date(lot.receivedDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {lot.qcStatus && (
                                                        <Badge variant={lot.qcStatus === 'passed' ? 'default' : 'destructive'} className="text-xs">
                                                            QC: {lot.qcStatus}
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline" className="text-xs">
                                                        {lot.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center gap-6 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Original:</span>
                                                    <span className="ml-1 font-medium">{lot.originalQuantity}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Current:</span>
                                                    <span className="ml-1 font-medium">{lot.currentQuantity}</span>
                                                </div>
                                                {lot.locations.length > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3 text-muted-foreground" />
                                                        {lot.locations.map(loc => loc.locationCode).join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                            {lot.allocations && lot.allocations.length > 0 && (
                                                <div className="mt-2 text-sm text-primary">
                                                    Allocated: {lot.allocations.map(a => a.projectName).join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* Reservations Tab */}
                        <TabsContent value="reservations" className="mt-4">
                            {itemReservations.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Bookmark className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No active reservations</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {itemReservations.map((res) => (
                                        <div key={res.id} className="p-4 rounded-lg border bg-blue-500/5 border-blue-500/30">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="font-medium">{res.projectName}</div>
                                                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                                        <Calendar className="w-3 h-3" />
                                                        Job starts {new Date(res.jobStartDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <Badge variant="secondary">
                                                    {res.quantity} {res.unit}
                                                </Badge>
                                            </div>
                                            <div className="mt-3">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-muted-foreground">Issued vs Reserved</span>
                                                    <span>{res.quantityIssued} / {res.quantity}</span>
                                                </div>
                                                <Progress value={(res.quantityIssued / res.quantity) * 100} className="h-1.5" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* History Tab */}
                        <TabsContent value="history" className="mt-4">
                            {itemTransactions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No transaction history</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {itemTransactions.map((txn) => {
                                        const style = getTransactionStyle(txn.type);
                                        return (
                                            <div key={txn.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className={cn("p-2 rounded-lg", style.bg)}>
                                                    {txn.type.includes('transfer') ? <ArrowUpDown className={cn("w-4 h-4", style.color)} /> :
                                                        txn.type === 'receive' ? <Package className={cn("w-4 h-4", style.color)} /> :
                                                            txn.type === 'issue' ? <Truck className={cn("w-4 h-4", style.color)} /> :
                                                                <RefreshCcw className={cn("w-4 h-4", style.color)} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {txn.type.replace('_', ' ')}
                                                        </Badge>
                                                        <span className="font-medium">{txn.quantity} {txn.unit}</span>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
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
                                    })}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Action Buttons - Permission Gated */}
                <div className="shrink-0 flex items-center justify-between gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <div className="flex items-center gap-2">
                        {can('EDIT_INVENTORY') && (
                            <Button variant="outline" className="gap-2">
                                <Edit className="w-4 h-4" />
                                Edit Item
                            </Button>
                        )}
                        {can('CREATE_TRANSFER') && onTransfer && (
                            <Button variant="outline" className="gap-2" onClick={() => { onTransfer(item); onClose(); }}>
                                <ArrowUpDown className="w-4 h-4" />
                                Transfer
                            </Button>
                        )}
                        {can('ALLOCATE_STOCK') && onReserve && (
                            <Button variant="outline" className="gap-2" onClick={() => { onReserve(item); onClose(); }}>
                                <Bookmark className="w-4 h-4" />
                                Reserve
                            </Button>
                        )}
                        {can('ADJUST_INVENTORY') && onAdjust && (
                            <Button className="gap-2" onClick={() => { onAdjust(item); onClose(); }}>
                                <RefreshCcw className="w-4 h-4" />
                                Adjust Stock
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
