'use client';

import { useState } from 'react';
import { TopBar } from '@/components/top-bar';
import { useData } from '@/components/data-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PHASE_CONFIGS, Subcontractor, SubcontractorInvoice } from '@/lib/data';
import {
    Search,
    Phone,
    Mail,
    Star,
    Clock,
    DollarSign,
    CheckCircle2,
    XCircle,
    FileText,
    Plus,
    Building2,
    AlertTriangle,
    Calendar,
    ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

type TabType = 'directory' | 'invoices' | 'pending';

const invoiceStatusConfig = {
    draft: { label: 'Draft', className: 'bg-muted text-muted-foreground', icon: FileText },
    submitted: { label: 'Submitted', className: 'bg-blue-500/10 text-blue-500', icon: ArrowUpRight },
    'pending-approval': { label: 'Pending', className: 'bg-amber-500/10 text-amber-500', icon: Clock },
    approved: { label: 'Approved', className: 'bg-green-500/10 text-green-500', icon: CheckCircle2 },
    rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-500', icon: XCircle },
    paid: { label: 'Paid', className: 'bg-emerald-500/10 text-emerald-500', icon: DollarSign },
    disputed: { label: 'Disputed', className: 'bg-orange-500/10 text-orange-500', icon: AlertTriangle },
};

const tradeColors: Record<string, string> = {
    'Demolition': 'from-red-500 to-orange-500',
    'Subfloor Prep': 'from-amber-500 to-yellow-500',
    'Asbestos Abatement': 'from-purple-500 to-indigo-500',
    'Tile Installation': 'from-blue-500 to-cyan-500',
    'default': 'from-primary to-primary/70'
};

export default function SubcontractorsPage() {
    const { data, approveInvoice, updateSubcontractorInvoice, isLoaded } = useData();
    const [activeTab, setActiveTab] = useState<TabType>('directory');
    const [searchTerm, setSearchTerm] = useState('');

    const subcontractors = data.subcontractors || [];
    const invoices = data.subcontractorInvoices || [];
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending-approval' || inv.status === 'submitted');

    const filteredSubcontractors = subcontractors.filter(sub =>
        sub.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.trade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats
    const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
    const pendingValue = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const approvedUnpaid = invoices.filter(inv => inv.status === 'approved').reduce((sum, inv) => sum + inv.total, 0);

    if (!isLoaded) {
        return (
            <>
                <TopBar title="Subcontractors" breadcrumb="Finance → Subcontractors" showNewProject={false} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse text-muted-foreground">Loading subcontractor data...</div>
                </div>
            </>
        );
    }

    const handleApprove = (invoice: SubcontractorInvoice) => {
        approveInvoice(invoice.id, 'Derek Morrison');
        toast.success(`Invoice ${invoice.invoiceNumber} approved!`);
    };

    const handleReject = (invoice: SubcontractorInvoice) => {
        updateSubcontractorInvoice(invoice.id, { status: 'rejected', disputeReason: 'Rejected by Derek Morrison' });
        toast.error(`Invoice ${invoice.invoiceNumber} rejected`);
    };

    return (
        <>
            <TopBar title="Subcontractors" breadcrumb="Finance → Subcontractors" showNewProject={false} />

            <div className="flex-1 overflow-y-auto">
                {/* Summary Stats */}
                <div className="bg-gradient-to-br from-card via-card to-primary/5 border-b p-4 lg:p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                            <CardContent className="pt-4 pb-3">
                                <div className="flex items-center gap-2 text-blue-500 mb-1">
                                    <Building2 className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">Subcontractors</span>
                                </div>
                                <div className="text-2xl font-bold text-blue-500">{subcontractors.length}</div>
                                <div className="text-xs text-muted-foreground mt-1">Active partners</div>
                            </CardContent>
                        </Card>

                        <Card className={cn(
                            "bg-gradient-to-br border",
                            pendingInvoices.length > 0
                                ? "from-amber-500/10 to-amber-600/5 border-amber-500/20"
                                : "from-green-500/10 to-green-600/5 border-green-500/20"
                        )}>
                            <CardContent className="pt-4 pb-3">
                                <div className={cn("flex items-center gap-2 mb-1", pendingInvoices.length > 0 ? "text-amber-500" : "text-green-500")}>
                                    <Clock className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">Pending</span>
                                </div>
                                <div className={cn("text-2xl font-bold", pendingInvoices.length > 0 ? "text-amber-500" : "text-green-500")}>
                                    {pendingInvoices.length}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">${pendingValue.toLocaleString()}</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                            <CardContent className="pt-4 pb-3">
                                <div className="flex items-center gap-2 text-purple-500 mb-1">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">To Pay</span>
                                </div>
                                <div className="text-2xl font-bold text-purple-500">${(approvedUnpaid / 1000).toFixed(1)}K</div>
                                <div className="text-xs text-muted-foreground mt-1">Approved, unpaid</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                            <CardContent className="pt-4 pb-3">
                                <div className="flex items-center gap-2 text-emerald-500 mb-1">
                                    <DollarSign className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">Paid YTD</span>
                                </div>
                                <div className="text-2xl font-bold text-emerald-500">${(totalPaid / 1000).toFixed(1)}K</div>
                                <div className="text-xs text-muted-foreground mt-1">This year</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="p-4 lg:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <TabsList className="h-auto gap-1 bg-muted/50 p-1 w-fit">
                            <TabsTrigger value="directory" className="data-[state=active]:shadow-sm">
                                🏗️ Directory
                            </TabsTrigger>
                            <TabsTrigger value="pending" className="relative">
                                📋 Pending Approval
                                {pendingInvoices.length > 0 && (
                                    <Badge className="ml-1.5 h-5 px-1.5 bg-amber-500 text-white text-xs">
                                        {pendingInvoices.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="invoices">
                                📄 All Invoices
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex gap-2">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search subcontractors..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button onClick={() => toast.success('Add subcontractor...')}>
                                <Plus className="w-4 h-4 mr-1" />
                                Add New
                            </Button>
                        </div>
                    </div>

                    {/* Directory Tab */}
                    <TabsContent value="directory" className="space-y-6 mt-0">
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredSubcontractors.map(sub => {
                                const subInvoices = invoices.filter(inv => inv.subcontractorId === sub.id);
                                const totalSpent = subInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
                                const gradientColor = tradeColors[sub.trade] || tradeColors.default;

                                return (
                                    <Card key={sub.id} className="overflow-hidden hover:shadow-lg transition-all group">
                                        <div className={cn("h-2 bg-gradient-to-r", gradientColor)} />
                                        <CardContent className="pt-4">
                                            <div className="flex items-start gap-4">
                                                <div className={cn(
                                                    "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl shadow-lg",
                                                    gradientColor
                                                )}>
                                                    {sub.company.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-lg truncate">{sub.company}</h3>
                                                    <p className="text-sm text-muted-foreground">{sub.name}</p>
                                                    <Badge variant="outline" className="mt-1 text-xs">{sub.trade}</Badge>
                                                </div>
                                            </div>

                                            {/* Rating */}
                                            <div className="flex items-center gap-2 mt-4">
                                                <div className="flex">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={cn(
                                                                "w-4 h-4",
                                                                i < Math.floor(sub.rating) ? "text-amber-400 fill-amber-400" : "text-muted"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-medium">{sub.rating.toFixed(1)}</span>
                                                <span className="text-xs text-muted-foreground">({sub.totalJobsCompleted} jobs)</span>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="mt-4 space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                                    <span>{sub.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                                    <span className="truncate">{sub.email}</span>
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Rate</div>
                                                    <div className="text-sm font-semibold">${sub.hourlyRate}/hr</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Paid</div>
                                                    <div className="text-sm font-semibold">${totalSpent.toLocaleString()}</div>
                                                </div>
                                            </div>

                                            {/* License & Insurance */}
                                            {(sub.licenseNumber || sub.insuranceExpiry) && (
                                                <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                                                    {sub.licenseNumber && (
                                                        <Badge variant="outline" className="text-xs">
                                                            License: {sub.licenseNumber}
                                                        </Badge>
                                                    )}
                                                    {sub.insuranceExpiry && (
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "text-xs",
                                                                new Date(sub.insuranceExpiry) < new Date()
                                                                    ? "border-red-500 text-red-500"
                                                                    : new Date(sub.insuranceExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                                                        ? "border-amber-500 text-amber-500"
                                                                        : ""
                                                            )}
                                                        >
                                                            Ins: {sub.insuranceExpiry}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="mt-4 pt-4 border-t flex gap-2">
                                                <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.success('Opening contact...')}>
                                                    <Phone className="w-4 h-4 mr-1" />
                                                    Call
                                                </Button>
                                                <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.success('Creating invoice...')}>
                                                    <FileText className="w-4 h-4 mr-1" />
                                                    Invoice
                                                </Button>
                                                <Button variant="secondary" size="sm" onClick={() => toast.success('View profile...')}>
                                                    View
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    {/* Pending Tab */}
                    <TabsContent value="pending" className="space-y-4 mt-0">
                        {pendingInvoices.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-green-500">All Caught Up!</h3>
                                    <p className="text-muted-foreground">No invoices pending approval.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            pendingInvoices.map(invoice => {
                                const sub = subcontractors.find(s => s.id === invoice.subcontractorId);
                                const gradientColor = tradeColors[sub?.trade || ''] || tradeColors.default;

                                return (
                                    <Card key={invoice.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                        <CardContent className="pt-6">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                                {/* Subcontractor Info */}
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className={cn(
                                                        "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0",
                                                        gradientColor
                                                    )}>
                                                        {invoice.subcontractorName.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                                                            <Badge className={invoiceStatusConfig[invoice.status]?.className}>
                                                                {invoiceStatusConfig[invoice.status]?.label}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{invoice.subcontractorName}</p>
                                                        <Link href={`/projects/${invoice.projectId}`} className="text-sm text-primary hover:underline">
                                                            {invoice.projectName}
                                                        </Link>
                                                    </div>
                                                </div>

                                                {/* Amount & Dates */}
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold">${invoice.total.toLocaleString()}</div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                                            <Calendar className="w-3 h-3" />
                                                            Due: {invoice.dueDate}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => toast.info('View invoice details...')}
                                                        >
                                                            Review
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                            onClick={() => handleReject(invoice)}
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700"
                                                            onClick={() => handleApprove(invoice)}
                                                        >
                                                            <CheckCircle2 className="w-4 h-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Line Items */}
                                            <div className="mt-4 pt-4 border-t">
                                                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Line Items</div>
                                                <div className="space-y-1">
                                                    {invoice.items.slice(0, 3).map(item => (
                                                        <div key={item.id} className="flex items-center justify-between text-sm py-1">
                                                            <div className="flex items-center gap-2">
                                                                <span>{item.description}</span>
                                                                {item.phase && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {PHASE_CONFIGS[item.phase]?.icon} {PHASE_CONFIGS[item.phase]?.label}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <span className="font-medium">${item.total.toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                    {invoice.items.length > 3 && (
                                                        <div className="text-xs text-muted-foreground pt-1">
                                                            +{invoice.items.length - 3} more items
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            {invoice.notes && (
                                                <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm">
                                                    <span className="text-muted-foreground">Note: </span>
                                                    {invoice.notes}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </TabsContent>

                    {/* All Invoices Tab */}
                    <TabsContent value="invoices" className="mt-0">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base">All Invoices</CardTitle>
                                <Button variant="secondary" size="sm" onClick={() => toast.success('Create invoice...')}>
                                    <Plus className="w-4 h-4 mr-1" />
                                    New Invoice
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="text-left p-4 text-sm font-medium">Invoice</th>
                                                <th className="text-left p-4 text-sm font-medium">Subcontractor</th>
                                                <th className="text-left p-4 text-sm font-medium">Project</th>
                                                <th className="text-left p-4 text-sm font-medium">Status</th>
                                                <th className="text-right p-4 text-sm font-medium">Amount</th>
                                                <th className="text-left p-4 text-sm font-medium">Invoice Date</th>
                                                <th className="text-left p-4 text-sm font-medium">Due Date</th>
                                                <th className="text-right p-4 text-sm font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoices.map(inv => {
                                                const StatusIcon = invoiceStatusConfig[inv.status]?.icon || FileText;
                                                return (
                                                    <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                        <td className="p-4">
                                                            <div className="font-medium">{inv.invoiceNumber}</div>
                                                            <div className="text-xs text-muted-foreground">{inv.id}</div>
                                                        </td>
                                                        <td className="p-4 text-sm">{inv.subcontractorName}</td>
                                                        <td className="p-4">
                                                            <Link href={`/projects/${inv.projectId}`} className="text-sm text-primary hover:underline">
                                                                {inv.projectName}
                                                            </Link>
                                                        </td>
                                                        <td className="p-4">
                                                            <Badge className={cn("flex items-center gap-1 w-fit", invoiceStatusConfig[inv.status]?.className)}>
                                                                <StatusIcon className="w-3 h-3" />
                                                                {invoiceStatusConfig[inv.status]?.label}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <div className="font-bold">${inv.total.toLocaleString()}</div>
                                                        </td>
                                                        <td className="p-4 text-sm text-muted-foreground">{inv.invoiceDate}</td>
                                                        <td className="p-4 text-sm text-muted-foreground">{inv.dueDate}</td>
                                                        <td className="p-4 text-right">
                                                            <Button variant="ghost" size="sm" onClick={() => toast.info('View invoice...')}>
                                                                View
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
