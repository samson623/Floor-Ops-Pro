'use client';

import { useState, useMemo } from 'react';
import { useSmartBack } from '@/hooks/use-smart-back';
import { TopBar } from '@/components/top-bar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/components/data-provider';
import {
    InvoiceStatusBadge,
    InvoiceDetailModal,
    RecordPaymentModal,
    CreateInvoiceModal
} from '@/components/invoice-modals';
import { ClientInvoice, ClientInvoiceStatus, Project } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    DollarSign,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Search,
    Download,
    FileText,
    TrendingUp,
    ReceiptText,
    Building2,
    Calendar,
    Filter,
    Plus
} from 'lucide-react';

type TabFilter = 'all' | 'outstanding' | 'overdue' | 'paid' | 'draft';

export default function InvoicesPage() {
    const {
        getClientInvoices,
        getOutstandingInvoices,
        getOverdueInvoices,
        getProject,
        data
    } = useData();

    const [activeTab, setActiveTab] = useState<TabFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [projectFilter, setProjectFilter] = useState<string>('all');
    const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoice | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState<ClientInvoice | null>(null);
    const [showCreateModal, setShowCreateModal] = useState<Project | null>(null);

    // Record this page in navigation history for smart back navigation
    useSmartBack({ title: 'Invoices' });

    const allInvoices = getClientInvoices();
    const outstandingInvoices = getOutstandingInvoices();
    const overdueInvoices = getOverdueInvoices();

    // Statistics
    const stats = useMemo(() => {
        const outstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.balance, 0);
        const overdue = overdueInvoices.reduce((sum, inv) => sum + inv.balance, 0);
        const paid = allInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
        const draft = allInvoices.filter(inv => inv.status === 'draft').length;
        const retainageHeld = allInvoices.filter(inv => !inv.retainageReleased).reduce((sum, inv) => sum + inv.retainageAmount, 0);

        return { outstanding, overdue, paid, draft, retainageHeld };
    }, [allInvoices, outstandingInvoices, overdueInvoices]);

    // Filtered invoices
    const filteredInvoices = useMemo(() => {
        let invoices = [...allInvoices];

        // Filter by tab
        switch (activeTab) {
            case 'outstanding':
                invoices = invoices.filter(inv => ['sent', 'viewed', 'partial'].includes(inv.status));
                break;
            case 'overdue':
                const today = new Date().toISOString().split('T')[0];
                invoices = invoices.filter(inv =>
                    ['sent', 'viewed', 'partial'].includes(inv.status) && inv.dueDate < today
                );
                break;
            case 'paid':
                invoices = invoices.filter(inv => inv.status === 'paid');
                break;
            case 'draft':
                invoices = invoices.filter(inv => inv.status === 'draft');
                break;
        }

        // Filter by project
        if (projectFilter !== 'all') {
            invoices = invoices.filter(inv => inv.projectId === parseInt(projectFilter));
        }

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            invoices = invoices.filter(inv =>
                inv.invoiceNumber.toLowerCase().includes(query) ||
                inv.clientName.toLowerCase().includes(query) ||
                inv.projectName.toLowerCase().includes(query)
            );
        }

        // Sort by date (newest first)
        return invoices.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
    }, [allInvoices, activeTab, projectFilter, searchQuery]);

    // Unique projects for filter
    const projects = useMemo(() => {
        const projectIds = [...new Set(allInvoices.map(inv => inv.projectId))];
        return projectIds.map(id => {
            const project = getProject(id);
            return project ? { id, name: project.name } : { id, name: `Project ${id}` };
        });
    }, [allInvoices, getProject]);

    const handleExportAll = () => {
        const csvContent = [
            ['Invoice #', 'Client', 'Project', 'Type', 'Status', 'Date', 'Due Date', 'Total', 'Paid', 'Balance'],
            ...filteredInvoices.map(inv => [
                inv.invoiceNumber,
                inv.clientName,
                inv.projectName,
                inv.type,
                inv.status,
                inv.invoiceDate,
                inv.dueDate,
                inv.total,
                inv.amountPaid,
                inv.balance
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoices-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Invoices exported to CSV');
    };

    return (
        <>
            <TopBar
                title="Invoices"
                breadcrumb="Finance → Invoices"
                showNewProject={false}
            />

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        activeTab === 'outstanding' && "ring-2 ring-primary"
                    )} onClick={() => setActiveTab('outstanding')}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Outstanding</p>
                                    <p className="text-2xl font-bold text-amber-600">${stats.outstanding.toLocaleString()}</p>
                                </div>
                                <div className="p-3 rounded-full bg-amber-500/10">
                                    <Clock className="w-5 h-5 text-amber-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        activeTab === 'overdue' && "ring-2 ring-primary"
                    )} onClick={() => setActiveTab('overdue')}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Overdue</p>
                                    <p className="text-2xl font-bold text-red-600">${stats.overdue.toLocaleString()}</p>
                                </div>
                                <div className="p-3 rounded-full bg-red-500/10">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                </div>
                            </div>
                            {overdueInvoices.length > 0 && (
                                <p className="text-xs text-red-500 mt-2">{overdueInvoices.length} invoice(s) past due</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        activeTab === 'paid' && "ring-2 ring-primary"
                    )} onClick={() => setActiveTab('paid')}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Collected (YTD)</p>
                                    <p className="text-2xl font-bold text-green-600">${stats.paid.toLocaleString()}</p>
                                </div>
                                <div className="p-3 rounded-full bg-green-500/10">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Retainage Held</p>
                                    <p className="text-2xl font-bold text-blue-600">${stats.retainageHeld.toLocaleString()}</p>
                                </div>
                                <div className="p-3 rounded-full bg-blue-500/10">
                                    <Building2 className="w-5 h-5 text-blue-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        activeTab === 'draft' && "ring-2 ring-primary"
                    )} onClick={() => setActiveTab('draft')}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Drafts</p>
                                    <p className="text-2xl font-bold">{stats.draft}</p>
                                </div>
                                <div className="p-3 rounded-full bg-slate-500/10">
                                    <FileText className="w-5 h-5 text-slate-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters & Actions */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="flex flex-1 gap-3 w-full lg:w-auto">
                        <div className="relative flex-1 lg:max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search invoices..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={projectFilter} onValueChange={setProjectFilter}>
                            <SelectTrigger className="w-[200px]">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="All Projects" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Projects</SelectItem>
                                {projects.map(p => (
                                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExportAll}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Select onValueChange={(projectId) => {
                            const project = getProject(parseInt(projectId));
                            if (project) setShowCreateModal(project);
                        }}>
                            <SelectTrigger className="w-[180px]">
                                <Plus className="w-4 h-4 mr-2" />
                                <span>New Invoice</span>
                            </SelectTrigger>
                            <SelectContent>
                                {data.projects.filter(p => p.status === 'active' || p.status === 'scheduled').map(p => (
                                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabFilter)}>
                    <TabsList>
                        <TabsTrigger value="all">All ({allInvoices.length})</TabsTrigger>
                        <TabsTrigger value="outstanding" className="text-amber-600">
                            Outstanding ({outstandingInvoices.length})
                        </TabsTrigger>
                        <TabsTrigger value="overdue" className="text-red-600">
                            Overdue ({overdueInvoices.length})
                        </TabsTrigger>
                        <TabsTrigger value="paid" className="text-green-600">
                            Paid
                        </TabsTrigger>
                        <TabsTrigger value="draft">Draft</TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-4">
                        <Card>
                            <CardContent className="p-0">
                                {filteredInvoices.length > 0 ? (
                                    <div className="divide-y">
                                        {filteredInvoices.map(invoice => (
                                            <div
                                                key={invoice.id}
                                                className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                                onClick={() => setSelectedInvoice(invoice)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 rounded-lg bg-primary/10">
                                                        <ReceiptText className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono font-semibold">{invoice.invoiceNumber}</span>
                                                            <InvoiceStatusBadge status={invoice.status} />
                                                            <Badge variant="outline" className="text-xs">
                                                                {invoice.type}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {invoice.clientName} • {invoice.projectName}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            Due: {invoice.dueDate}
                                                        </div>
                                                        {invoice.retainageAmount > 0 && (
                                                            <div className="text-xs text-blue-500">
                                                                +${invoice.retainageAmount.toLocaleString()} retainage
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right min-w-[100px]">
                                                        <div className="text-lg font-bold">${invoice.total.toLocaleString()}</div>
                                                        {invoice.balance > 0 && invoice.balance < invoice.total && (
                                                            <div className="text-sm text-amber-600">
                                                                Bal: ${invoice.balance.toLocaleString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {invoice.status !== 'paid' && invoice.status !== 'void' && invoice.status !== 'draft' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowPaymentModal(invoice);
                                                            }}
                                                        >
                                                            <DollarSign className="w-4 h-4 mr-1" />
                                                            Pay
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <ReceiptText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p className="font-medium">No invoices found</p>
                                        <p className="text-sm">Try adjusting your filters or create a new invoice</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modals */}
            <InvoiceDetailModal
                open={!!selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
                invoice={selectedInvoice}
                onRecordPayment={(inv) => {
                    setSelectedInvoice(null);
                    setShowPaymentModal(inv);
                }}
            />

            <RecordPaymentModal
                open={!!showPaymentModal}
                onClose={() => setShowPaymentModal(null)}
                invoice={showPaymentModal}
            />

            {showCreateModal && (
                <CreateInvoiceModal
                    open={true}
                    onClose={() => setShowCreateModal(null)}
                    project={showCreateModal}
                />
            )}
        </>
    );
}
