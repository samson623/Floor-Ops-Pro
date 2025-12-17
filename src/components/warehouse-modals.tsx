'use client';

import { useState } from 'react';
import { useData } from '@/components/data-provider';
import { usePermissions } from '@/components/permission-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
    Package,
    ArrowUpDown,
    RefreshCcw,
    CheckCircle2,
    AlertTriangle,
    Plus,
    Minus,
    Truck,
    MapPin,
    ShoppingCart
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════
// RECEIVE DELIVERY MODAL
// ══════════════════════════════════════════════════════════════════

interface ReceiveDeliveryModalProps {
    open: boolean;
    onClose: () => void;
}

export function ReceiveDeliveryModal({ open, onClose }: ReceiveDeliveryModalProps) {
    const { data } = useData();
    const { currentUser } = usePermissions();
    const [selectedVendor, setSelectedVendor] = useState('');
    const [poNumber, setPoNumber] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    const [quantity, setQuantity] = useState('');
    const [lotNumber, setLotNumber] = useState('');
    const [dyeLot, setDyeLot] = useState('');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const locations = (data.warehouseLocations || []).filter(l =>
        l.isReceivable && ['bay', 'aisle', 'warehouse', 'staging'].includes(l.type)
    );

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
            onClose();
            resetForm();
        }, 1500);
    };

    const resetForm = () => {
        setSelectedVendor('');
        setPoNumber('');
        setSelectedItem('');
        setQuantity('');
        setLotNumber('');
        setDyeLot('');
        setLocation('');
        setNotes('');
        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-green-600" />
                        Receive Delivery
                    </DialogTitle>
                    <DialogDescription>
                        Record incoming materials into inventory
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-12 text-center">
                        <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                        <p className="text-lg font-medium">Delivery Received!</p>
                        <p className="text-muted-foreground">Material added to inventory</p>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Vendor</Label>
                                <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select vendor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {data.vendors.map(v => (
                                            <SelectItem key={v.id} value={v.id.toString()}>{v.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>PO Number</Label>
                                <Input
                                    placeholder="PO-2024-0001"
                                    value={poNumber}
                                    onChange={(e) => setPoNumber(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Material</Label>
                            <Select value={selectedItem} onValueChange={setSelectedItem}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select material" />
                                </SelectTrigger>
                                <SelectContent>
                                    {data.inventory.map(item => (
                                        <SelectItem key={item.id} value={item.id.toString()}>
                                            {item.name} ({item.sku})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    placeholder="100"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Put-Away Location</Label>
                                <Select value={location} onValueChange={setLocation}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map(loc => (
                                            <SelectItem key={loc.id} value={loc.id}>
                                                {loc.code} - {loc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Lot Number</Label>
                                <Input
                                    placeholder="LOT-2024-001"
                                    value={lotNumber}
                                    onChange={(e) => setLotNumber(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Dye Lot (optional)</Label>
                                <Input
                                    placeholder="DL-2024-A15"
                                    value={dyeLot}
                                    onChange={(e) => setDyeLot(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                placeholder="Any notes about this delivery..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !selectedItem || !quantity || !location}>
                        {isSubmitting ? 'Processing...' : 'Receive Material'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ══════════════════════════════════════════════════════════════════
// STOCK TRANSFER MODAL
// ══════════════════════════════════════════════════════════════════

interface TransferModalProps {
    open: boolean;
    onClose: () => void;
}

export function TransferModal({ open, onClose }: TransferModalProps) {
    const { data } = useData();
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    const [quantity, setQuantity] = useState('');
    const [project, setProject] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const locations = data.warehouseLocations || [];

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
            onClose();
            resetForm();
        }, 1500);
    };

    const resetForm = () => {
        setFromLocation('');
        setToLocation('');
        setSelectedItem('');
        setQuantity('');
        setProject('');
        setNotes('');
        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowUpDown className="w-5 h-5 text-blue-600" />
                        Create Stock Transfer
                    </DialogTitle>
                    <DialogDescription>
                        Move materials between locations
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-12 text-center">
                        <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                        <p className="text-lg font-medium">Transfer Created!</p>
                        <p className="text-muted-foreground">Transfer is pending pickup</p>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>From Location</Label>
                                <Select value={fromLocation} onValueChange={setFromLocation}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.filter(l => l.isPickable).map(loc => (
                                            <SelectItem key={loc.id} value={loc.id}>
                                                {loc.code} - {loc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>To Location</Label>
                                <Select value={toLocation} onValueChange={setToLocation}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Destination" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.filter(l => l.id !== fromLocation).map(loc => (
                                            <SelectItem key={loc.id} value={loc.id}>
                                                {loc.code} - {loc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Material</Label>
                            <Select value={selectedItem} onValueChange={setSelectedItem}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select material" />
                                </SelectTrigger>
                                <SelectContent>
                                    {data.inventory.map(item => (
                                        <SelectItem key={item.id} value={item.id.toString()}>
                                            {item.name} ({item.stock - item.reserved} available)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    placeholder="100"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Project (optional)</Label>
                                <Select value={project} onValueChange={setProject}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {data.projects.map(p => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                placeholder="Transfer notes..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !fromLocation || !toLocation || !selectedItem || !quantity}>
                        {isSubmitting ? 'Creating...' : 'Create Transfer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ══════════════════════════════════════════════════════════════════
// INVENTORY ADJUSTMENT MODAL
// ══════════════════════════════════════════════════════════════════

interface AdjustmentModalProps {
    open: boolean;
    onClose: () => void;
}

export function AdjustmentModal({ open, onClose }: AdjustmentModalProps) {
    const { data } = useData();
    const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('decrease');
    const [selectedItem, setSelectedItem] = useState('');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [location, setLocation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const locations = (data.warehouseLocations || []).filter(l =>
        ['bay', 'aisle', 'warehouse', 'staging'].includes(l.type)
    );

    const reasons = [
        'Cycle count correction',
        'Physical damage',
        'Quality issue',
        'Customer return',
        'Found during inventory',
        'Other'
    ];

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
            onClose();
            resetForm();
        }, 1500);
    };

    const resetForm = () => {
        setAdjustmentType('decrease');
        setSelectedItem('');
        setQuantity('');
        setReason('');
        setLocation('');
        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <RefreshCcw className="w-5 h-5 text-yellow-600" />
                        Inventory Adjustment
                    </DialogTitle>
                    <DialogDescription>
                        Correct inventory quantities with audit trail
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-12 text-center">
                        <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                        <p className="text-lg font-medium">Adjustment Applied!</p>
                        <p className="text-muted-foreground">Inventory updated successfully</p>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        {/* Adjustment Type Toggle */}
                        <div className="flex gap-2 p-1 bg-muted rounded-lg">
                            <button
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all",
                                    adjustmentType === 'increase' ? "bg-green-500 text-white" : "hover:bg-muted-foreground/10"
                                )}
                                onClick={() => setAdjustmentType('increase')}
                            >
                                <Plus className="w-4 h-4" />
                                Increase
                            </button>
                            <button
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all",
                                    adjustmentType === 'decrease' ? "bg-red-500 text-white" : "hover:bg-muted-foreground/10"
                                )}
                                onClick={() => setAdjustmentType('decrease')}
                            >
                                <Minus className="w-4 h-4" />
                                Decrease
                            </button>
                        </div>

                        <div className="space-y-2">
                            <Label>Material</Label>
                            <Select value={selectedItem} onValueChange={setSelectedItem}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select material" />
                                </SelectTrigger>
                                <SelectContent>
                                    {data.inventory.map(item => (
                                        <SelectItem key={item.id} value={item.id.toString()}>
                                            {item.name} (Current: {item.stock})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    placeholder="10"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Select value={location} onValueChange={setLocation}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map(loc => (
                                            <SelectItem key={loc.id} value={loc.id}>
                                                {loc.code}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Reason</Label>
                            <Select value={reason} onValueChange={setReason}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    {reasons.map(r => (
                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedItem && quantity && (
                            <div className={cn(
                                "p-3 rounded-lg border",
                                adjustmentType === 'increase' ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
                            )}>
                                <div className="flex items-center justify-between text-sm">
                                    <span>New Stock Level:</span>
                                    <span className="font-bold">
                                        {(() => {
                                            const item = data.inventory.find(i => i.id.toString() === selectedItem);
                                            if (!item) return '-';
                                            const qty = parseInt(quantity) || 0;
                                            return adjustmentType === 'increase' ? item.stock + qty : item.stock - qty;
                                        })()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !selectedItem || !quantity || !reason}>
                        {isSubmitting ? 'Applying...' : 'Apply Adjustment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ══════════════════════════════════════════════════════════════════
// QUICK ORDER MODAL (for reorder alerts)
// ══════════════════════════════════════════════════════════════════

interface QuickOrderModalProps {
    open: boolean;
    onClose: () => void;
    item?: {
        itemName: string;
        sku: string;
        suggestedQuantity: number;
        preferredVendorName: string;
        estimatedCost: number;
    };
}

export function QuickOrderModal({ open, onClose, item }: QuickOrderModalProps) {
    const { data } = useData();
    const [vendor, setVendor] = useState('');
    const [quantity, setQuantity] = useState('');
    const [urgency, setUrgency] = useState('standard');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Pre-fill when item changes
    useState(() => {
        if (item) {
            setQuantity(item.suggestedQuantity.toString());
        }
    });

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
            onClose();
            resetForm();
        }, 1500);
    };

    const resetForm = () => {
        setVendor('');
        setQuantity('');
        setUrgency('standard');
        setNotes('');
        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                        Create Purchase Order
                    </DialogTitle>
                    <DialogDescription>
                        {item ? `Reorder ${item.itemName}` : 'Create a new purchase order'}
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-12 text-center">
                        <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                        <p className="text-lg font-medium">PO Created!</p>
                        <p className="text-muted-foreground">Purchase order sent to vendor</p>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        {item && (
                            <div className="p-3 rounded-lg bg-muted/50 border">
                                <div className="font-medium">{item.itemName}</div>
                                <div className="text-sm text-muted-foreground">SKU: {item.sku}</div>
                                <div className="mt-2 text-sm">
                                    <Badge variant="secondary">Suggested: {item.suggestedQuantity} units</Badge>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Vendor</Label>
                            <Select value={vendor} onValueChange={setVendor}>
                                <SelectTrigger>
                                    <SelectValue placeholder={item?.preferredVendorName || "Select vendor"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {data.vendors.map(v => (
                                        <SelectItem key={v.id} value={v.id.toString()}>{v.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    placeholder={item?.suggestedQuantity.toString() || "100"}
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Urgency</Label>
                                <Select value={urgency} onValueChange={setUrgency}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="standard">Standard</SelectItem>
                                        <SelectItem value="rush">Rush (+15%)</SelectItem>
                                        <SelectItem value="critical">Critical (+25%)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                placeholder="Order notes..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        {quantity && (
                            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                                <div className="flex justify-between text-sm">
                                    <span>Estimated Total:</span>
                                    <span className="font-bold">
                                        ${(parseFloat(quantity) * (item?.estimatedCost || 25) / (item?.suggestedQuantity || 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !quantity}>
                        {isSubmitting ? 'Creating PO...' : 'Create Purchase Order'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ══════════════════════════════════════════════════════════════════
// ADD INVENTORY ITEM MODAL
// Enterprise-grade item creation with role-based permissions
// ══════════════════════════════════════════════════════════════════

interface AddInventoryItemModalProps {
    open: boolean;
    onClose: () => void;
}

export function AddInventoryItemModal({ open, onClose }: AddInventoryItemModalProps) {
    const { data, addInventoryItem } = useData();
    const { can, currentUser } = usePermissions();
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [initialStock, setInitialStock] = useState('');
    const [unitType, setUnitType] = useState('');
    const [vendor, setVendor] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const hasPermission = can('ADD_INVENTORY');
    const locations = (data.warehouseLocations || []).filter(l =>
        l.isReceivable && ['bay', 'aisle', 'warehouse', 'staging', 'zone'].includes(l.type)
    );

    const unitTypes = ['sqft', 'pcs', 'boxes', 'bags', 'rolls', 'pallets', 'gallons', 'each'];
    const categories = [
        'Flooring - LVP',
        'Flooring - Hardwood',
        'Flooring - Tile',
        'Flooring - Carpet',
        'Adhesives & Mortar',
        'Underlayment',
        'Transitions & Trim',
        'Tools & Supplies'
    ];

    const handleSubmit = async () => {
        if (!hasPermission) return;

        setIsSubmitting(true);

        // Generate new item
        const newItem = {
            id: Math.max(...data.inventory.map(i => i.id), 0) + 1,
            name,
            sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
            stock: parseInt(initialStock) || 0,
            reserved: 0
        };

        // Add to inventory
        addInventoryItem(newItem);

        await new Promise(resolve => setTimeout(resolve, 600));
        setSuccess(true);

        setTimeout(() => {
            setSuccess(false);
            onClose();
            resetForm();
        }, 1500);
    };

    const resetForm = () => {
        setName('');
        setSku('');
        setInitialStock('');
        setUnitType('');
        setVendor('');
        setLocation('');
        setCategory('');
        setNotes('');
        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary" />
                        Add Inventory Item
                    </DialogTitle>
                    <DialogDescription>
                        Create a new material in the warehouse system
                    </DialogDescription>
                </DialogHeader>

                {!hasPermission ? (
                    <div className="py-12 text-center">
                        <AlertTriangle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                        <p className="text-lg font-medium">Permission Denied</p>
                        <p className="text-muted-foreground">
                            You don't have permission to add inventory items.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Contact a Warehouse Manager or Administrator.
                        </p>
                    </div>
                ) : success ? (
                    <div className="py-12 text-center">
                        <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                        <p className="text-lg font-medium">Item Created!</p>
                        <p className="text-muted-foreground">{name} has been added to inventory</p>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        {/* Item Name & SKU */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Item Name *</Label>
                                <Input
                                    placeholder="e.g., LVP - Ash Gray"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>SKU</Label>
                                <Input
                                    placeholder="Auto-generated if empty"
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Stock & Unit Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Initial Stock</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={initialStock}
                                    onChange={(e) => setInitialStock(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Unit Type</Label>
                                <Select value={unitType} onValueChange={setUnitType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {unitTypes.map(unit => (
                                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Vendor & Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Preferred Vendor</Label>
                                <Select value={vendor} onValueChange={setVendor}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select vendor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {data.vendors.map(v => (
                                            <SelectItem key={v.id} value={v.id.toString()}>{v.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Default Location</Label>
                                <Select value={location} onValueChange={setLocation}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map(loc => (
                                            <SelectItem key={loc.id} value={loc.id}>
                                                {loc.code} - {loc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                placeholder="Additional notes about this item..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                            />
                        </div>

                        {/* Preview */}
                        {name && (
                            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {sku || 'SKU: Auto-generated'} • {category || 'Uncategorized'}
                                        </div>
                                    </div>
                                    <Badge variant="secondary">
                                        {initialStock || 0} {unitType || 'units'}
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    {hasPermission && (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !name}
                        >
                            {isSubmitting ? 'Creating...' : 'Add Item'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
