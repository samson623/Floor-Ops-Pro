'use client';

import { useState } from 'react';
import { WarehouseDashboard } from '@/components/warehouse-dashboard';
import { ReceiveDeliveryModal, TransferModal, AdjustmentModal, QuickOrderModal } from '@/components/warehouse-modals';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useData } from '@/components/data-provider';
import { usePermissions } from '@/components/permission-context';
import { cn } from '@/lib/utils';
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
    FileText
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

    // Check permissions
    const canViewInventory = can('VIEW_INVENTORY');
    const canReceive = can('PERFORM_RECEIVING');
    const canTransfer = can('CREATE_TRANSFER');
    const canAdjust = can('ADJUST_INVENTORY');
    const canViewReports = can('VIEW_WAREHOUSE_REPORTS');

    // Modal states
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showAdjustModal, setShowAdjustModal] = useState(false);

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

                        {/* Quick Stats */}
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <TabsList className="bg-muted/50 p-1">
                            <TabsTrigger value="dashboard" className="gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Dashboard
                            </TabsTrigger>
                            <TabsTrigger value="inventory" className="gap-2">
                                <Boxes className="w-4 h-4" />
                                Inventory
                            </TabsTrigger>
                            <TabsTrigger value="locations" className="gap-2">
                                <MapPin className="w-4 h-4" />
                                Locations
                            </TabsTrigger>
                            <TabsTrigger value="transfers" className="gap-2">
                                <ArrowUpDown className="w-4 h-4" />
                                Transfers
                            </TabsTrigger>
                            <TabsTrigger value="lots" className="gap-2">
                                <Layers className="w-4 h-4" />
                                Lots
                            </TabsTrigger>
                            {canViewReports && (
                                <TabsTrigger value="reports" className="gap-2">
                                    <FileText className="w-4 h-4" />
                                    Reports
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
                                        <Button size="sm">
                                            <Package className="w-4 h-4 mr-2" />
                                            Add Item
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Inventory Table */}
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th className="text-left p-3 font-medium">Item</th>
                                                    <th className="text-left p-3 font-medium">SKU</th>
                                                    <th className="text-right p-3 font-medium">Stock</th>
                                                    <th className="text-right p-3 font-medium">Reserved</th>
                                                    <th className="text-right p-3 font-medium">Available</th>
                                                    <th className="text-center p-3 font-medium">Status</th>
                                                    <th className="text-right p-3 font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.inventory.map((item) => {
                                                    const available = item.stock - item.reserved;
                                                    const isLowStock = available < 5;
                                                    return (
                                                        <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                                                            <td className="p-3">
                                                                <div className="font-medium">{item.name}</div>
                                                            </td>
                                                            <td className="p-3">
                                                                <code className="text-xs bg-muted px-2 py-1 rounded">{item.sku}</code>
                                                            </td>
                                                            <td className="p-3 text-right font-medium">{item.stock}</td>
                                                            <td className="p-3 text-right text-muted-foreground">{item.reserved}</td>
                                                            <td className={cn("p-3 text-right font-medium", isLowStock && "text-yellow-600")}>
                                                                {available}
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                {isLowStock ? (
                                                                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                                                                        Low Stock
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                                                                        In Stock
                                                                    </Badge>
                                                                )}
                                                            </td>
                                                            <td className="p-3 text-right">
                                                                <Button variant="ghost" size="sm">View</Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
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
                                        <div key={location.id} className={cn(
                                            "p-4 rounded-lg border transition-colors hover:bg-muted/30",
                                            location.type === 'warehouse' && "border-primary/50 bg-primary/5",
                                            location.type === 'truck' && "border-blue-500/50 bg-blue-500/5",
                                            location.type === 'jobsite' && "border-green-500/50 bg-green-500/5",
                                            location.type === 'damage_hold' && "border-red-500/50 bg-red-500/5"
                                        )}>
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
                                            <div key={transfer.id} className="p-4 rounded-lg border hover:bg-muted/30 transition-colors">
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
                                            <div key={lot.id} className={cn(
                                                "p-4 rounded-lg border transition-colors",
                                                lot.status === 'damaged' && "border-red-500/50 bg-red-500/5",
                                                lot.qcStatus === 'failed' && "border-orange-500/50 bg-orange-500/5"
                                            )}>
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
                                            { title: 'Inventory Valuation', icon: BarChart3, desc: 'Total inventory value by category' },
                                            { title: 'Stock Movement', icon: ArrowUpDown, desc: 'History of all inventory transactions' },
                                            { title: 'Turnover Analysis', icon: RefreshCcw, desc: 'Inventory turnover rates by item' },
                                            { title: 'ABC Analysis', icon: Layers, desc: 'Item classification by value/volume' },
                                            { title: 'Lot Traceability', icon: History, desc: 'Complete lot history and lineage' },
                                            { title: 'Cycle Count Accuracy', icon: ClipboardCheck, desc: 'Count accuracy and variance trends' }
                                        ].map((report, idx) => (
                                            <div key={idx} className="p-4 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors">
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
        </div>
    );
}
