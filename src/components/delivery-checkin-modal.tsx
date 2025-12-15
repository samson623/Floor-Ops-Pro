'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/components/data-provider';
import { toast } from 'sonner';
import {
    Truck, Package, Camera, AlertTriangle, CheckCircle2,
    Hash, ImagePlus, X, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DeliveryLineItem, DeliveryPhoto } from '@/lib/data';

interface DeliveryCheckInModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deliveryId: string | null;
}

interface LineItemCheck {
    poLineItemId: string;
    materialName: string;
    orderedQty: number;
    receivedQty: number;
    damagedQty: number;
    lotNumber: string;
    unit: string;
}

export function DeliveryCheckInModal({ open, onOpenChange, deliveryId }: DeliveryCheckInModalProps) {
    const { data, checkInDelivery, createLot } = useData();
    const [lineItems, setLineItems] = useState<LineItemCheck[]>([]);
    const [photos, setPhotos] = useState<DeliveryPhoto[]>([]);
    const [notes, setNotes] = useState('');
    const [issues, setIssues] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [photoType, setPhotoType] = useState<'pallet' | 'damage'>('pallet');

    // Load delivery data when modal opens
    useEffect(() => {
        if (open && deliveryId) {
            const delivery = (data.deliveries || []).find(d => d.id === deliveryId);
            if (delivery) {
                setLineItems(delivery.lineItems.map(li => ({
                    poLineItemId: li.poLineItemId,
                    materialName: li.materialName,
                    orderedQty: li.orderedQty,
                    receivedQty: li.receivedQty || li.orderedQty, // Default to ordered qty
                    damagedQty: li.damagedQty || 0,
                    lotNumber: li.lotNumber || '',
                    unit: li.unit,
                })));
                setNotes(delivery.notes || '');
                setIssues(delivery.issues || '');
                setPhotos([]);
            }
        }
    }, [open, deliveryId, data.deliveries]);

    const updateLineItem = (index: number, field: keyof LineItemCheck, value: string | number) => {
        const updated = [...lineItems];
        updated[index] = { ...updated[index], [field]: value };
        setLineItems(updated);
    };

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
            const newPhoto: DeliveryPhoto = {
                id: `ph-${Date.now()}`,
                type: photoType,
                url: reader.result as string,
                caption: `${photoType === 'pallet' ? 'Pallet' : 'Damage'} photo`,
                timestamp: new Date().toISOString(),
            };
            setPhotos([...photos, newPhoto]);
            toast.success('Photo added!');
        };
        reader.readAsDataURL(file);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removePhoto = (photoId: string) => {
        setPhotos(photos.filter(p => p.id !== photoId));
    };

    const triggerPhotoUpload = (type: 'pallet' | 'damage') => {
        setPhotoType(type);
        fileInputRef.current?.click();
    };

    const handleSubmit = async () => {
        // Validate lot numbers
        const missingLots = lineItems.filter(li => !li.lotNumber && li.receivedQty > 0);
        if (missingLots.length > 0) {
            const proceed = window.confirm(
                `${missingLots.length} item(s) are missing lot numbers. This is important for tracking. Continue anyway?`
            );
            if (!proceed) return;
        }

        setIsSubmitting(true);

        try {
            const delivery = (data.deliveries || []).find(d => d.id === deliveryId);

            // Check in the delivery
            const deliveryLineItems: DeliveryLineItem[] = lineItems.map(li => ({
                poLineItemId: li.poLineItemId,
                materialName: li.materialName,
                orderedQty: li.orderedQty,
                receivedQty: li.receivedQty,
                damagedQty: li.damagedQty,
                lotNumber: li.lotNumber || undefined,
                unit: li.unit,
            }));

            checkInDelivery(deliveryId!, deliveryLineItems, photos, notes, issues || undefined);

            // Create lot entries for items with lot numbers
            if (delivery) {
                lineItems.forEach(li => {
                    if (li.lotNumber && li.receivedQty > 0) {
                        createLot({
                            materialName: li.materialName,
                            lotNumber: li.lotNumber,
                            quantity: li.receivedQty - li.damagedQty,
                            unit: li.unit,
                            vendorId: delivery.vendorId,
                            vendorName: delivery.vendorName,
                            projectId: delivery.projectId,
                            projectName: delivery.projectName,
                            deliveryId: delivery.id,
                            receivedDate: new Date().toISOString().split('T')[0],
                        });
                    }
                });
            }

            toast.success('Delivery checked in successfully!');
            onOpenChange(false);
        } catch (error) {
            toast.error('Failed to check in delivery');
        } finally {
            setIsSubmitting(false);
        }
    };

    const delivery = deliveryId ? (data.deliveries || []).find(d => d.id === deliveryId) : null;
    const hasIssues = lineItems.some(li => li.damagedQty > 0 || li.receivedQty < li.orderedQty);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-primary" />
                        Check In Delivery
                    </DialogTitle>
                    {delivery && (
                        <DialogDescription>
                            {delivery.poNumber} from {delivery.vendorName}
                            {delivery.projectName && ` • ${delivery.projectName}`}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Line Items Verification */}
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Verify Materials Received</Label>

                        {lineItems.map((item, index) => {
                            const hasDiscrepancy = item.receivedQty !== item.orderedQty || item.damagedQty > 0;
                            return (
                                <div
                                    key={item.poLineItemId}
                                    className={cn(
                                        "p-4 rounded-lg border space-y-3",
                                        hasDiscrepancy ? "bg-yellow-500/5 border-yellow-500/50" : "bg-muted/30"
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-medium">{item.materialName}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Ordered: {item.orderedQty} {item.unit}
                                            </p>
                                        </div>
                                        {hasDiscrepancy && (
                                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Received Qty</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max={item.orderedQty}
                                                value={item.receivedQty}
                                                onChange={(e) => updateLineItem(index, 'receivedQty', Number(e.target.value))}
                                                className={cn(
                                                    item.receivedQty < item.orderedQty && "border-yellow-500"
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-red-500">Damaged Qty</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max={item.receivedQty}
                                                value={item.damagedQty}
                                                onChange={(e) => updateLineItem(index, 'damagedQty', Number(e.target.value))}
                                                className={cn(
                                                    item.damagedQty > 0 && "border-red-500"
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <Label className="text-xs flex items-center gap-1">
                                                <Hash className="w-3 h-3" />
                                                Lot/Dye Number
                                            </Label>
                                            <Input
                                                placeholder="Enter lot number from packaging"
                                                value={item.lotNumber}
                                                onChange={(e) => updateLineItem(index, 'lotNumber', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Quick status */}
                                    <div className="flex items-center gap-2 text-sm">
                                        {item.receivedQty >= item.orderedQty && item.damagedQty === 0 ? (
                                            <span className="text-green-600 flex items-center gap-1">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Complete
                                            </span>
                                        ) : (
                                            <span className="text-yellow-600 flex items-center gap-1">
                                                <AlertTriangle className="w-4 h-4" />
                                                {item.receivedQty < item.orderedQty && `Short ${item.orderedQty - item.receivedQty} ${item.unit}`}
                                                {item.damagedQty > 0 && ` • ${item.damagedQty} damaged`}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Photo Upload */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            Photos
                        </Label>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={handlePhotoUpload}
                        />

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => triggerPhotoUpload('pallet')}
                            >
                                <ImagePlus className="w-4 h-4 mr-2" />
                                Add Pallet Photo
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="text-red-600 hover:text-red-600"
                                onClick={() => triggerPhotoUpload('damage')}
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                Add Damage Photo
                            </Button>
                        </div>

                        {/* Photo Preview */}
                        {photos.length > 0 && (
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                {photos.map(photo => (
                                    <div key={photo.id} className="relative group">
                                        <img
                                            src={photo.url}
                                            alt={photo.caption || 'Delivery photo'}
                                            className="w-full h-24 object-cover rounded-lg border"
                                        />
                                        <div className={cn(
                                            "absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-medium",
                                            photo.type === 'damage' ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                                        )}>
                                            {photo.type}
                                        </div>
                                        <button
                                            onClick={() => removePhoto(photo.id)}
                                            className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="General notes about the delivery..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                        />
                    </div>

                    {/* Issues */}
                    {hasIssues && (
                        <div className="space-y-2">
                            <Label htmlFor="issues" className="text-red-600 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Document Issues
                            </Label>
                            <Textarea
                                id="issues"
                                placeholder="Describe any issues: damage details, shortages, etc."
                                value={issues}
                                onChange={(e) => setIssues(e.target.value)}
                                rows={3}
                                className="border-red-500/50"
                            />
                        </div>
                    )}

                    {/* Summary */}
                    <div className={cn(
                        "p-4 rounded-lg",
                        hasIssues ? "bg-yellow-500/10 border border-yellow-500/50" : "bg-green-500/10 border border-green-500/50"
                    )}>
                        <div className="flex items-center gap-2 mb-2">
                            {hasIssues ? (
                                <>
                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                    <span className="font-medium text-yellow-600">Issues Detected</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    <span className="font-medium text-green-600">All Items Complete</span>
                                </>
                            )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {lineItems.length} item{lineItems.length !== 1 ? 's' : ''} •
                            {photos.length} photo{photos.length !== 1 ? 's' : ''}
                            {hasIssues && ' • Issues require documentation'}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={cn(hasIssues && "bg-yellow-600 hover:bg-yellow-700")}
                    >
                        {isSubmitting ? 'Processing...' : hasIssues ? 'Check In with Issues' : 'Complete Check-In'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
