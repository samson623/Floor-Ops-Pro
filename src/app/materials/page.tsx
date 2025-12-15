'use client';

import { useState, useMemo, useEffect } from 'react';
import { TopBar } from '@/components/top-bar';
import { useData } from '@/components/data-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
    Plus, Search, Package, Truck, FileText, Timer, AlertTriangle,
    CheckCircle2, Clock, XCircle, Calendar, Store, Thermometer, Droplets,
    Camera, ChevronRight, MoreVertical, Eye, Edit, ClipboardCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PurchaseOrderModal } from '@/components/purchase-order-modal';
import { DeliveryCheckInModal } from '@/components/delivery-checkin-modal';
import { AcclimationModal } from '@/components/acclimation-modal';
import { POStatus, DeliveryStatus, AcclimationStatus } from '@/lib/data';

// Status badge configs
const poStatusConfig: Record<POStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: React.ReactNode }> = {
    draft: { label: 'Draft', variant: 'secondary', icon: <FileText className="w-3 h-3" /> },
    submitted: { label: 'Submitted', variant: 'outline', icon: <Clock className="w-3 h-3" /> },
    confirmed: { label: 'Confirmed', variant: 'default', icon: <CheckCircle2 className="w-3 h-3" /> },
    partial: { label: 'Partial', variant: 'secondary', icon: <AlertTriangle className="w-3 h-3" /> },
    received: { label: 'Received', variant: 'default', icon: <CheckCircle2 className="w-3 h-3" /> },
    cancelled: { label: 'Cancelled', variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
};

const deliveryStatusConfig: Record<DeliveryStatus, { label: string; color: string; icon: React.ReactNode }> = {
    scheduled: { label: 'Scheduled', color: 'bg-blue-500/20 text-blue-600', icon: <Calendar className="w-3 h-3" /> },
    'in-transit': { label: 'In Transit', color: 'bg-yellow-500/20 text-yellow-600', icon: <Truck className="w-3 h-3" /> },
    arrived: { label: 'Arrived', color: 'bg-green-500/20 text-green-600', icon: <Package className="w-3 h-3" /> },
    'checked-in': { label: 'Checked In', color: 'bg-emerald-500/20 text-emerald-600', icon: <CheckCircle2 className="w-3 h-3" /> },
    issues: { label: 'Issues', color: 'bg-red-500/20 text-red-600', icon: <AlertTriangle className="w-3 h-3" /> },
};

const acclimationStatusConfig: Record<AcclimationStatus, { label: string; color: string; icon: string }> = {
    'not-started': { label: 'Not Started', color: 'bg-gray-500/20 text-gray-600', icon: '⏸️' },
    'in-progress': { label: 'In Progress', color: 'bg-yellow-500/20 text-yellow-600', icon: '⏳' },
    ready: { label: 'Ready', color: 'bg-green-500/20 text-green-600', icon: '✅' },
    expired: { label: 'Expired', color: 'bg-red-500/20 text-red-600', icon: '⚠️' },
};

export default function MaterialsPage() {
    const { data, getLotWarnings, getActiveAcclimation } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('purchase-orders');
    const [showPOModal, setShowPOModal] = useState(false);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [showAcclimationModal, setShowAcclimationModal] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
    const [selectedPO, setSelectedPO] = useState<string | null>(null);
    const [, setTick] = useState(0);

    // Force re-render every minute to update timers
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 60000);
        return () => clearInterval(interval);
    }, []);

    // Stats
    const stats = useMemo(() => {
        const pos = data.purchaseOrders || [];
        const deliveries = data.deliveries || [];
        const lotWarnings = getLotWarnings();
        const activeAcclimation = getActiveAcclimation();

        return {
            pendingPOs: pos.filter(po => po.status === 'submitted' || po.status === 'confirmed').length,
            deliveriesToday: deliveries.filter(d => {
                const today = new Date().toISOString().split('T')[0];
                return d.scheduledDate === today && (d.status === 'scheduled' || d.status === 'arrived');
            }).length,
            deliveriesNeedingCheckIn: deliveries.filter(d => d.status === 'scheduled' || d.status === 'arrived').length,
            lotWarningsCount: lotWarnings.length,
            materialsAcclimating: activeAcclimation.length,
        };
    }, [data.purchaseOrders, data.deliveries, getLotWarnings, getActiveAcclimation]);

    // Group POs by vendor
    const posByVendor = useMemo(() => {
        const pos = data.purchaseOrders || [];
        const grouped: Record<string, typeof pos> = {};
        pos.forEach(po => {
            if (!grouped[po.vendorName]) grouped[po.vendorName] = [];
            grouped[po.vendorName].push(po);
        });
        return grouped;
    }, [data.purchaseOrders]);

    // Calculate acclimation progress
    const getAcclimationProgress = (entry: typeof data.acclimationEntries[0]) => {
        const start = new Date(entry.startTime).getTime();
        const now = Date.now();
        const elapsed = (now - start) / (1000 * 60 * 60); // hours
        const progress = Math.min(100, (elapsed / entry.requiredHours) * 100);
        const remaining = Math.max(0, entry.requiredHours - elapsed);
        return { progress, remaining, elapsed };
    };

    return (
        <>
            <TopBar
                title="Materials Management"
                breadcrumb="Operations"
                showNewProject={false}
            >
                <Button onClick={() => setShowPOModal(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New PO
                </Button>
            </TopBar>

            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('purchase-orders')}>
                        <CardContent className="pt-4 pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold">{stats.pendingPOs}</p>
                                    <p className="text-xs text-muted-foreground">Pending POs</p>
                                </div>
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <FileText className="w-5 h-5 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('deliveries')}>
                        <CardContent className="pt-4 pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold">{stats.deliveriesToday}</p>
                                    <p className="text-xs text-muted-foreground">Deliveries Today</p>
                                </div>
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <Truck className="w-5 h-5 text-blue-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('deliveries')}>
                        <CardContent className="pt-4 pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold">{stats.deliveriesNeedingCheckIn}</p>
                                    <p className="text-xs text-muted-foreground">Need Check-In</p>
                                </div>
                                <div className="p-2 rounded-lg bg-yellow-500/10">
                                    <ClipboardCheck className="w-5 h-5 text-yellow-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('lots')}>
                        <CardContent className="pt-4 pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold">{stats.lotWarningsCount}</p>
                                    <p className="text-xs text-muted-foreground">Lot Warnings</p>
                                </div>
                                <div className={cn("p-2 rounded-lg", stats.lotWarningsCount > 0 ? "bg-red-500/10" : "bg-green-500/10")}>
                                    <AlertTriangle className={cn("w-5 h-5", stats.lotWarningsCount > 0 ? "text-red-500" : "text-green-500")} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('acclimation')}>
                        <CardContent className="pt-4 pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold">{stats.materialsAcclimating}</p>
                                    <p className="text-xs text-muted-foreground">Acclimating</p>
                                </div>
                                <div className="p-2 rounded-lg bg-orange-500/10">
                                    <Timer className="w-5 h-5 text-orange-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search materials, vendors, POs..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
                        <TabsTrigger value="purchase-orders" className="gap-2">
                            <FileText className="w-4 h-4 hidden sm:block" />
                            POs
                            {stats.pendingPOs > 0 && <Badge variant="secondary" className="ml-1">{stats.pendingPOs}</Badge>}
                        </TabsTrigger>
                        <TabsTrigger value="deliveries" className="gap-2">
                            <Truck className="w-4 h-4 hidden sm:block" />
                            Deliveries
                            {stats.deliveriesNeedingCheckIn > 0 && <Badge variant="secondary" className="ml-1">{stats.deliveriesNeedingCheckIn}</Badge>}
                        </TabsTrigger>
                        <TabsTrigger value="lots" className="gap-2">
                            <Package className="w-4 h-4 hidden sm:block" />
                            Lots
                            {stats.lotWarningsCount > 0 && <Badge variant="destructive" className="ml-1">{stats.lotWarningsCount}</Badge>}
                        </TabsTrigger>
                        <TabsTrigger value="acclimation" className="gap-2">
                            <Timer className="w-4 h-4 hidden sm:block" />
                            Acclimation
                            {stats.materialsAcclimating > 0 && <Badge variant="secondary" className="ml-1">{stats.materialsAcclimating}</Badge>}
                        </TabsTrigger>
                    </TabsList>

                    {/* Purchase Orders Tab */}
                    <TabsContent value="purchase-orders" className="space-y-4">
                        {Object.entries(posByVendor).map(([vendorName, pos]) => (
                            <Card key={vendorName}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <Store className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{vendorName}</CardTitle>
                                                <CardDescription>{pos.length} purchase order{pos.length !== 1 ? 's' : ''}</CardDescription>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => {
                                            setSelectedPO(null);
                                            setShowPOModal(true);
                                        }}>
                                            <Plus className="w-4 h-4 mr-1" />
                                            New PO
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="divide-y">
                                        {pos.map(po => {
                                            const config = poStatusConfig[po.status];
                                            return (
                                                <div key={po.id} className="py-3 flex items-center justify-between hover:bg-muted/50 -mx-6 px-6 transition-colors cursor-pointer">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{po.poNumber}</span>
                                                            <Badge variant={config.variant} className="gap-1">
                                                                {config.icon}
                                                                {config.label}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {po.projectName || 'Stock Order'} • {po.lineItems.length} item{po.lineItems.length !== 1 ? 's' : ''}
                                                        </p>
                                                        {po.expectedDeliveryDate && (
                                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                                <Calendar className="w-3 h-3" />
                                                                ETA: {new Date(po.expectedDeliveryDate).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold">${po.total.toLocaleString()}</p>
                                                        <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {Object.keys(posByVendor).length === 0 && (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground mb-4">No purchase orders yet</p>
                                    <Button onClick={() => setShowPOModal(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Your First PO
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Deliveries Tab */}
                    <TabsContent value="deliveries" className="space-y-4">
                        <div className="grid gap-4">
                            {(data.deliveries || []).map(delivery => {
                                const config = deliveryStatusConfig[delivery.status];
                                const canCheckIn = delivery.status === 'scheduled' || delivery.status === 'arrived';
                                return (
                                    <Card key={delivery.id} className={cn(canCheckIn && "ring-2 ring-primary/20")}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1", config.color)}>
                                                            {config.icon}
                                                            {config.label}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground">{delivery.poNumber}</span>
                                                    </div>
                                                    <h3 className="font-semibold">{delivery.vendorName}</h3>
                                                    <p className="text-sm text-muted-foreground">{delivery.projectName || 'Stock Delivery'}</p>

                                                    <div className="flex items-center gap-4 mt-3 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                                            <span>{new Date(delivery.scheduledDate).toLocaleDateString()}</span>
                                                            {delivery.estimatedTime && <span className="text-muted-foreground">@ {delivery.estimatedTime}</span>}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Package className="w-4 h-4 text-muted-foreground" />
                                                            <span>{delivery.lineItems.length} item{delivery.lineItems.length !== 1 ? 's' : ''}</span>
                                                        </div>
                                                    </div>

                                                    {delivery.issues && (
                                                        <div className="mt-3 p-2 rounded-lg bg-red-500/10 text-red-600 text-sm">
                                                            <AlertTriangle className="w-4 h-4 inline mr-1" />
                                                            {delivery.issues}
                                                        </div>
                                                    )}

                                                    {delivery.photos && delivery.photos.length > 0 && (
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <Camera className="w-4 h-4 text-muted-foreground" />
                                                            <span className="text-sm text-muted-foreground">{delivery.photos.length} photo{delivery.photos.length !== 1 ? 's' : ''}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    {canCheckIn ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedDelivery(delivery.id);
                                                                setShowDeliveryModal(true);
                                                            }}
                                                        >
                                                            <ClipboardCheck className="w-4 h-4 mr-1" />
                                                            Check In
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" variant="outline">
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            View
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}

                            {(data.deliveries || []).length === 0 && (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">No deliveries scheduled</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    {/* Lot Tracking Tab */}
                    <TabsContent value="lots" className="space-y-4">
                        {/* Lot Warnings */}
                        {getLotWarnings().length > 0 && (
                            <Card className="border-red-500/50 bg-red-500/5">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-red-600 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5" />
                                        Lot Mismatch Warnings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {getLotWarnings().map((warning, idx) => (
                                            <div key={idx} className="p-3 rounded-lg bg-background border flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium">{warning.materialName}</p>
                                                    <p className="text-sm text-muted-foreground">{warning.projectName}</p>
                                                    <p className="text-sm text-red-600 mt-1">{warning.message}</p>
                                                </div>
                                                <Badge variant={warning.severity === 'critical' ? 'destructive' : 'secondary'}>
                                                    {warning.severity}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* All Lots */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Material Lots</CardTitle>
                                <CardDescription>Track lot and dye numbers for all materials</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="divide-y">
                                    {(data.materialLots || []).map(lot => (
                                        <div key={lot.id} className="py-3 flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{lot.materialName}</span>
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {lot.lotNumber}
                                                    </Badge>
                                                    {lot.dyeLot && (
                                                        <Badge variant="secondary" className="font-mono text-xs">
                                                            Dye: {lot.dyeLot}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {lot.quantity} {lot.unit} • {lot.vendorName}
                                                    {lot.projectName && ` • ${lot.projectName}`}
                                                </p>
                                            </div>
                                            <div className="text-right text-sm text-muted-foreground">
                                                {new Date(lot.receivedDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}

                                    {(data.materialLots || []).length === 0 && (
                                        <div className="py-8 text-center text-muted-foreground">
                                            No lots tracked yet. Lots are created when deliveries are checked in.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Acclimation Tab */}
                    <TabsContent value="acclimation" className="space-y-4">
                        <div className="flex justify-end">
                            <Button onClick={() => setShowAcclimationModal(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Start Acclimation
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {(data.acclimationEntries || []).map(entry => {
                                const { progress, remaining, elapsed } = getAcclimationProgress(entry);
                                const config = acclimationStatusConfig[entry.status];
                                const lastReading = entry.readings[entry.readings.length - 1];
                                const isReady = entry.status === 'ready' || progress >= 100;

                                return (
                                    <Card key={entry.id} className={cn(isReady && "ring-2 ring-green-500/50")}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", config.color)}>
                                                        {config.icon} {isReady ? 'Ready' : config.label}
                                                    </span>
                                                    <h3 className="font-semibold mt-2">{entry.materialName}</h3>
                                                    <p className="text-sm text-muted-foreground">{entry.projectName}</p>
                                                    <p className="text-xs text-muted-foreground">{entry.location}</p>
                                                </div>
                                                {entry.lotNumber && (
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {entry.lotNumber}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Progress</span>
                                                    <span className="font-medium">{Math.round(progress)}%</span>
                                                </div>
                                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-500",
                                                            isReady ? "bg-green-500" : progress > 50 ? "bg-yellow-500" : "bg-orange-500"
                                                        )}
                                                        style={{ width: `${Math.min(100, progress)}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>{Math.round(elapsed)}h elapsed</span>
                                                    <span>{entry.requiredHours}h required</span>
                                                </div>
                                            </div>

                                            {/* Time Remaining */}
                                            {!isReady && (
                                                <div className="mt-4 p-3 rounded-lg bg-muted/50 text-center">
                                                    <Timer className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                                                    <p className="text-2xl font-bold">
                                                        {Math.floor(remaining)}h {Math.round((remaining % 1) * 60)}m
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">remaining</p>
                                                </div>
                                            )}

                                            {/* Latest Reading */}
                                            {lastReading && (
                                                <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Thermometer className="w-4 h-4 text-red-500" />
                                                        <span>{lastReading.temperature}°F</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Droplets className="w-4 h-4 text-blue-500" />
                                                        <span>{lastReading.humidity}%</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="mt-4 flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => toast.info('Add reading coming soon')}
                                                >
                                                    <Thermometer className="w-4 h-4 mr-1" />
                                                    Add Reading
                                                </Button>
                                                {isReady && (
                                                    <Button size="sm" className="flex-1">
                                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                                        Mark Complete
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}

                            {(data.acclimationEntries || []).length === 0 && (
                                <Card className="md:col-span-2">
                                    <CardContent className="py-12 text-center">
                                        <Timer className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground mb-4">No materials currently acclimating</p>
                                        <Button onClick={() => setShowAcclimationModal(true)}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Start Acclimation
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modals */}
            <PurchaseOrderModal
                open={showPOModal}
                onOpenChange={setShowPOModal}
                poId={selectedPO}
            />

            <DeliveryCheckInModal
                open={showDeliveryModal}
                onOpenChange={setShowDeliveryModal}
                deliveryId={selectedDelivery}
            />

            <AcclimationModal
                open={showAcclimationModal}
                onOpenChange={setShowAcclimationModal}
            />
        </>
    );
}
