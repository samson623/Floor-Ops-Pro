'use client';

import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/components/data-provider';
import { usePermissions } from '@/components/permission-context';
import { cn } from '@/lib/utils';
import type { StockTransfer } from '@/lib/warehouse-types';
import {
    ArrowUpDown,
    MapPin,
    Package,
    Truck,
    Clock,
    CheckCircle2,
    AlertTriangle,
    User,
    Calendar,
    FileText,
    Camera,
    Pencil
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════
// TRANSFER DETAIL MODAL
// Complete transfer tracking with timeline and line items
// ══════════════════════════════════════════════════════════════════

interface TransferDetailModalProps {
    open: boolean;
    onClose: () => void;
    transfer: StockTransfer | null;
    onApprove?: (transfer: StockTransfer) => void;
    onPick?: (transfer: StockTransfer) => void;
    onReceive?: (transfer: StockTransfer) => void;
}

export function TransferDetailModal({
    open,
    onClose,
    transfer,
    onApprove,
    onPick,
    onReceive
}: TransferDetailModalProps) {
    const { data } = useData();
    const { can } = usePermissions();

    // Get location names
    const fromLocation = useMemo(() => {
        if (!transfer) return null;
        return (data.warehouseLocations || []).find(l => l.id === transfer.fromLocationId);
    }, [transfer, data.warehouseLocations]);

    const toLocation = useMemo(() => {
        if (!transfer) return null;
        return (data.warehouseLocations || []).find(l => l.id === transfer.toLocationId);
    }, [transfer, data.warehouseLocations]);

    // Get status styling
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'received':
                return { color: 'text-green-600', bg: 'bg-green-500/10', border: 'border-green-500/30' };
            case 'in_transit':
            case 'delivered':
                return { color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
            case 'picking':
            case 'approved':
                return { color: 'text-purple-600', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
            case 'pending':
            case 'draft':
                return { color: 'text-yellow-600', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
            case 'cancelled':
                return { color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-500/30' };
            default:
                return { color: 'text-gray-600', bg: 'bg-gray-500/10', border: 'border-gray-500/30' };
        }
    };

    // Timeline steps
    const timelineSteps = useMemo(() => {
        if (!transfer) return [];
        const steps = [
            { key: 'created', label: 'Created', date: transfer.createdAt, by: transfer.createdBy, icon: FileText, completed: true },
            { key: 'approved', label: 'Approved', date: transfer.approvedAt, by: transfer.approvedBy, icon: CheckCircle2, completed: !!transfer.approvedAt },
            { key: 'picked', label: 'Picked', date: transfer.pickedAt, by: transfer.pickedBy, icon: Package, completed: !!transfer.pickedAt },
            { key: 'shipped', label: 'Shipped', date: transfer.shippedAt, by: undefined, icon: Truck, completed: !!transfer.shippedAt },
            { key: 'received', label: 'Received', date: transfer.receivedAt, by: transfer.receivedBy, icon: CheckCircle2, completed: !!transfer.receivedAt }
        ];
        return steps;
    }, [transfer]);

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!transfer) return null;

    const statusStyle = getStatusStyle(transfer.status);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader className="shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-500/10">
                                <ArrowUpDown className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl flex items-center gap-2">
                                    {transfer.transferNumber}
                                    {transfer.projectName && (
                                        <Badge variant="secondary" className="text-xs">
                                            {transfer.projectName}
                                        </Badge>
                                    )}
                                </DialogTitle>
                                <DialogDescription className="flex items-center gap-2 mt-1">
                                    <span className="font-mono">{transfer.fromLocationCode}</span>
                                    <ArrowUpDown className="w-3 h-3" />
                                    <span className="font-mono">{transfer.toLocationCode}</span>
                                </DialogDescription>
                            </div>
                        </div>
                        <Badge variant="outline" className={cn("text-sm", statusStyle.bg, statusStyle.color, statusStyle.border)}>
                            {transfer.status === 'received' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {transfer.status === 'in_transit' && <Truck className="w-3 h-3 mr-1" />}
                            {transfer.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                            {transfer.status.replace('_', ' ')}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-6">
                    {/* Route Card */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="text-center flex-1">
                                    <div className="p-3 rounded-xl bg-muted/50 inline-block mb-2">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div className="font-medium">{fromLocation?.name || transfer.fromLocationCode}</div>
                                    <div className="text-xs text-muted-foreground font-mono">{transfer.fromLocationCode}</div>
                                    <Badge variant="outline" className="text-xs mt-1">
                                        {transfer.fromLocationType.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div className="flex-shrink-0 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-0.5 bg-muted-foreground/30" />
                                        <Truck className="w-5 h-5 text-muted-foreground" />
                                        <div className="w-16 h-0.5 bg-muted-foreground/30" />
                                    </div>
                                    <div className="text-xs text-muted-foreground text-center mt-1">
                                        {transfer.totalItems} item{transfer.totalItems > 1 ? 's' : ''} • {transfer.totalQuantity} units
                                    </div>
                                </div>
                                <div className="text-center flex-1">
                                    <div className="p-3 rounded-xl bg-primary/10 inline-block mb-2">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="font-medium">{toLocation?.name || transfer.toLocationCode}</div>
                                    <div className="text-xs text-muted-foreground font-mono">{transfer.toLocationCode}</div>
                                    <Badge variant="outline" className="text-xs mt-1">
                                        {transfer.toLocationType.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Transfer Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                {timelineSteps.map((step, idx) => (
                                    <div key={step.key} className="flex items-start gap-4 pb-4 last:pb-0">
                                        <div className="relative">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center",
                                                step.completed ? "bg-green-500/20 text-green-600" : "bg-muted text-muted-foreground"
                                            )}>
                                                <step.icon className="w-4 h-4" />
                                            </div>
                                            {idx < timelineSteps.length - 1 && (
                                                <div className={cn(
                                                    "absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-8",
                                                    step.completed && timelineSteps[idx + 1]?.completed ? "bg-green-500/30" : "bg-muted"
                                                )} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1">
                                            <div className="flex items-center justify-between">
                                                <span className={cn("font-medium", !step.completed && "text-muted-foreground")}>
                                                    {step.label}
                                                </span>
                                                {step.date && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDate(step.date)}
                                                    </span>
                                                )}
                                            </div>
                                            {step.by && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                    <User className="w-3 h-3" />
                                                    {step.by}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Line Items */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Line Items ({transfer.lineItems.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {transfer.lineItems.map((item) => (
                                    <div key={item.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="font-medium">{item.itemName}</div>
                                                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                                    {item.sku}
                                                    {item.lotNumber && ` • Lot: ${item.lotNumber}`}
                                                    {item.dyeLot && ` • Dye: ${item.dyeLot}`}
                                                </div>
                                            </div>
                                            <Badge variant="secondary">
                                                {item.quantity} {item.unit}
                                            </Badge>
                                        </div>
                                        {/* Pick/Receive status */}
                                        {(item.pickedQuantity !== undefined || item.receivedQuantity !== undefined) && (
                                            <div className="mt-2 flex items-center gap-4 text-xs">
                                                {item.pickedQuantity !== undefined && (
                                                    <div className="flex items-center gap-1">
                                                        <CheckCircle2 className={cn("w-3 h-3", item.pickedQuantity === item.quantity ? "text-green-600" : "text-yellow-600")} />
                                                        <span>Picked: {item.pickedQuantity}/{item.quantity}</span>
                                                    </div>
                                                )}
                                                {item.receivedQuantity !== undefined && (
                                                    <div className="flex items-center gap-1">
                                                        <CheckCircle2 className={cn("w-3 h-3", item.receivedQuantity === item.quantity ? "text-green-600" : "text-yellow-600")} />
                                                        <span>Received: {item.receivedQuantity}/{item.quantity}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {/* Discrepancies */}
                                        {(item.damagedQuantity || item.shortageQuantity) && (
                                            <div className="mt-2 flex items-center gap-2">
                                                {item.damagedQuantity && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        {item.damagedQuantity} damaged
                                                    </Badge>
                                                )}
                                                {item.shortageQuantity && (
                                                    <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                                                        {item.shortageQuantity} short
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Scheduled Date */}
                    {transfer.scheduledDate && (
                        <Card>
                            <CardContent className="pt-4 flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <div className="text-sm font-medium">Scheduled Date</div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(transfer.scheduledDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Signature */}
                    {transfer.signedBy && (
                        <Card>
                            <CardContent className="pt-4 flex items-center gap-3">
                                <Pencil className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <div className="text-sm font-medium">Signed by {transfer.signedBy}</div>
                                    {transfer.signedAt && (
                                        <div className="text-xs text-muted-foreground">
                                            {formatDate(transfer.signedAt)}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Photos */}
                    {transfer.photos && transfer.photos.length > 0 && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Camera className="w-4 h-4" />
                                    Photos ({transfer.photos.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground">
                                    {transfer.photos.length} photo{transfer.photos.length > 1 ? 's' : ''} attached
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Notes */}
                    {transfer.notes && (
                        <Card>
                            <CardContent className="pt-4">
                                <div className="text-sm text-muted-foreground">{transfer.notes}</div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Issues */}
                    {transfer.issues && (
                        <Card className="border-red-500/30 bg-red-500/5">
                            <CardContent className="pt-4 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                                <div className="text-sm text-red-600">{transfer.issues}</div>
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
                        {transfer.status === 'pending' && can('APPROVE_TRANSFER') && onApprove && (
                            <Button className="gap-2" variant="default" onClick={() => { onApprove(transfer); onClose(); }}>
                                <CheckCircle2 className="w-4 h-4" />
                                Approve
                            </Button>
                        )}
                        {transfer.status === 'approved' && can('PICK_TRANSFER') && onPick && (
                            <Button className="gap-2" variant="default" onClick={() => { onPick(transfer); onClose(); }}>
                                <Package className="w-4 h-4" />
                                Mark as Picked
                            </Button>
                        )}
                        {['in_transit', 'delivered'].includes(transfer.status) && can('RECEIVE_TRANSFER') && onReceive && (
                            <Button className="gap-2" variant="default" onClick={() => { onReceive(transfer); onClose(); }}>
                                <CheckCircle2 className="w-4 h-4" />
                                Receive Transfer
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
