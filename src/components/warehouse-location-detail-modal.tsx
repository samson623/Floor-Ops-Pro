'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/components/data-provider';
import { usePermissions } from '@/components/permission-context';
import { cn } from '@/lib/utils';
import { getLocationInventorySummary, checkDyeLotVariances } from '@/lib/warehouse-utils';
import type { WarehouseLocation } from '@/lib/warehouse-types';
import type { InventoryItem } from '@/lib/data';
import {
    MapPin,
    Package,
    Truck,
    Home,
    ArrowUpDown,
    History,
    Edit,
    AlertTriangle,
    Box,
    Settings,
    Layers,
    CheckCircle2,
    DollarSign,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    TrendingUp
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════
// ENTERPRISE LOCATION DETAIL MODAL
// Comprehensive inventory analysis with lot aggregation and warnings
// ══════════════════════════════════════════════════════════════════

interface LocationDetailModalProps {
    open: boolean;
    onClose: () => void;
    location: WarehouseLocation | null;
    onEdit?: (location: WarehouseLocation) => void;
    onViewItem?: (item: InventoryItem) => void; // Navigate to item detail
}

export function LocationDetailModal({
    open,
    onClose,
    location,
    onEdit,
    onViewItem
}: LocationDetailModalProps) {
    const { data } = useData();
    const { can } = usePermissions();
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

    // Get child locations
    const childLocations = useMemo(() => {
        if (!location) return [];
        return (data.warehouseLocations || []).filter(l => l.parentId === location.id);
    }, [location, data.warehouseLocations]);

    // Get parent location
    const parentLocation = useMemo(() => {
        if (!location || !location.parentId) return null;
        return (data.warehouseLocations || []).find(l => l.id === location.parentId);
    }, [location, data.warehouseLocations]);

    // Get comprehensive inventory summary using utility function
    const inventorySummary = useMemo(() => {
        if (!location) return null;
        return getLocationInventorySummary(location.id, location, data.enhancedLots || []);
    }, [location, data.enhancedLots]);

    // Get dye lot warnings
    const dyeLotWarnings = useMemo(() => {
        if (!location) return [];
        return checkDyeLotVariances(location.id, data.enhancedLots || []);
    }, [location, data.enhancedLots]);

    // Get recent transactions at this location
    const recentTransactions = useMemo(() => {
        if (!location) return [];
        return (data.inventoryTransactions || [])
            .filter(t => t.locationId === location.id || t.toLocationId === location.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);
    }, [location, data.inventoryTransactions]);

    // Get transfers involving this location
    const activeTransfers = useMemo(() => {
        if (!location) return [];
        return (data.stockTransfers || [])
            .filter(t =>
                (t.fromLocationId === location.id || t.toLocationId === location.id) &&
                ['pending', 'approved', 'picking', 'in_transit'].includes(t.status)
            );
    }, [location, data.stockTransfers]);

    // Get location type icon
    const getLocationIcon = (type: string) => {
        switch (type) {
            case 'warehouse':
            case 'zone':
            case 'aisle':
            case 'bay':
                return <Box className="w-5 h-5" />;
            case 'truck':
                return <Truck className="w-5 h-5" />;
            case 'jobsite':
                return <Home className="w-5 h-5" />;
            case 'staging':
                return <Layers className="w-5 h-5" />;
            case 'damage_hold':
                return <AlertTriangle className="w-5 h-5" />;
            default:
                return <MapPin className="w-5 h-5" />;
        }
    };

    // Location type color
    const getLocationColor = (type: string) => {
        switch (type) {
            case 'warehouse':
            case 'zone':
            case 'aisle':
            case 'bay':
                return 'bg-primary/10 text-primary';
            case 'truck':
                return 'bg-blue-500/10 text-blue-600';
            case 'jobsite':
                return 'bg-green-500/10 text-green-600';
            case 'staging':
                return 'bg-purple-500/10 text-purple-600';
            case 'damage_hold':
                return 'bg-red-500/10 text-red-600';
            default:
                return 'bg-muted text-muted-foreground';
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

    const toggleItemExpanded = (itemId: number) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedItems(newExpanded);
    };

    const handleViewItem = (itemId: number) => {
        if (!onViewItem) return;
        const item = data.inventory.find(i => i.id === itemId);
        if (item) {
            onClose();
            onViewItem(item);
        }
    };

    if (!location) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2.5 rounded-xl", getLocationColor(location.type))}>
                                {getLocationIcon(location.type)}
                            </div>
                            <div>
                                <DialogTitle className="text-xl">{location.name}</DialogTitle>
                                <DialogDescription className="flex items-center gap-2 mt-1">
                                    <code className="text-xs bg-muted px-2 py-0.5 rounded">{location.code}</code>
                                    <span>•</span>
                                    <Badge variant="outline" className="text-xs">
                                        {location.type.replace('_', ' ')}
                                    </Badge>
                                    {location.isActive ? (
                                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30 text-xs">
                                            Inactive
                                        </Badge>
                                    )}
                                </DialogDescription>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto -mx-6 px-6">
                    <Tabs defaultValue="inventory" className="space-y-6">
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="inventory" className="gap-1.5">
                                <Package className="w-4 h-4" />
                                Inventory ({inventorySummary?.uniqueItems || 0})
                            </TabsTrigger>
                            <TabsTrigger value="activity" className="gap-1.5">
                                <History className="w-4 h-4" />
                                Activity
                            </TabsTrigger>
                            <TabsTrigger value="details" className="gap-1.5">
                                <Settings className="w-4 h-4" />
                                Details
                            </TabsTrigger>
                        </TabsList>

                        {/* INVENTORY TAB */}
                        <TabsContent value="inventory" className="space-y-6">
                            {/* Location Hierarchy */}
                            {parentLocation && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span>Located in:</span>
                                    <Badge variant="secondary" className="font-mono">
                                        {parentLocation.code} - {parentLocation.name}
                                    </Badge>
                                </div>
                            )}

                            {/* Inventory Summary Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="pt-4 pb-3">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">Unique Items</span>
                                        </div>
                                        <div className="text-2xl font-bold mt-1">{inventorySummary?.uniqueItems || 0}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-4 pb-3">
                                        <div className="flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">Total Units</span>
                                        </div>
                                        <div className="text-2xl font-bold mt-1">{inventorySummary?.totalUnits.toLocaleString() || 0}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-4 pb-3">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-green-600" />
                                            <span className="text-sm text-muted-foreground">Total Value</span>
                                        </div>
                                        <div className="text-2xl font-bold mt-1 text-green-600">
                                            ${inventorySummary?.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className={cn(dyeLotWarnings.length > 0 && "border-yellow-500/30 bg-yellow-500/5")}>
                                    <CardContent className="pt-4 pb-3">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className={cn("w-4 h-4", dyeLotWarnings.length > 0 ? "text-yellow-600" : "text-muted-foreground")} />
                                            <span className="text-sm text-muted-foreground">Dye Lot Issues</span>
                                        </div>
                                        <div className={cn("text-2xl font-bold mt-1", dyeLotWarnings.length > 0 && "text-yellow-600")}>
                                            {dyeLotWarnings.length}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Capacity Bar */}
                            {location.capacity && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Capacity Utilization</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-muted-foreground">Used</span>
                                            <span>{location.currentUtilization || 0}% of {location.capacity.toLocaleString()} units</span>
                                        </div>
                                        <Progress
                                            value={location.currentUtilization || 0}
                                            className={cn("h-2", location.currentUtilization && location.currentUtilization > 80 && "[&>div]:bg-yellow-500")}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {/* Dye Lot Warnings */}
                            {dyeLotWarnings.length > 0 && (
                                <Card className="border-yellow-500/30 bg-yellow-500/5">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-yellow-600">
                                            <AlertTriangle className="w-4 h-4" />
                                            Dye Lot Variance Warnings
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {dyeLotWarnings.map((warning, idx) => (
                                            <div key={idx} className="p-3 rounded-lg border border-yellow-500/30 bg-background">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="font-medium">{warning.itemName}</div>
                                                        <div className="text-sm text-muted-foreground mt-0.5">{warning.message}</div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {warning.dyeLots.map((dyeLot, i) => (
                                                                <Badge key={i} variant="outline" className="text-xs font-mono">
                                                                    {dyeLot}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant={warning.severity === 'critical' ? 'destructive' : 'secondary'}
                                                        className="text-xs"
                                                    >
                                                        {warning.severity}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Inventory Items Table */}
                            {inventorySummary && inventorySummary.items.length > 0 ? (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Package className="w-4 h-4" />
                                            Inventory at This Location
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-1">
                                            {inventorySummary.items.map((item) => {
                                                const isExpanded = expandedItems.has(item.itemId);
                                                return (
                                                    <div key={item.itemId} className="border rounded-lg">
                                                        {/* Item Summary Row */}
                                                        <div className={cn(
                                                            "p-3 hover:bg-muted/30 transition-colors",
                                                            item.hasDyeLotVariance && "bg-yellow-500/5"
                                                        )}>
                                                            <div className="flex items-center justify-between gap-3">
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 w-6 p-0"
                                                                        onClick={() => toggleItemExpanded(item.itemId)}
                                                                    >
                                                                        {isExpanded ? (
                                                                            <ChevronDown className="w-4 h-4" />
                                                                        ) : (
                                                                            <ChevronRight className="w-4 h-4" />
                                                                        )}
                                                                    </Button>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-medium">{item.itemName}</span>
                                                                            {item.hasDyeLotVariance && (
                                                                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30 text-xs gap-1">
                                                                                    <AlertTriangle className="w-3 h-3" />
                                                                                    {item.dyeLots.length} Dye Lots
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{item.sku}</code>
                                                                            <span className="mx-2">•</span>
                                                                            <span>{item.lotCount} lot{item.lotCount > 1 ? 's' : ''}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="text-right">
                                                                        <div className="text-lg font-bold">{item.totalQuantity.toLocaleString()}</div>
                                                                        <div className="text-xs text-muted-foreground">{item.unit}</div>
                                                                    </div>
                                                                    <div className="text-right min-w-[80px]">
                                                                        <div className="text-sm font-medium text-green-600">
                                                                            ${item.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                        </div>
                                                                    </div>
                                                                    {onViewItem && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="gap-1"
                                                                            onClick={() => handleViewItem(item.itemId)}
                                                                        >
                                                                            <ExternalLink className="w-4 h-4" />
                                                                            View
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Expanded Lot Details */}
                                                        {isExpanded && (
                                                            <div className="border-t bg-muted/20 p-3 space-y-2">
                                                                {item.lots.map((lot) => {
                                                                    const locQty = lot.locations.find(l => l.locationId === location.id);
                                                                    return (
                                                                        <div key={lot.id} className="flex items-center justify-between text-sm p-2 rounded bg-background">
                                                                            <div className="flex items-center gap-3">
                                                                                <Layers className="w-4 h-4 text-muted-foreground" />
                                                                                <div>
                                                                                    <div className="font-mono font-medium">{lot.lotNumber}</div>
                                                                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                                                        {lot.dyeLot && (
                                                                                            <>
                                                                                                <span>Dye: {lot.dyeLot}</span>
                                                                                                <span>•</span>
                                                                                            </>
                                                                                        )}
                                                                                        <span>{lot.vendorName}</span>
                                                                                        <span>•</span>
                                                                                        <span>Received {new Date(lot.receivedDate).toLocaleDateString()}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-3">
                                                                                <Badge variant="secondary" className="font-mono">
                                                                                    {locQty?.quantity.toLocaleString()} {lot.unit}
                                                                                </Badge>
                                                                                {lot.qcStatus && (
                                                                                    <Badge variant={lot.qcStatus === 'passed' ? 'default' : 'destructive'} className="text-xs">
                                                                                        QC: {lot.qcStatus}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="py-12">
                                        <div className="text-center text-muted-foreground">
                                            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>No inventory at this location</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* ACTIVITY TAB */}
                        <TabsContent value="activity" className="space-y-6">
                            {/* Active Transfers */}
                            {activeTransfers.length > 0 && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <ArrowUpDown className="w-4 h-4" />
                                            Active Transfers ({activeTransfers.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {activeTransfers.map((transfer) => (
                                            <div key={transfer.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <div className="font-medium flex items-center gap-2">
                                                            {transfer.transferNumber}
                                                            {transfer.projectName && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {transfer.projectName}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                                            <span className="font-mono">{transfer.fromLocationCode}</span>
                                                            <span>→</span>
                                                            <span className="font-mono">{transfer.toLocationCode}</span>
                                                        </div>
                                                    </div>
                                                    <Badge variant={
                                                        transfer.status === 'in_transit' ? 'default' : 'secondary'
                                                    }>
                                                        {transfer.status.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Recent Activity */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <History className="w-4 h-4" />
                                        Recent Transactions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {recentTransactions.length > 0 ? (
                                        <div className="space-y-2">
                                            {recentTransactions.map(txn => (
                                                <div key={txn.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <Badge variant="outline" className="text-xs">
                                                            {txn.type.replace('_', ' ')}
                                                        </Badge>
                                                        <span className="text-sm font-medium">{txn.itemName}</span>
                                                        <span className="text-sm text-muted-foreground">({txn.quantity} {txn.unit})</span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{formatTimeAgo(txn.timestamp)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No recent activity</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* DETAILS TAB */}
                        <TabsContent value="details" className="space-y-6">
                            {/* Location Properties */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Settings className="w-4 h-4" />
                                        Location Properties
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-2">
                                            {location.isPickable ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                                            )}
                                            <span className="text-sm">Pickable</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {location.isReceivable ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                                            )}
                                            <span className="text-sm">Receivable</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {location.isActive ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                            )}
                                            <span className="text-sm">Active</span>
                                        </div>
                                    </div>
                                    {/* Truck-specific info */}
                                    {location.type === 'truck' && (
                                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                            {location.licensePlate && (
                                                <div>
                                                    <span className="text-muted-foreground">License:</span>
                                                    <span className="ml-2 font-medium">{location.licensePlate}</span>
                                                </div>
                                            )}
                                            {location.driverName && (
                                                <div>
                                                    <span className="text-muted-foreground">Driver:</span>
                                                    <span className="ml-2 font-medium">{location.driverName}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {/* Jobsite-specific info */}
                                    {location.type === 'jobsite' && location.projectName && (
                                        <div className="mt-4 text-sm">
                                            <span className="text-muted-foreground">Project:</span>
                                            <span className="ml-2 font-medium text-primary">{location.projectName}</span>
                                            {location.address && (
                                                <div className="text-muted-foreground mt-1">{location.address}</div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Child Locations */}
                            {childLocations.length > 0 && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Sub-Locations ({childLocations.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {childLocations.map(child => (
                                                <div key={child.id} className="p-2 rounded-lg border bg-muted/30 text-sm">
                                                    <div className="font-mono font-medium">{child.code}</div>
                                                    <div className="text-xs text-muted-foreground truncate">{child.name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Notes */}
                            {location.notes && (
                                <Card>
                                    <CardContent className="pt-4">
                                        <div className="text-sm text-muted-foreground">{location.notes}</div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Action Buttons */}
                <div className="shrink-0 flex items-center justify-between gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <div className="flex items-center gap-2">
                        {can('MANAGE_LOCATIONS') && onEdit && (
                            <Button className="gap-2" onClick={() => { onEdit(location); onClose(); }}>
                                <Edit className="w-4 h-4" />
                                Edit Location
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
