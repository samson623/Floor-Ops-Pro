'use client';

import { useState, useMemo } from 'react';
import {
    Project,
    MaterialDelivery
} from '@/lib/data';
import { usePermissions, PermissionGate, PriceDisplay } from '@/components/permission-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Package,
    Truck,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Calendar,
    Thermometer,
    MapPin,
    User,
    Plus,
    ChevronDown,
    ChevronRight,
    DollarSign,
    PackageCheck,
    Timer,
    Box
} from 'lucide-react';

interface MaterialsTabEnhancedProps {
    project: Project;
    onUpdate?: (updates: Partial<Project>) => void;
}

const DELIVERY_STATUS_CONFIG: Record<string, { label: string; color: string; textColor: string; icon: typeof Clock }> = {
    'pending': { label: 'Pending', color: 'bg-gray-500', textColor: 'text-gray-600', icon: Clock },
    'scheduled': { label: 'Scheduled', color: 'bg-blue-500', textColor: 'text-blue-600', icon: Calendar },
    'in-transit': { label: 'In Transit', color: 'bg-purple-500', textColor: 'text-purple-600', icon: Truck },
    'delivered': { label: 'Delivered', color: 'bg-green-500', textColor: 'text-green-600', icon: CheckCircle2 },
    'delayed': { label: 'Delayed', color: 'bg-red-500', textColor: 'text-red-600', icon: AlertTriangle },
    'partial': { label: 'Partial', color: 'bg-yellow-500', textColor: 'text-yellow-600', icon: AlertTriangle }
};

