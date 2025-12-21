'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/components/data-provider';
import { toast } from 'sonner';
import { Plus, Trash2, Package, Calendar, DollarSign, Hash } from 'lucide-react';
import { POLineItem, InventoryItem } from '@/lib/data';

interface PurchaseOrderModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    poId?: string | null;
    initialItem?: InventoryItem | null;
}

interface LineItemForm {
    id: string;
    materialName: string;
    sku: string;
    quantity: number;
    unit: string;
    unitCost: number;
    lotNumber: string;
}

export function PurchaseOrderModal({ open, onOpenChange, poId, initialItem }: PurchaseOrderModalProps) {
    const { data, createPO, updatePO } = useData();
    const [vendorId, setVendorId] = useState<string>('');
    const [projectId, setProjectId] = useState<string>('');
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
    const [notes, setNotes] = useState('');
    const [lineItems, setLineItems] = useState<LineItemForm[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (open) {
            if (poId) {
                // Edit mode - load existing PO
                const po = (data.purchaseOrders || []).find(p => p.id === poId);
                if (po) {
                    setVendorId(String(po.vendorId));
                    setProjectId(po.projectId ? String(po.projectId) : '');
                    setExpectedDeliveryDate(po.expectedDeliveryDate || '');
                    setNotes(po.notes);
                    setLineItems(po.lineItems.map(li => ({
                        id: li.id,
                        materialName: li.materialName,
                        sku: li.sku || '',
                        quantity: li.quantity,
                        unit: li.unit,
                        unitCost: li.unitCost,
                        lotNumber: li.lotNumber || '',
                    })));
                }
            } else if (initialItem) {
                // Pre-fill with inventory item data
                setVendorId('');
                setProjectId('');
                setExpectedDeliveryDate('');
                setNotes(`Reorder for ${initialItem.name}`);
                setLineItems([{
                    id: `temp-${Date.now()}`,
                    materialName: initialItem.name || '',
                    sku: initialItem.sku || '',
                    quantity: 0,
                    unit: 'sf',
                    unitCost: 0,
                    lotNumber: '',
                }]);
            } else {
                // New PO - reset form
                setVendorId('');
                setProjectId('');
                setExpectedDeliveryDate('');
                setNotes('');
                setLineItems([{ id: `temp-${Date.now()}`, materialName: '', sku: '', quantity: 0, unit: 'sf', unitCost: 0, lotNumber: '' }]);
            }
        }
    }, [open, poId, initialItem, data.purchaseOrders]);

    const addLineItem = () => {
        setLineItems([...lineItems, { id: `temp-${Date.now()}`, materialName: '', sku: '', quantity: 0, unit: 'sf', unitCost: 0, lotNumber: '' }]);
    };

    const removeLineItem = (index: number) => {
        if (lineItems.length > 1) {
            setLineItems(lineItems.filter((_, i) => i !== index));
        }
    };

    const updateLineItem = (index: number, field: keyof LineItemForm, value: string | number) => {
        const updated = [...lineItems];
        updated[index] = { ...updated[index], [field]: value };
        setLineItems(updated);
    };

    const calculateTotals = () => {
        const subtotal = lineItems.reduce((sum, li) => sum + (li.quantity * li.unitCost), 0);
        const tax = subtotal * 0.0825; // 8.25% tax
        const total = subtotal + tax;
        return { subtotal, tax, total };
    };

    const handleSubmit = async (asDraft: boolean = false) => {
        if (!vendorId) {
            toast.error('Please select a vendor');
            return;
        }

        if (lineItems.some(li => !li.materialName || li.quantity <= 0)) {
            toast.error('Please fill in all line items');
            return;
        }

        setIsSubmitting(true);

        try {
            const vendor = data.vendors.find(v => v.id === Number(vendorId));
            const project = projectId && projectId !== 'stock' ? data.projects.find(p => p.id === Number(projectId)) : null;
            const { subtotal, tax, total } = calculateTotals();

            const poData = {
                poNumber: `PO-${new Date().getFullYear()}-${String((data.purchaseOrders?.length || 0) + 1).padStart(3, '0')}`,
                vendorId: Number(vendorId),
                vendorName: vendor?.name || 'Unknown Vendor',
                projectId: project?.id,
                projectName: project?.name,
                status: asDraft ? 'draft' as const : 'submitted' as const,
                lineItems: lineItems.map(li => ({
                    id: li.id.startsWith('temp-') ? `li-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : li.id,
                    materialName: li.materialName,
                    sku: li.sku || undefined,
                    quantity: li.quantity,
                    unit: li.unit,
                    unitCost: li.unitCost,
                    total: li.quantity * li.unitCost,
                    lotNumber: li.lotNumber || undefined,
                })) as POLineItem[],
                subtotal,
                tax,
                total,
                createdDate: new Date().toISOString().split('T')[0],
                submittedDate: asDraft ? undefined : new Date().toISOString().split('T')[0],
                expectedDeliveryDate: expectedDeliveryDate || undefined,
                notes,
            };

            if (poId) {
                updatePO(poId, poData);
                toast.success('Purchase order updated!');
            } else {
                createPO(poData);
                toast.success(asDraft ? 'Draft saved!' : 'Purchase order submitted!');
            }

            onOpenChange(false);
        } catch (error) {
            toast.error('Failed to save purchase order');
        } finally {
            setIsSubmitting(false);
        }
    };

    const { subtotal, tax, total } = calculateTotals();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        {poId ? 'Edit Purchase Order' : 'Create Purchase Order'}
                    </DialogTitle>
                    <DialogDescription>
                        Create a new purchase order for materials from a vendor
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Vendor & Project Selection */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="vendor">Vendor *</Label>
                            <Select value={vendorId} onValueChange={setVendorId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select vendor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {data.vendors.map(vendor => (
                                        <SelectItem key={vendor.id} value={String(vendor.id)}>
                                            {vendor.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="project">Project (Optional)</Label>
                            <Select value={projectId} onValueChange={setProjectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select project or leave for stock" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="stock">Stock Order</SelectItem>
                                    {data.projects.map(project => (
                                        <SelectItem key={project.id} value={String(project.id)}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Expected Delivery Date */}
                    <div className="space-y-2">
                        <Label htmlFor="deliveryDate" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Expected Delivery Date
                        </Label>
                        <Input
                            id="deliveryDate"
                            type="date"
                            value={expectedDeliveryDate}
                            onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    {/* Line Items */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Line Items</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                                <Plus className="w-4 h-4 mr-1" />
                                Add Item
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {lineItems.map((item, index) => (
                                <div key={item.id} className="p-4 rounded-lg border bg-muted/30 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Item {index + 1}</span>
                                        {lineItems.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => removeLineItem(index)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Material Name *</Label>
                                            <Input
                                                placeholder="e.g., Shaw Endura LVP - Oak"
                                                value={item.materialName}
                                                onChange={(e) => updateLineItem(index, 'materialName', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">SKU</Label>
                                            <Input
                                                placeholder="e.g., SH-END-001"
                                                value={item.sku}
                                                onChange={(e) => updateLineItem(index, 'sku', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Quantity *</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={item.quantity || ''}
                                                onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Unit</Label>
                                            <Select value={item.unit} onValueChange={(v) => updateLineItem(index, 'unit', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="sf">SF</SelectItem>
                                                    <SelectItem value="lf">LF</SelectItem>
                                                    <SelectItem value="pcs">Pieces</SelectItem>
                                                    <SelectItem value="box">Boxes</SelectItem>
                                                    <SelectItem value="bag">Bags</SelectItem>
                                                    <SelectItem value="bucket">Buckets</SelectItem>
                                                    <SelectItem value="roll">Rolls</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Unit Cost ($)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unitCost || ''}
                                                onChange={(e) => updateLineItem(index, 'unitCost', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Total</Label>
                                            <div className="h-9 px-3 flex items-center rounded-md border bg-muted font-medium">
                                                ${(item.quantity * item.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs flex items-center gap-1">
                                            <Hash className="w-3 h-3" />
                                            Lot/Dye Number (if known)
                                        </Label>
                                        <Input
                                            placeholder="e.g., DL-2024-1215-A"
                                            value={item.lotNumber}
                                            onChange={(e) => updateLineItem(index, 'lotNumber', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Tax (8.25%)</span>
                            <span>${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                            <span>Total</span>
                            <span className="text-primary">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Special instructions, delivery notes, etc."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button variant="secondary" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
                        Save as Draft
                    </Button>
                    <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit PO'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
