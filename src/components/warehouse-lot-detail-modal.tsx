'use client';

import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/components/data-provider';
import { usePermissions } from '@/components/permission-context';
import { cn } from '@/lib/utils';
import type { EnhancedMaterialLot } from '@/lib/warehouse-types';
import {
    Layers,
    Package,
    MapPin,
    Calendar,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Building,
    Clipboard,
    History,
    Bookmark,
    Settings
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════
// LOT DETAIL MODAL
// Complete lot/dye batch tracking with lineage and allocations
// ══════════════════════════════════════════════════════════════════

interface LotDetailModalProps {
    open: boolean;
    onClose: () => void;
    lot: EnhancedMaterialLot | null;
    onAllocate?: (lot: EnhancedMaterialLot) => void;
    onUpdateStatus?: (lot: EnhancedMaterialLot) => void;
}

export function LotDetailModal({
    open,
    onClose,
    lot,
    onAllocate,
    onUpdateStatus
}: LotDetailModalProps) {
    const { data } = useData();
    const { can } = usePermissions();

    // Get transactions for this lot
    const lotTransactions = useMemo(() => {
        if (!lot) return [];
        return (data.inventoryTransactions || [])
            .filter(t => t.lotNumber === lot.lotNumber)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);
    }, [lot, data.inventoryTransactions]);

    // QC status styling
    const getQCStyle = (status: string) => {
        switch (status) {
            case 'passed':
                return { color: 'text-green-600', bg: 'bg-green-500/10', border: 'border-green-500/30', icon: CheckCircle2 };
            case 'failed':
                return { color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: AlertTriangle };
            case 'pending':
            default:
                return { color: 'text-yellow-600', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: Clock };
        }
    };

    // Lot status styling
    const getLotStatusStyle = (status: string) => {
        switch (status) {
            case 'active':
                return { color: 'text-green-600', bg: 'bg-green-500/10', border: 'border-green-500/30' };
            case 'allocated':
            case 'partial':
                return { color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
            case 'consumed':
                return { color: 'text-purple-600', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
            case 'quarantine':
                return { color: 'text-orange-600', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
            case 'damaged':
            case 'expired':
                return { color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-500/30' };
            default:
                return { color: 'text-gray-600', bg: 'bg-gray-500/10', border: 'border-gray-500/30' };
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

    if (!lot) return null;

    const qcStyle = getQCStyle(lot.qcStatus);
    const statusStyle = getLotStatusStyle(lot.status);
    const usagePercent = lot.originalQuantity > 0
        ? Math.round(((lot.originalQuantity - lot.currentQuantity) / lot.originalQuantity) * 100)
        : 0;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader className="shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-purple-500/10">
                                <Layers className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl flex items-center gap-2">
                                    Lot #{lot.lotNumber}
                                    {lot.dyeLot && (
                                        <Badge variant="secondary" className="text-xs">
                                            Dye: {lot.dyeLot}
                                        </Badge>
                                    )}
                                </DialogTitle>
                                <DialogDescription className="flex items-center gap-2 mt-1">
                                    <span className="font-medium">{lot.itemName}</span>
                                    <span>•</span>
                                    <code className="text-xs bg-muted px-2 py-0.5 rounded">{lot.sku}</code>
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("text-xs", qcStyle.bg, qcStyle.color, qcStyle.border)}>
                                <qcStyle.icon className="w-3 h-3 mr-1" />
                                QC: {lot.qcStatus}
                            </Badge>
                            <Badge variant="outline" className={cn("text-xs", statusStyle.bg, statusStyle.color, statusStyle.border)}>
                                {lot.status}
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-6">
                    {/* Quantity Overview */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-3 gap-6 text-center">
                                <div>
                                    <div className="text-3xl font-bold">{lot.originalQuantity}</div>
                                    <div className="text-sm text-muted-foreground">Original</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary">{lot.currentQuantity}</div>
                                    <div className="text-sm text-muted-foreground">Current</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-purple-600">{lot.originalQuantity - lot.currentQuantity}</div>
                                    <div className="text-sm text-muted-foreground">Used</div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">Usage</span>
                                    <span>{usagePercent}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-500 transition-all"
                                        style={{ width: `${usagePercent}%` }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lot Identification */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Clipboard className="w-4 h-4" />
                                Lot Identification
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Lot Number:</span>
                                    <span className="ml-2 font-mono font-medium">{lot.lotNumber}</span>
                                </div>
                                {lot.dyeLot && (
                                    <div>
                                        <span className="text-muted-foreground">Dye Lot:</span>
                                        <span className="ml-2 font-mono font-medium">{lot.dyeLot}</span>
                                    </div>
                                )}
                                {lot.manufacturerLot && (
                                    <div>
                                        <span className="text-muted-foreground">Manufacturer Lot:</span>
                                        <span className="ml-2 font-mono font-medium">{lot.manufacturerLot}</span>
                                    </div>
                                )}
                                {lot.poNumber && (
                                    <div>
                                        <span className="text-muted-foreground">PO Number:</span>
                                        <span className="ml-2 font-mono font-medium">{lot.poNumber}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Source Information */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Building className="w-4 h-4" />
                                Source & Dates
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Vendor:</span>
                                    <span className="ml-2 font-medium">{lot.vendorName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">Received:</span>
                                    <span className="ml-1">{new Date(lot.receivedDate).toLocaleDateString()}</span>
                                </div>
                                {lot.manufactureDate && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-muted-foreground">Manufactured:</span>
                                        <span className="ml-1">{new Date(lot.manufactureDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {lot.expirationDate && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-muted-foreground">Expires:</span>
                                        <span className="ml-1">{new Date(lot.expirationDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-t text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Unit Cost:</span>
                                    <span className="font-medium">${lot.unitCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Value:</span>
                                    <span className="font-medium">${lot.totalCost.toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* QC Information */}
                    <Card className={cn(lot.qcStatus === 'failed' && "border-red-500/30 bg-red-500/5")}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Quality Control
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Badge variant="outline" className={cn("text-sm", qcStyle.bg, qcStyle.color, qcStyle.border)}>
                                    <qcStyle.icon className="w-3.5 h-3.5 mr-1.5" />
                                    {lot.qcStatus === 'passed' ? 'Passed' : lot.qcStatus === 'failed' ? 'Failed' : 'Pending'}
                                </Badge>
                                {lot.qcTestedAt && (
                                    <span className="text-sm text-muted-foreground">
                                        Tested {new Date(lot.qcTestedAt).toLocaleDateString()}
                                        {lot.qcTestedBy && ` by ${lot.qcTestedBy}`}
                                    </span>
                                )}
                            </div>
                            {lot.qcNotes && (
                                <div className="mt-3 text-sm text-muted-foreground">{lot.qcNotes}</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Locations */}
                    {lot.locations && lot.locations.length > 0 && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Stock Locations ({lot.locations.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {lot.locations.map((loc, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-mono">{loc.locationCode}</span>
                                            </div>
                                            <Badge variant="secondary">{loc.quantity} {lot.unit}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Allocations */}
                    {lot.allocations && lot.allocations.length > 0 && (
                        <Card className="border-blue-500/30 bg-blue-500/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-600">
                                    <Bookmark className="w-4 h-4" />
                                    Project Allocations ({lot.allocations.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {lot.allocations.map((alloc, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-blue-500/20">
                                            <div>
                                                <div className="font-medium">{alloc.projectName}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Allocated by {alloc.allocatedBy} on {new Date(alloc.allocatedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <Badge variant="secondary">{alloc.quantity} {lot.unit}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Transaction History */}
                    {lotTransactions.length > 0 && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <History className="w-4 h-4" />
                                    Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {lotTransactions.map(txn => (
                                        <div key={txn.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {txn.type.replace('_', ' ')}
                                                </Badge>
                                                <span className="text-sm">{txn.quantity} {txn.unit}</span>
                                                <span className="text-sm text-muted-foreground">@ {txn.locationCode}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">{formatTimeAgo(txn.timestamp)}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Notes */}
                    {lot.notes && (
                        <Card>
                            <CardContent className="pt-4">
                                <div className="text-sm text-muted-foreground">{lot.notes}</div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="shrink-0 flex items-center justify-between gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <div className="flex items-center gap-2">
                        {can('MANAGE_LOTS') && onUpdateStatus && (
                            <Button variant="outline" className="gap-2" onClick={() => { onUpdateStatus(lot); onClose(); }}>
                                <Settings className="w-4 h-4" />
                                Change Status
                            </Button>
                        )}
                        {can('ALLOCATE_STOCK') && lot.status === 'active' && onAllocate && (
                            <Button className="gap-2" onClick={() => { onAllocate(lot); onClose(); }}>
                                <Bookmark className="w-4 h-4" />
                                Allocate to Project
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
