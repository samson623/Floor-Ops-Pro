'use client';

import { useState } from 'react';
import { useSmartBack } from '@/hooks/use-smart-back';
import { ResponsiveDataView, MobileFilterBar } from '@/components/responsive-data-view';
import { WarehouseDashboard } from '@/components/warehouse-dashboard';
import { ReceiveDeliveryModal, TransferModal, AdjustmentModal, QuickOrderModal, AddInventoryItemModal } from '@/components/warehouse-modals';
import { InventoryDetailModal } from '@/components/warehouse-inventory-detail-modal';
import { LocationDetailModal } from '@/components/warehouse-location-detail-modal';
import { TransferDetailModal } from '@/components/warehouse-transfer-detail-modal';
import { LotDetailModal } from '@/components/warehouse-lot-detail-modal';
import { TransactionHistoryModal } from '@/components/warehouse-transaction-history-modal';
import { WarehouseReportModal } from '@/components/warehouse-report-modal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useData } from '@/components/data-provider';
import { usePermissions } from '@/components/permission-context';
import { cn } from '@/lib/utils';
import type { InventoryItem } from '@/lib/data';
import type { WarehouseLocation, StockTransfer, EnhancedMaterialLot } from '@/lib/warehouse-types';
import {
    Package,
    ArrowUpDown,
    MapPin,
    History,
    BarChart3,
    Search,
    Filter,
    Truck,
    ClipboardCheck,
    Boxes,
    Home,
    AlertTriangle,
    CheckCircle2,
    Clock,
    RefreshCcw,
    Layers,
    FileText,
    Eye
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════
// WAREHOUSE MANAGEMENT PAGE
// Central hub for all warehouse operations
// ══════════════════════════════════════════════════════════════════

export default function WarehousePage() {
    const { data } = useData();
    const { can } = usePermissions();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');

    // Record this page in navigation history for smart back navigation
    useSmartBack({ title: 'Warehouse' });

    // Check permissions
    const canViewInventory = can('VIEW_INVENTORY');
    const canAddInventory = can('ADD_INVENTORY');
    const canReceive = can('PERFORM_RECEIVING');
    const canTransfer = can('CREATE_TRANSFER');
    const canAdjust = can('ADJUST_INVENTORY');
    const canViewReports = can('VIEW_WAREHOUSE_REPORTS');

    // Modal states
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [showAddItemModal, setShowAddItemModal] = useState(false);

    // Detail modal states
    const [showInventoryDetail, setShowInventoryDetail] = useState(false);
    const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
    const [showLocationDetail, setShowLocationDetail] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<WarehouseLocation | null>(null);
    const [showTransferDetail, setShowTransferDetail] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState<StockTransfer | null>(null);
    const [showLotDetail, setShowLotDetail] = useState(false);
    const [selectedLot, setSelectedLot] = useState<EnhancedMaterialLot | null>(null);
    const [showTransactionHistory, setShowTransactionHistory] = useState(false);

    // Report modal state
    type ReportType = 'inventory-valuation' | 'stock-movement' | 'turnover' | 'abc' | 'lot-trace' | 'cycle-count';
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null);

    // Get location stats
    const locations = data.warehouseLocations || [];
    const warehouseCount = locations.filter(l => l.type === 'warehouse').length;
    const truckCount = locations.filter(l => l.type === 'truck').length;
    const jobsiteCount = locations.filter(l => l.type === 'jobsite').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/10">
                                <Package className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Warehouse Management</h1>
                                <p className="text-sm text-muted-foreground">
                                    Real-time inventory tracking & operations
                                </p>
                            </div>
                        </div>

                        {/* Quick Stats + Reset Button */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{warehouseCount}</span>
                                <span className="text-muted-foreground">Warehouse</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Truck className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{truckCount}</span>
                                <span className="text-muted-foreground">Trucks</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Home className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{jobsiteCount}</span>
                                <span className="text-muted-foreground">Jobsites</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    // Clear warehouse-related data from localStorage to force reload mock data
                                    const stored = localStorage.getItem('floorops-pro-data');
                                    if (stored) {
                                        const parsed = JSON.parse(stored);
                                        // Clear warehouse data to force mock data reload
                                        delete parsed.warehouseLocations;
                                        delete parsed.inventoryTransactions;
                                        delete parsed.stockReservations;
                                        delete parsed.stockTransfers;
                                        delete parsed.enhancedLots;
                                        delete parsed.cycleCounts;
                                        delete parsed.reorderSuggestions;
                                        // Also clear inventory to restore full mock data
                                        delete parsed.inventory;
                                        localStorage.setItem('floorops-pro-data', JSON.stringify(parsed));
                                        window.location.reload();
                                    }
                                }}
                                className="gap-1 text-xs"
                            >
                                <RefreshCcw className="w-3 h-3" />
                                Reset Demo
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <TabsList className="bg-muted/50 p-1.5 overflow-x-auto flex-nowrap w-full sm:w-auto mobile-tabs">
                            <TabsTrigger value="dashboard" className="gap-2 flex-shrink-0 min-h-[44px] px-4">
                                <BarChart3 className="w-4 h-4" />
                                <span className="hidden xs:inline sm:inline">Dashboard</span>
                            </TabsTrigger>
                            <TabsTrigger value="inventory" className="gap-2 flex-shrink-0 min-h-[44px] px-4">
                                <Boxes className="w-4 h-4" />
                                <span className="hidden xs:inline sm:inline">Inventory</span>
                            </TabsTrigger>
                            <TabsTrigger value="locations" className="gap-2 flex-shrink-0 min-h-[44px] px-4">
                                <MapPin className="w-4 h-4" />
                                <span className="hidden xs:inline sm:inline">Locations</span>
                            </TabsTrigger>
                            <TabsTrigger value="transfers" className="gap-2 flex-shrink-0 min-h-[44px] px-4">
                                <ArrowUpDown className="w-4 h-4" />
                                <span className="hidden xs:inline sm:inline">Transfers</span>
                            </TabsTrigger>
                            <TabsTrigger value="lots" className="gap-2 flex-shrink-0 min-h-[44px] px-4">
                                <Layers className="w-4 h-4" />
                                <span className="hidden xs:inline sm:inline">Lots</span>
                            </TabsTrigger>
                            {canViewReports && (
                                <TabsTrigger value="reports" className="gap-2 flex-shrink-0 min-h-[44px] px-4">
                                    <FileText className="w-4 h-4" />
                                    <span className="hidden xs:inline sm:inline">Reports</span>
                                </TabsTrigger>
                            )}
                        </TabsList>

                        {/* Search */}
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search inventory, locations, transfers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Dashboard Tab */}
                    <TabsContent value="dashboard" className="mt-0">
                        <WarehouseDashboard
                            onReceiveClick={() => setShowReceiveModal(true)}
                            onTransferClick={() => setShowTransferModal(true)}
                            onAdjustClick={() => setShowAdjustModal(true)}
                            onViewTransactions={() => setActiveTab('inventory')}
                        />
                    </TabsContent>

                    {/* Inventory Tab */}
                    <TabsContent value="inventory" className="mt-0">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Boxes className="w-5 h-5" />
                                            Inventory Browser
                                        </CardTitle>
                                        <CardDescription>View and manage all inventory items with multi-location tracking</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            <Filter className="w-4 h-4 mr-2" />
                                            Filter
                                        </Button>
                                        {canAddInventory && (
                                            <Button size="sm" onClick={() => setShowAddItemModal(true)}>
                                                <Package className="w-4 h-4 mr-2" />
                                                Add Item
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Inventory Table */}
                                    {/* Inventory Table - Responsive */}
                                    <ResponsiveDataView
                                        data={data.inventory}
                                        keyField="id"
                                        titleField="name"
                                        subtitleField="sku"
                                        columns={[
                                            {
                                                key: 'name',
                                                header: 'Item',
                                                width: 'w-1/4'
                                            },
                                            {
                                                key: 'sku',
                                                header: 'SKU',
                                                render: (item) => (
                                                    <code className="text-xs bg-muted px-2 py-1 rounded">{item.sku}</code>
                                                )
                                            },
                                            {
                                                key: 'locations',
                                                header: 'Location',
                                                width: 'w-1/3',
                                                render: (item) => {
                                                    // Get locations for this item from enhanced lots
                                                    const itemLots = (data.enhancedLots || []).filter(l => l.itemId === item.id);
                                                    const locationMap = new Map<string, { code: string; quantity: number }>();
                                                    itemLots.forEach(lot => {
                                                        (lot.locations || []).forEach(loc => {
                                                            const existing = locationMap.get(loc.locationCode);
                                                            if (existing) {
                                                                existing.quantity += loc.quantity;
                                                            } else {
                                                                locationMap.set(loc.locationCode, {
                                                                    code: loc.locationCode,
                                                                    quantity: loc.quantity
                                                                });
                                                            }
                                                        });
                                                    });
                                                    const itemLocations = Array.from(locationMap.values());

                                                    return itemLocations.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {itemLocations.slice(0, 3).map((loc, idx) => (
                                                                <Badge
                                                                    key={idx}
                                                                    variant="secondary"
                                                                    className="text-xs font-mono"
                                                                >
                                                                    <MapPin className="w-3 h-3 mr-1" />
                                                                    {loc.code}: {loc.quantity}
                                                                </Badge>
                                                            ))}
                                                            {itemLocations.length > 3 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{itemLocations.length - 3} more
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            Not tracked
                                                        </span>
                                                    );
                                                }
                                            },
                                            {
                                                key: 'stock',
                                                header: 'Stock',
                                                align: 'right'
                                            },
                                            {
                                                key: 'reserved',
                                                header: 'Reserved',
                                                align: 'right'
                                            },
                                            {
                                                key: 'available',
                                                header: 'Available',
                                                align: 'right',
                                                render: (item) => {
                                                    const available = item.stock - item.reserved;
                                                    const isLowStock = available < 5;
                                                    return (
                                                        <span className={cn("font-medium", isLowStock && "text-yellow-600")}>
                                                            {available}
                                                        </span>
                                                    );
                                                }
                                            },
                                            {
                                                key: 'status',
                                                header: 'Status',
                                                align: 'center',
                                                asBadge: true,
                                                render: (item) => {
                                                    const available = item.stock - item.reserved;
                                                    return available < 5 ? (
                                                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                                                            Low Stock
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                                                            In Stock
                                                        </Badge>
                                                    );
                                                }
                                            }
                                        ]}
                                        onItemClick={(item) => {
                                            setSelectedInventoryItem(item);
                                            setShowInventoryDetail(true);
                                        }}
                                        actions={(item) => (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="gap-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedInventoryItem(item);
                                                    setShowInventoryDetail(true);
                                                }}
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </Button>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Locations Tab */}
                    <TabsContent value="locations" className="mt-0">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <MapPin className="w-5 h-5" />
                                            Location Hierarchy
                                        </CardTitle>
                                        <CardDescription>Warehouse zones, aisles, bays, trucks, and jobsites</CardDescription>
                                    </div>
                                    <Button size="sm">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        Add Location
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {locations.map((location) => (
                                        <div
                                            key={location.id}
                                            className={cn(
                                                "p-4 rounded-lg border transition-colors hover:bg-muted/30 cursor-pointer",
                                                location.type === 'warehouse' && "border-primary/50 bg-primary/5",
                                                location.type === 'truck' && "border-blue-500/50 bg-blue-500/5",
                                                location.type === 'jobsite' && "border-green-500/50 bg-green-500/5",
                                                location.type === 'damage_hold' && "border-red-500/50 bg-red-500/5"
                                            )}
                                            onClick={() => {
                                                setSelectedLocation(location);
                                                setShowLocationDetail(true);
                                            }}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="font-medium">{location.name}</div>
                                                    <div className="text-sm text-muted-foreground font-mono">{location.code}</div>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {location.type.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            {location.capacity && (
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-muted-foreground">Capacity</span>
                                                        <span>{location.currentUtilization || 0}%</span>
                                                    </div>
                                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full transition-all",
                                                                (location.currentUtilization || 0) > 80 ? "bg-yellow-500" : "bg-primary"
                                                            )}
                                                            style={{ width: `${location.currentUtilization || 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {location.projectName && (
                                                <div className="mt-2 text-sm text-primary">{location.projectName}</div>
                                            )}
                                            {location.driverName && (
                                                <div className="mt-2 text-sm text-muted-foreground">
                                                    Driver: {location.driverName}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Transfers Tab */}
                    <TabsContent value="transfers" className="mt-0">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <ArrowUpDown className="w-5 h-5" />
                                            Stock Transfers
                                        </CardTitle>
                                        <CardDescription>Manage material movement between locations</CardDescription>
                                    </div>
                                    <Button size="sm" onClick={() => setShowTransferModal(true)}>
                                        <ArrowUpDown className="w-4 h-4 mr-2" />
                                        New Transfer
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {(data.stockTransfers || []).length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <ArrowUpDown className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No transfers found</p>
                                            <Button variant="outline" className="mt-4" onClick={() => setShowTransferModal(true)}>
                                                Create First Transfer
                                            </Button>
                                        </div>
                                    ) : (
                                        (data.stockTransfers || []).map((transfer) => (
                                            <div
                                                key={transfer.id}
                                                className="p-4 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer"
                                                onClick={() => {
                                                    setSelectedTransfer(transfer);
                                                    setShowTransferDetail(true);
                                                }}
                                            >
                                                <div className="flex items-start justify-between">
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
                                                        transfer.status === 'received' ? 'default' :
                                                            transfer.status === 'in_transit' ? 'secondary' :
                                                                'outline'
                                                    }>
                                                        {transfer.status === 'received' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                                        {transfer.status === 'in_transit' && <Truck className="w-3 h-3 mr-1" />}
                                                        {transfer.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                                        {transfer.status.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        {transfer.totalItems} item{transfer.totalItems > 1 ? 's' : ''} • {transfer.totalQuantity} units
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        Created {new Date(transfer.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Lots Tab */}
                    <TabsContent value="lots" className="mt-0">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Layers className="w-5 h-5" />
                                            Lot / Dye Batch Tracking
                                        </CardTitle>
                                        <CardDescription>Track material lots for quality and traceability</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {(data.enhancedLots || []).length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No lots tracked yet</p>
                                        </div>
                                    ) : (
                                        (data.enhancedLots || []).map((lot) => (
                                            <div
                                                key={lot.id}
                                                className={cn(
                                                    "p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/30",
                                                    lot.status === 'damaged' && "border-red-500/50 bg-red-500/5",
                                                    lot.qcStatus === 'failed' && "border-orange-500/50 bg-orange-500/5"
                                                )}
                                                onClick={() => {
                                                    setSelectedLot(lot);
                                                    setShowLotDetail(true);
                                                }}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="font-medium">{lot.itemName}</div>
                                                        <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                                                            <span>Lot: <span className="font-mono">{lot.lotNumber}</span></span>
                                                            {lot.dyeLot && (
                                                                <span>Dye: <span className="font-mono">{lot.dyeLot}</span></span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {lot.qcStatus && (
                                                            <Badge variant={lot.qcStatus === 'passed' ? 'default' : 'destructive'}>
                                                                QC: {lot.qcStatus}
                                                            </Badge>
                                                        )}
                                                        <Badge variant="outline">{lot.status}</Badge>
                                                    </div>
                                                </div>
                                                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <div className="text-muted-foreground">Original Qty</div>
                                                        <div className="font-medium">{lot.originalQuantity} {lot.unit}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted-foreground">Current Qty</div>
                                                        <div className="font-medium">{lot.currentQuantity} {lot.unit}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted-foreground">Vendor</div>
                                                        <div className="font-medium">{lot.vendorName}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-muted-foreground">Received</div>
                                                        <div className="font-medium">{new Date(lot.receivedDate).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                {lot.locations && lot.locations.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {lot.locations.map((loc, idx) => (
                                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                                {loc.locationCode}: {loc.quantity} {lot.unit}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                {lot.allocations && lot.allocations.length > 0 && (
                                                    <div className="mt-2 text-sm text-primary">
                                                        Allocated to: {lot.allocations.map(a => a.projectName).join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Reports Tab */}
                    {canViewReports && (
                        <TabsContent value="reports" className="mt-0">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Warehouse Reports
                                    </CardTitle>
                                    <CardDescription>Analytics and operational reports</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[
                                            { title: 'Inventory Valuation', icon: BarChart3, desc: 'Total inventory value by category', key: 'inventory-valuation' as ReportType },
                                            { title: 'Stock Movement', icon: ArrowUpDown, desc: 'History of all inventory transactions', key: 'stock-movement' as ReportType },
                                            { title: 'Turnover Analysis', icon: RefreshCcw, desc: 'Inventory turnover rates by item', key: 'turnover' as ReportType },
                                            { title: 'ABC Analysis', icon: Layers, desc: 'Item classification by value/volume', key: 'abc' as ReportType },
                                            { title: 'Lot Traceability', icon: History, desc: 'Complete lot history and lineage', key: 'lot-trace' as ReportType },
                                            { title: 'Cycle Count Accuracy', icon: ClipboardCheck, desc: 'Count accuracy and variance trends', key: 'cycle-count' as ReportType }
                                        ].map((report, idx) => (
                                            <div
                                                key={idx}
                                                className="p-4 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors hover:border-primary/50"
                                                onClick={() => {
                                                    setSelectedReportType(report.key);
                                                    setShowReportModal(true);
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-primary/10">
                                                        <report.icon className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{report.title}</div>
                                                        <div className="text-sm text-muted-foreground">{report.desc}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>

            {/* Warehouse Operation Modals */}
            <ReceiveDeliveryModal
                open={showReceiveModal}
                onClose={() => setShowReceiveModal(false)}
            />
            <TransferModal
                open={showTransferModal}
                onClose={() => setShowTransferModal(false)}
            />
            <AdjustmentModal
                open={showAdjustModal}
                onClose={() => setShowAdjustModal(false)}
            />

            {/* Detail View Modals */}
            <InventoryDetailModal
                open={showInventoryDetail}
                onClose={() => { setShowInventoryDetail(false); setSelectedInventoryItem(null); }}
                item={selectedInventoryItem}
                onAdjust={(item) => {
                    setSelectedInventoryItem(item);
                    setShowInventoryDetail(false);
                    setShowAdjustModal(true);
                }}
                onTransfer={(item) => {
                    setShowInventoryDetail(false);
                    setShowTransferModal(true);
                }}
            />
            <LocationDetailModal
                open={showLocationDetail}
                onClose={() => { setShowLocationDetail(false); setSelectedLocation(null); }}
                location={selectedLocation}
                onViewItem={(item) => {
                    setSelectedInventoryItem(item);
                    setShowInventoryDetail(true);
                }}
            />
            <TransferDetailModal
                open={showTransferDetail}
                onClose={() => { setShowTransferDetail(false); setSelectedTransfer(null); }}
                transfer={selectedTransfer}
            />
            <LotDetailModal
                open={showLotDetail}
                onClose={() => { setShowLotDetail(false); setSelectedLot(null); }}
                lot={selectedLot}
            />
            <TransactionHistoryModal
                open={showTransactionHistory}
                onClose={() => setShowTransactionHistory(false)}
            />
            <AddInventoryItemModal
                open={showAddItemModal}
                onClose={() => setShowAddItemModal(false)}
            />
            <WarehouseReportModal
                open={showReportModal}
                onClose={() => { setShowReportModal(false); setSelectedReportType(null); }}
                reportType={selectedReportType}
            />
        </div>
    );
}