export function MaterialsTabEnhanced({ project, onUpdate }: MaterialsTabEnhancedProps) {
    const { can, canViewPricing } = usePermissions();
    const showPricing = canViewPricing();
    const [expandedDeliveries, setExpandedDeliveries] = useState<string[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const deliveries = project.materialDeliveries || [];
    const existingMaterials = project.materials || [];

    // Calculate metrics
    const metrics = useMemo(() => {
        const delivered = deliveries.filter(d => d.status === 'delivered').length;
        const pending = deliveries.filter(d => d.status === 'pending' || d.status === 'scheduled').length;
        const inTransit = deliveries.filter(d => d.status === 'in-transit').length;
        const withIssues = deliveries.filter(d => d.status === 'delayed' || d.status === 'partial').length;
        const totalCost = deliveries.reduce((sum, d) => sum + (d.cost || 0), 0);

        // Acclimation tracking
        const needingAcclimation = deliveries.filter(d => d.acclimationRequired && d.status === 'delivered');
        const acclimating = needingAcclimation.filter(d => {
            if (!d.acclimationStartDate || !d.acclimationDaysRequired) return false;
            const startDate = new Date(d.acclimationStartDate);
            const endDate = new Date(startDate.getTime() + d.acclimationDaysRequired * 24 * 60 * 60 * 1000);
            return new Date() < endDate;
        });

        return {
            delivered,
            pending,
            inTransit,
            withIssues,
            totalCost,
            acclimating: acclimating.length,
            totalDeliveries: deliveries.length
        };
    }, [deliveries]);

    // Filter deliveries
    const filteredDeliveries = useMemo(() => {
        if (filterStatus === 'all') return deliveries;
        return deliveries.filter(d => d.status === filterStatus);
    }, [deliveries, filterStatus]);

    // Calculate acclimation progress
    const getAcclimationProgress = (delivery: MaterialDelivery) => {
        if (!delivery.acclimationStartDate || !delivery.acclimationDaysRequired) return null;

        const startDate = new Date(delivery.acclimationStartDate);
        const endDate = new Date(startDate.getTime() + delivery.acclimationDaysRequired * 24 * 60 * 60 * 1000);
        const now = new Date();

        if (now >= endDate) return { progress: 100, daysRemaining: 0, status: 'complete' };
        if (now < startDate) return { progress: 0, daysRemaining: delivery.acclimationDaysRequired, status: 'not-started' };

        const totalMs = endDate.getTime() - startDate.getTime();
        const elapsedMs = now.getTime() - startDate.getTime();
        const progress = Math.round((elapsedMs / totalMs) * 100);
        const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

        return { progress, daysRemaining, status: 'in-progress' };
    };

    const toggleDelivery = (id: string) => {
        setExpandedDeliveries(prev =>
            prev.includes(id)
                ? prev.filter(d => d !== id)
                : [...prev, id]
        );
    };

    // Render delivery card
    const renderDeliveryCard = (delivery: MaterialDelivery) => {
        const statusConfig = DELIVERY_STATUS_CONFIG[delivery.status] || DELIVERY_STATUS_CONFIG.pending;
        const StatusIcon = statusConfig.icon;
        const isExpanded = expandedDeliveries.includes(delivery.id);
        const acclimation = getAcclimationProgress(delivery);

        return (
            <Card key={delivery.id} className="transition-all">
                <CardHeader
                    className="cursor-pointer hover:bg-muted/30 transition-colors pb-3"
                    onClick={() => toggleDelivery(delivery.id)}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${statusConfig.color}/10`}>
                                <StatusIcon className={`w-5 h-5 ${statusConfig.textColor}`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-base">{delivery.materialName}</CardTitle>
                                    <Badge variant="outline" className="text-xs">
                                        {delivery.sku}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Package className="w-3.5 h-3.5" />
                                        {delivery.quantity} {delivery.unit}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Truck className="w-3.5 h-3.5" />
                                        {delivery.vendorName}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className={`${statusConfig.color} text-white`}>
                                {statusConfig.label}
                            </Badge>
                            {showPricing && delivery.cost && (
                                <span className="font-bold">
                                    <PriceDisplay value={delivery.cost} />
                                </span>
                            )}
                            {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            )}
                        </div>
                    </div>

                    {/* Acclimation progress bar */}
                    {delivery.acclimationRequired && acclimation && acclimation.status !== 'complete' && (
                        <div className="mt-3 p-2 bg-yellow-500/10 rounded-lg">
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="flex items-center gap-1 text-yellow-600">
                                    <Thermometer className="w-3.5 h-3.5" />
                                    Acclimating
                                </span>
                                <span className="text-muted-foreground">
                                    {acclimation.daysRemaining} days remaining
                                </span>
                            </div>
                            <Progress value={acclimation.progress} className="h-1.5" />
                        </div>
                    )}
                </CardHeader>

                {isExpanded && (
                    <CardContent className="pt-0 space-y-4">
                        {/* Delivery Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-muted/30 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">Expected Date</p>
                                <p className="text-sm font-medium">
                                    {new Date(delivery.expectedDate).toLocaleDateString()}
                                </p>
                            </div>
                            {delivery.actualDate && (
                                <div className="p-3 bg-muted/30 rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">Actual Delivery</p>
                                    <p className="text-sm font-medium">
                                        {new Date(delivery.actualDate).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {delivery.deliveredQuantity !== undefined && (
                                <div className="p-3 bg-muted/30 rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">Received Qty</p>
                                    <p className="text-sm font-medium">
                                        {delivery.deliveredQuantity} / {delivery.quantity} {delivery.unit}
                                    </p>
                                </div>
                            )}
                            {delivery.location && (
                                <div className="p-3 bg-muted/30 rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Location
                                    </p>
                                    <p className="text-sm font-medium">{delivery.location}</p>
                                </div>
                            )}
                        </div>

                        {/* Received By */}
                        {delivery.receivedBy && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="w-4 h-4" />
                                Received by {delivery.receivedBy}
                                {delivery.receivedAt && (
                                    <span>on {new Date(delivery.receivedAt).toLocaleString()}</span>
                                )}
                            </div>
                        )}

                        {/* Acclimation Details */}
                        {delivery.acclimationRequired && (
                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <div className="flex items-center gap-2 text-yellow-600 font-medium text-sm mb-2">
                                    <Thermometer className="w-4 h-4" />
                                    Acclimation Required
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Start Date</p>
                                        <p className="font-medium">
                                            {delivery.acclimationStartDate
                                                ? new Date(delivery.acclimationStartDate).toLocaleDateString()
                                                : 'Not started'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Duration</p>
                                        <p className="font-medium">{delivery.acclimationDaysRequired} days</p>
                                    </div>
                                </div>
                                {acclimation && (
                                    <div className="mt-2">
                                        <Progress value={acclimation.progress} className="h-2" />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {acclimation.status === 'complete'
                                                ? '✓ Acclimation complete - ready for install'
                                                : `${acclimation.daysRemaining} days remaining`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Notes */}
                        {delivery.notes && (
                            <p className="text-sm text-muted-foreground">{delivery.notes}</p>
                        )}

                        {/* Actions */}
                        <PermissionGate permission="MANAGE_DELIVERY_TRACKING">
                            <div className="flex gap-2 pt-2">
                                {delivery.status === 'scheduled' && (
                                    <Button size="sm" variant="outline">
                                        <Truck className="w-4 h-4 mr-2" />
                                        Mark In Transit
                                    </Button>
                                )}
                                {delivery.status === 'in-transit' && (
                                    <Button size="sm">
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Check In Delivery
                                    </Button>
                                )}
                                {delivery.acclimationRequired && !delivery.acclimationStartDate && delivery.status === 'delivered' && (
                                    <Button size="sm" variant="outline">
                                        <Timer className="w-4 h-4 mr-2" />
                                        Start Acclimation
                                    </Button>
                                )}
                            </div>
                        </PermissionGate>
                    </CardContent>
                )}
            </Card>
        );
    };

    // Empty state
    if (deliveries.length === 0 && existingMaterials.length === 0) {
        return (
            <div className="space-y-6">
                <Card className="border-dashed">
                    <CardContent className="pt-12 pb-12 text-center">
                        <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Materials Tracked</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Track material deliveries, acclimation periods, and lot numbers for complete material chain of custody.
                        </p>
                        <PermissionGate permission="MANAGE_DELIVERY_TRACKING">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Material Delivery
                            </Button>
                        </PermissionGate>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Box className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Deliveries</p>
                                <p className="text-2xl font-bold">{metrics.totalDeliveries}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <PackageCheck className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Delivered</p>
                                <p className="text-2xl font-bold">{metrics.delivered}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <Truck className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">In Transit</p>
                                <p className="text-2xl font-bold">{metrics.inTransit}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-500/10">
                                <Thermometer className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Acclimating</p>
                                <p className="text-2xl font-bold">{metrics.acclimating}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {showPricing && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-500/10">
                                    <DollarSign className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Cost</p>
                                    <p className="text-2xl font-bold">${metrics.totalCost.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Filter & Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant={filterStatus === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('all')}
                    >
                        All
                    </Button>
                    <Button
                        variant={filterStatus === 'pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('pending')}
                    >
                        Pending
                    </Button>
                    <Button
                        variant={filterStatus === 'in-transit' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('in-transit')}
                    >
                        In Transit
                    </Button>
                    <Button
                        variant={filterStatus === 'delivered' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('delivered')}
                    >
                        Delivered
                    </Button>
                </div>
                <PermissionGate permission="MANAGE_DELIVERY_TRACKING">
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Delivery
                    </Button>
                </PermissionGate>
            </div>

            {/* Deliveries List */}
            <div className="space-y-4">
                {filteredDeliveries.length > 0 ? (
                    filteredDeliveries.map(delivery => renderDeliveryCard(delivery))
                ) : (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No deliveries match the selected filter
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Legacy Materials (from original project.materials) */}
            {existingMaterials.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Project Materials</CardTitle>
                        <CardDescription>Basic material tracking from project setup</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between py-2 px-4 bg-muted/50 border-b text-sm font-medium text-muted-foreground">
                                <span>Material</span>
                                <div className="flex items-center gap-6">
                                    <span className="w-20">Quantity</span>
                                    <span className="w-24">Status</span>
                                </div>
                            </div>
                            {existingMaterials.map((material, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between py-3 px-4 border-b last:border-b-0 hover:bg-muted/30"
                                >
                                    <span className="font-medium">{material.name}</span>
                                    <div className="flex items-center gap-6">
                                        <span className="text-sm w-20">{material.qty} {material.unit}</span>
                                        <Badge variant="outline" className="w-24 justify-center capitalize">
                                            {material.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
