'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    ClientInvoice,
    ClientInvoiceType,
    ClientInvoiceStatus,
    PaymentMethod,
    InvoiceLineItem,
    PaymentRecord,
    Project,
    ProjectInvoiceSummary
} from '@/lib/data';
import { useData } from './data-provider';
import {
    DollarSign,
    Send,
    FileText,
    Plus,
    Trash2,
    Download,
    CheckCircle2,
    Clock,
    AlertTriangle,
    CreditCard,
    Building2,
    Calendar,
    Printer,
    Mail,
    Eye,
    XCircle,
    Receipt,
    TrendingUp,
    Percent
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════════════════
// INVOICE STATUS BADGE
// ══════════════════════════════════════════════════════════════════════════════

const invoiceStatusConfig: Record<ClientInvoiceStatus, { label: string; className: string; icon: React.ReactNode }> = {
    draft: { label: 'Draft', className: 'bg-slate-500/10 text-slate-500 border-slate-500/20', icon: <FileText className="w-3 h-3" /> },
    sent: { label: 'Sent', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: <Send className="w-3 h-3" /> },
    viewed: { label: 'Viewed', className: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: <Eye className="w-3 h-3" /> },
    partial: { label: 'Partial', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: <Clock className="w-3 h-3" /> },
    paid: { label: 'Paid', className: 'bg-green-500/10 text-green-500 border-green-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
    overdue: { label: 'Overdue', className: 'bg-red-500/10 text-red-500 border-red-500/20', icon: <AlertTriangle className="w-3 h-3" /> },
    void: { label: 'Void', className: 'bg-gray-500/10 text-gray-500 border-gray-500/20 line-through', icon: <XCircle className="w-3 h-3" /> },
};

const invoiceTypeConfig: Record<ClientInvoiceType, { label: string; icon: string; description: string }> = {
    deposit: { label: 'Deposit', icon: '💰', description: 'Initial payment to start work' },
    progress: { label: 'Progress', icon: '📊', description: 'Billing for work completed' },
    final: { label: 'Final', icon: '✅', description: 'Final payment with retainage release' },
    'change-order': { label: 'Change Order', icon: '🔄', description: 'Invoice for approved change orders' },
};

export function InvoiceStatusBadge({ status }: { status: ClientInvoiceStatus }) {
    const config = invoiceStatusConfig[status];
    return (
        <Badge variant="outline" className={cn('gap-1', config.className)}>
            {config.icon}
            {config.label}
        </Badge>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// CREATE INVOICE MODAL
// ══════════════════════════════════════════════════════════════════════════════

interface CreateInvoiceModalProps {
    open: boolean;
    onClose: () => void;
    project: Project;
    suggestedType?: ClientInvoiceType;
}

export function CreateInvoiceModal({ open, onClose, project, suggestedType }: CreateInvoiceModalProps) {
    const { createClientInvoice, generateInvoiceNumber, getProjectInvoiceSummary } = useData();
    const summary = getProjectInvoiceSummary(project.id);

    const [invoiceType, setInvoiceType] = useState<ClientInvoiceType>(suggestedType || 'deposit');
    const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
    const [notes, setNotes] = useState('');
    const [terms, setTerms] = useState('Net 30');
    const [taxRate, setTaxRate] = useState(0);
    const [retainagePercent, setRetainagePercent] = useState(
        project.type.toLowerCase().includes('commercial') ? 10 : 0
    );
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        if (open) {
            // Set due date based on terms
            const today = new Date();
            const days = terms === 'Due upon receipt' ? 0 : parseInt(terms.replace('Net ', '')) || 30;
            today.setDate(today.getDate() + days);
            setDueDate(today.toISOString().split('T')[0]);
        }
    }, [open, terms]);

    useEffect(() => {
        if (open && suggestedType) {
            setInvoiceType(suggestedType);
            // Pre-populate line items based on type
            const newItems: InvoiceLineItem[] = [];

            if (suggestedType === 'deposit') {
                const depositPercent = project.type.toLowerCase().includes('commercial') ? 25 : 50;
                const depositAmount = Math.round(project.financials.contract * (depositPercent / 100));
                newItems.push({
                    id: `li-new-${Date.now()}`,
                    description: `Project Deposit - ${depositPercent}% of Contract Value`,
                    quantity: 1,
                    rate: depositAmount,
                    total: depositAmount
                });
            } else if (suggestedType === 'final') {
                const remaining = summary.totalContractValue - summary.totalInvoiced;
                newItems.push({
                    id: `li-new-${Date.now()}`,
                    description: 'Final Payment - Remaining Balance',
                    quantity: 1,
                    rate: remaining,
                    total: remaining
                });
                if (summary.retainageBalance > 0) {
                    newItems.push({
                        id: `li-ret-${Date.now()}`,
                        description: 'Retainage Release',
                        quantity: 1,
                        rate: summary.retainageBalance,
                        total: summary.retainageBalance
                    });
                }
            }

            setLineItems(newItems);
        }
    }, [open, suggestedType, project, summary]);

    const addLineItem = () => {
        setLineItems([...lineItems, {
            id: `li-new-${Date.now()}`,
            description: '',
            quantity: 1,
            rate: 0,
            total: 0
        }]);
    };

    const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: string | number) => {
        const newItems = [...lineItems];
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === 'quantity' || field === 'rate') {
            newItems[index].total = (newItems[index].quantity || 0) * (newItems[index].rate || 0);
        }
        setLineItems(newItems);
    };

    const removeLineItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * (taxRate / 100);
    const retainageAmount = invoiceType !== 'final' ? subtotal * (retainagePercent / 100) : 0;
    const total = subtotal + tax - retainageAmount;

    const handleCreate = () => {
        if (lineItems.length === 0) {
            toast.error('Please add at least one line item');
            return;
        }

        const invoice: Omit<ClientInvoice, 'id'> = {
            invoiceNumber: generateInvoiceNumber(),
            projectId: project.id,
            projectName: project.name,
            type: invoiceType,
            status: 'draft',
            clientName: project.client,
            clientAddress: project.address,
            lineItems,
            subtotal,
            taxRate,
            tax,
            retainagePercent: invoiceType !== 'final' ? retainagePercent : 0,
            retainageAmount,
            retainageReleased: invoiceType === 'final',
            total,
            amountPaid: 0,
            balance: total,
            invoiceDate: new Date().toISOString().split('T')[0],
            dueDate,
            payments: [],
            notes,
            terms,
            createdBy: 'Derek Morrison'
        };

        createClientInvoice(invoice);
        toast.success(`Invoice ${invoice.invoiceNumber} created!`);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-primary" />
                        Create New Invoice
                    </DialogTitle>
                    <DialogDescription>
                        Create an invoice for {project.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Invoice Type Selection */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {(Object.entries(invoiceTypeConfig) as [ClientInvoiceType, typeof invoiceTypeConfig[ClientInvoiceType]][]).map(([type, config]) => (
                            <Card
                                key={type}
                                className={cn(
                                    'cursor-pointer transition-all hover:shadow-md',
                                    invoiceType === type && 'ring-2 ring-primary border-primary'
                                )}
                                onClick={() => setInvoiceType(type)}
                            >
                                <CardContent className="p-4 text-center">
                                    <div className="text-2xl mb-1">{config.icon}</div>
                                    <div className="font-semibold">{config.label}</div>
                                    <div className="text-xs text-muted-foreground">{config.description}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Client Info */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Bill To
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="font-semibold">{project.client}</div>
                                    <div className="text-sm text-muted-foreground">{project.address}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-muted-foreground">Invoice #</div>
                                    <div className="font-mono font-semibold">{generateInvoiceNumber()}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Line Items */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm">Line Items</CardTitle>
                                <Button variant="outline" size="sm" onClick={addLineItem}>
                                    <Plus className="w-4 h-4 mr-1" /> Add Line
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {lineItems.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-5">
                                        <Input
                                            placeholder="Description"
                                            value={item.description}
                                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            type="number"
                                            placeholder="Qty"
                                            value={item.quantity}
                                            onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            type="number"
                                            placeholder="Rate"
                                            value={item.rate}
                                            onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="col-span-2 text-right font-semibold">
                                        ${item.total.toLocaleString()}
                                    </div>
                                    <div className="col-span-1">
                                        <Button variant="ghost" size="icon" onClick={() => removeLineItem(index)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {lineItems.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No line items yet. Click "Add Line" to add items.
                                </div>
                            )}

                            <Separator className="my-4" />

                            {/* Totals */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">${subtotal.toLocaleString()}</span>
                                </div>
                                {taxRate > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span>Tax ({taxRate}%)</span>
                                        <span>${tax.toLocaleString()}</span>
                                    </div>
                                )}
                                {retainagePercent > 0 && invoiceType !== 'final' && (
                                    <div className="flex justify-between text-sm text-amber-600">
                                        <span>Retainage Held ({retainagePercent}%)</span>
                                        <span>-${retainageAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total Due</span>
                                    <span className="text-primary">${total.toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Settings */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Payment Terms</Label>
                            <Select value={terms} onValueChange={setTerms}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Due upon receipt">Due upon receipt</SelectItem>
                                    <SelectItem value="Net 15">Net 15</SelectItem>
                                    <SelectItem value="Net 30">Net 30</SelectItem>
                                    <SelectItem value="Net 45">Net 45</SelectItem>
                                    <SelectItem value="Net 60">Net 60</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tax Rate (%)</Label>
                            <Input
                                type="number"
                                value={taxRate}
                                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        {project.type.toLowerCase().includes('commercial') && invoiceType !== 'final' && (
                            <div className="space-y-2">
                                <Label>Retainage (%)</Label>
                                <Input
                                    type="number"
                                    value={retainagePercent}
                                    onChange={(e) => setRetainagePercent(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                            placeholder="Any additional notes for the invoice..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleCreate}>
                        <FileText className="w-4 h-4 mr-2" />
                        Create Invoice
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// INVOICE DETAIL MODAL
// ══════════════════════════════════════════════════════════════════════════════

interface InvoiceDetailModalProps {
    open: boolean;
    onClose: () => void;
    invoice: ClientInvoice | null;
    onRecordPayment: (invoice: ClientInvoice) => void;
}

export function InvoiceDetailModal({ open, onClose, invoice, onRecordPayment }: InvoiceDetailModalProps) {
    const { sendClientInvoice, voidClientInvoice } = useData();

    if (!invoice) return null;

    const handleSend = () => {
        sendClientInvoice(invoice.id);
        toast.success(`Invoice ${invoice.invoiceNumber} sent!`);
    };

    const handleVoid = () => {
        if (confirm('Are you sure you want to void this invoice? This cannot be undone.')) {
            voidClientInvoice(invoice.id, 'Voided by user');
            toast.success('Invoice voided');
            onClose();
        }
    };

    const handlePrint = () => {
        toast.success('Opening print dialog...');
        window.print();
    };

    const handleExport = () => {
        // Generate CSV export
        const csvContent = [
            ['Invoice Number', invoice.invoiceNumber],
            ['Client', invoice.clientName],
            ['Date', invoice.invoiceDate],
            ['Due Date', invoice.dueDate],
            ['Status', invoice.status],
            [''],
            ['Line Items'],
            ['Description', 'Quantity', 'Rate', 'Total'],
            ...invoice.lineItems.map(li => [li.description, li.quantity, li.rate, li.total]),
            [''],
            ['Subtotal', '', '', invoice.subtotal],
            ['Tax', '', '', invoice.tax],
            ['Retainage', '', '', invoice.retainageAmount],
            ['Total', '', '', invoice.total],
            ['Amount Paid', '', '', invoice.amountPaid],
            ['Balance', '', '', invoice.balance],
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${invoice.invoiceNumber}.csv`;
        a.click();
        toast.success('Invoice exported to CSV');
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="flex items-center gap-3">
                                <span className="font-mono">{invoice.invoiceNumber}</span>
                                <InvoiceStatusBadge status={invoice.status} />
                            </DialogTitle>
                            <DialogDescription>
                                {invoiceTypeConfig[invoice.type].label} Invoice for {invoice.projectName}
                            </DialogDescription>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-primary">${invoice.total.toLocaleString()}</div>
                            {invoice.balance > 0 && invoice.balance < invoice.total && (
                                <div className="text-sm text-muted-foreground">
                                    Balance: ${invoice.balance.toLocaleString()}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="details" className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="payments">Payments ({invoice.payments.length})</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4 mt-4">
                        {/* Client & Dates */}
                        <div className="grid grid-cols-2 gap-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs uppercase text-muted-foreground">Bill To</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="font-semibold">{invoice.clientName}</div>
                                    <div className="text-sm text-muted-foreground">{invoice.clientAddress}</div>
                                    {invoice.clientEmail && (
                                        <div className="text-sm text-muted-foreground">{invoice.clientEmail}</div>
                                    )}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs uppercase text-muted-foreground">Invoice Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Invoice Date:</span>
                                        <span>{invoice.invoiceDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Due Date:</span>
                                        <span className={invoice.balance > 0 && new Date(invoice.dueDate) < new Date() ? 'text-red-500 font-semibold' : ''}>
                                            {invoice.dueDate}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Terms:</span>
                                        <span>{invoice.terms}</span>
                                    </div>
                                    {invoice.sentDate && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Sent:</span>
                                            <span>{invoice.sentDate}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Line Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Line Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-xs text-muted-foreground border-b">
                                            <th className="pb-2">Description</th>
                                            <th className="pb-2 text-right">Qty</th>
                                            <th className="pb-2 text-right">Rate</th>
                                            <th className="pb-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.lineItems.map(item => (
                                            <tr key={item.id} className="border-b last:border-0">
                                                <td className="py-3">{item.description}</td>
                                                <td className="py-3 text-right">{item.quantity}</td>
                                                <td className="py-3 text-right">${item.rate.toLocaleString()}</td>
                                                <td className="py-3 text-right font-medium">${item.total.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="mt-4 pt-4 border-t space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>${invoice.subtotal.toLocaleString()}</span>
                                    </div>
                                    {invoice.tax > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span>Tax ({invoice.taxRate}%)</span>
                                            <span>${invoice.tax.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {invoice.retainageAmount > 0 && (
                                        <div className="flex justify-between text-sm text-amber-600">
                                            <span>Retainage ({invoice.retainagePercent}%)</span>
                                            <span>-${invoice.retainageAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>${invoice.total.toLocaleString()}</span>
                                    </div>
                                    {invoice.amountPaid > 0 && (
                                        <>
                                            <div className="flex justify-between text-green-600">
                                                <span>Paid</span>
                                                <span>-${invoice.amountPaid.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-primary">
                                                <span>Balance Due</span>
                                                <span>${invoice.balance.toLocaleString()}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {invoice.notes && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="payments" className="mt-4">
                        <Card>
                            <CardContent className="pt-6">
                                {invoice.payments.length > 0 ? (
                                    <div className="space-y-3">
                                        {invoice.payments.map(payment => (
                                            <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-full bg-green-500/10">
                                                        <CreditCard className="w-4 h-4 text-green-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">${payment.amount.toLocaleString()}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {payment.method.toUpperCase()} • {payment.reference || 'No reference'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm">{payment.date}</div>
                                                    {payment.recordedBy && (
                                                        <div className="text-xs text-muted-foreground">by {payment.recordedBy}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No payments recorded yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="preview" className="mt-4">
                        <Card className="bg-white text-black p-8">
                            <div className="space-y-6">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-2xl font-bold">FloorOps Pro</h1>
                                        <p className="text-sm text-gray-600">Professional Flooring Services</p>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-3xl font-bold text-primary">INVOICE</h2>
                                        <p className="font-mono text-lg">{invoice.invoiceNumber}</p>
                                    </div>
                                </div>

                                <Separator className="bg-gray-200" />

                                {/* Addresses */}
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase mb-1">Bill To</p>
                                        <p className="font-semibold">{invoice.clientName}</p>
                                        <p className="text-sm">{invoice.clientAddress}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-block text-left">
                                            <p className="text-sm"><span className="text-gray-500">Date:</span> {invoice.invoiceDate}</p>
                                            <p className="text-sm"><span className="text-gray-500">Due:</span> {invoice.dueDate}</p>
                                            <p className="text-sm"><span className="text-gray-500">Project:</span> {invoice.projectName}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Line Items */}
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="text-left p-2">Description</th>
                                            <th className="text-right p-2">Qty</th>
                                            <th className="text-right p-2">Rate</th>
                                            <th className="text-right p-2">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.lineItems.map(item => (
                                            <tr key={item.id} className="border-b border-gray-100">
                                                <td className="p-2">{item.description}</td>
                                                <td className="text-right p-2">{item.quantity}</td>
                                                <td className="text-right p-2">${item.rate.toLocaleString()}</td>
                                                <td className="text-right p-2">${item.total.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Totals */}
                                <div className="flex justify-end">
                                    <div className="w-64 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>${invoice.subtotal.toLocaleString()}</span>
                                        </div>
                                        {invoice.retainageAmount > 0 && (
                                            <div className="flex justify-between text-amber-600">
                                                <span>Retainage ({invoice.retainagePercent}%)</span>
                                                <span>-${invoice.retainageAmount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <Separator className="bg-gray-200 my-2" />
                                        <div className="flex justify-between text-xl font-bold">
                                            <span>Total Due</span>
                                            <span>${invoice.balance.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {invoice.notes && (
                                    <div className="text-sm bg-gray-50 p-4 rounded">
                                        <p className="text-xs text-gray-500 mb-1">Notes</p>
                                        <p>{invoice.notes}</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="gap-2 mt-4">
                    {invoice.status === 'draft' && (
                        <>
                            <Button variant="destructive" size="sm" onClick={handleVoid}>
                                <XCircle className="w-4 h-4 mr-1" /> Void
                            </Button>
                            <Button variant="outline" onClick={handleSend}>
                                <Send className="w-4 h-4 mr-2" /> Send Invoice
                            </Button>
                        </>
                    )}
                    {invoice.status !== 'void' && invoice.status !== 'paid' && (
                        <Button variant="outline" onClick={() => onRecordPayment(invoice)}>
                            <DollarSign className="w-4 h-4 mr-2" /> Record Payment
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" /> Print
                    </Button>
                    <Button onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// RECORD PAYMENT MODAL
// ══════════════════════════════════════════════════════════════════════════════

interface RecordPaymentModalProps {
    open: boolean;
    onClose: () => void;
    invoice: ClientInvoice | null;
}

export function RecordPaymentModal({ open, onClose, invoice }: RecordPaymentModalProps) {
    const { recordPayment } = useData();
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<PaymentMethod>('check');
    const [reference, setReference] = useState('');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (open && invoice) {
            setAmount(invoice.balance.toString());
        }
    }, [open, invoice]);

    if (!invoice) return null;

    const handleRecord = () => {
        const paymentAmount = parseFloat(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        recordPayment(invoice.id, {
            date,
            amount: paymentAmount,
            method,
            reference,
            notes,
            recordedBy: 'Derek Morrison'
        });

        toast.success(`Payment of $${paymentAmount.toLocaleString()} recorded!`);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        Record Payment
                    </DialogTitle>
                    <DialogDescription>
                        Invoice {invoice.invoiceNumber} • Balance: ${invoice.balance.toLocaleString()}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="pl-9"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="check">Check</SelectItem>
                                <SelectItem value="ach">ACH / Bank Transfer</SelectItem>
                                <SelectItem value="credit-card">Credit Card</SelectItem>
                                <SelectItem value="wire">Wire Transfer</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Reference # (Check #, Transaction ID, etc.)</Label>
                        <Input
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="e.g., CHK #1234"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Notes (optional)</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional notes..."
                            rows={2}
                        />
                    </div>

                    {parseFloat(amount) < invoice.balance && parseFloat(amount) > 0 && (
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <p className="text-sm text-amber-600">
                                This is a partial payment. Remaining balance will be ${(invoice.balance - parseFloat(amount)).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleRecord}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Record Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROJECT INVOICE SUMMARY CARD
// ══════════════════════════════════════════════════════════════════════════════

interface ProjectInvoiceSummaryCardProps {
    summary: ProjectInvoiceSummary;
    onCreateInvoice: (type?: ClientInvoiceType) => void;
}

export function ProjectInvoiceSummaryCard({ summary, onCreateInvoice }: ProjectInvoiceSummaryCardProps) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-primary" />
                    Invoicing Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                {/* Progress Bars */}
                <div className="space-y-4 mb-6">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Invoiced</span>
                            <span className="font-medium">${summary.totalInvoiced.toLocaleString()} / ${summary.totalContractValue.toLocaleString()}</span>
                        </div>
                        <Progress value={summary.percentInvoiced} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">{summary.percentInvoiced.toFixed(0)}% invoiced</div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Collected</span>
                            <span className="font-medium text-green-600">${summary.totalPaid.toLocaleString()}</span>
                        </div>
                        <Progress value={summary.percentCollected} className="h-2 [&>div]:bg-green-500" />
                        <div className="text-xs text-muted-foreground mt-1">{summary.percentCollected.toFixed(0)}% collected</div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                        <div className="text-xl font-bold text-amber-600">${summary.totalOutstanding.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Outstanding</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                        <div className="text-xl font-bold text-blue-600">${summary.retainageBalance.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Retainage Held</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                        <div className="text-xl font-bold">{summary.invoiceCount}</div>
                        <div className="text-xs text-muted-foreground">Invoices</div>
                    </div>
                </div>

                {/* Overdue Alert */}
                {summary.overdueCount > 0 && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-medium">{summary.overdueCount} overdue invoice(s)</span>
                        </div>
                        <div className="text-sm text-red-600 mt-1">
                            ${summary.overdueAmount.toLocaleString()} past due
                        </div>
                    </div>
                )}

                {/* Suggested Next Invoice */}
                {summary.suggestedNextInvoice && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-primary" />
                                    <span className="font-medium text-sm">Suggested: {invoiceTypeConfig[summary.suggestedNextInvoice.type].label} Invoice</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{summary.suggestedNextInvoice.reason}</p>
                            </div>
                            <Button size="sm" onClick={() => onCreateInvoice(summary.suggestedNextInvoice?.type)}>
                                <Plus className="w-4 h-4 mr-1" />
                                ${summary.suggestedNextInvoice.estimatedAmount.toLocaleString()}
                            </Button>
                        </div>
                    </div>
                )}

                <Button className="w-full" onClick={() => onCreateInvoice()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Invoice
                </Button>
            </CardContent>
        </Card>
    );
}
