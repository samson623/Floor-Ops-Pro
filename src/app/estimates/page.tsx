'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/top-bar';
import { useData } from '@/components/data-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ArrowLeft, Plus, FileText, Send, Check, X } from 'lucide-react';

const statusConfig = {
    draft: { label: 'Draft', icon: FileText, className: 'bg-muted text-muted-foreground' },
    sent: { label: 'Sent', icon: Send, className: 'bg-warning/10 text-warning' },
    approved: { label: 'Approved', icon: Check, className: 'bg-success/10 text-success' },
    rejected: { label: 'Rejected', icon: X, className: 'bg-destructive/10 text-destructive' },
};

type FilterType = 'all' | 'draft' | 'sent' | 'approved' | 'rejected';
type EstimateTab = 'takeoff' | 'labor' | 'proposal' | 'approval';

export default function EstimatesPage() {
    const router = useRouter();
    const { data, updateEstimate, convertEstimateToProject } = useData();
    const [filter, setFilter] = useState<FilterType>('all');
    const [selectedEstimate, setSelectedEstimate] = useState<number | null>(null);
    const [estimateTab, setEstimateTab] = useState<EstimateTab>('takeoff');

    const filteredEstimates = data.estimates.filter(e => {
        if (filter === 'all') return true;
        return e.status === filter;
    });

    const filters: { value: FilterType; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Sent' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
    ];

    const estimate = selectedEstimate ? data.estimates.find(e => e.id === selectedEstimate) : null;

    const handleSendEstimate = (id: number) => {
        const e = data.estimates.find(est => est.id === id);
        if (!e) return;
        updateEstimate(id, {
            status: 'sent',
            sentDate: new Date().toISOString().split('T')[0],
        });
        toast.success(`Estimate sent to ${e.contact}!`);
    };

    const handleApproveEstimate = (id: number) => {
        const e = data.estimates.find(est => est.id === id);
        if (!e) return;
        updateEstimate(id, {
            status: 'approved',
            approvedDate: new Date().toISOString().split('T')[0],
        });
        toast.success(`Estimate approved by ${e.contact}!`);
    };

    const handleConvertToProject = (id: number) => {
        convertEstimateToProject(id);
        toast.success('Project created from estimate!');
        setSelectedEstimate(null);
        router.push('/projects');
    };

    // Estimate Detail View
    if (estimate) {
        const totalSqft = estimate.rooms.reduce((sum, r) => sum + r.sqft, 0);
        const totalWithWaste = estimate.rooms.reduce((sum, r) => sum + (r.sqft * (1 + r.wastePercent / 100)), 0);
        const deposit = Math.ceil(estimate.totals.total * (estimate.depositPercent / 100));

        return (
            <>
                <TopBar
                    title={estimate.client}
                    breadcrumb={`Estimates → ${estimate.client}`}
                    showNewProject={false}
                />

                <div className="flex-1 overflow-y-auto">
                    {/* Hero Section */}
                    <div className="bg-gradient-to-br from-card via-card to-muted/30 border-b p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
                            <div>
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <Badge className={cn('text-sm', statusConfig[estimate.status]?.className)}>
                                        {estimate.status.toUpperCase()}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">📍 {estimate.address}</span>
                                    <span className="text-sm text-muted-foreground">👤 {estimate.contact}</span>
                                    <span className="text-sm text-muted-foreground">📧 {estimate.email}</span>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <Button variant="outline" onClick={() => setSelectedEstimate(null)}>
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                                {estimate.status === 'approved' && (
                                    <Button onClick={() => handleConvertToProject(estimate.id)}>
                                        ✨ Convert to Project
                                    </Button>
                                )}
                                {estimate.status === 'draft' && (
                                    <Button onClick={() => handleSendEstimate(estimate.id)}>
                                        📤 Send for Approval
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                            <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur">
                                <div className="text-2xl font-bold">{totalSqft.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">Total Sq Ft</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur">
                                <div className="text-2xl font-bold text-success">${(estimate.totals.materialsCost / 1000).toFixed(1)}K</div>
                                <div className="text-xs text-muted-foreground">Materials</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur">
                                <div className="text-2xl font-bold text-primary">${(estimate.totals.laborCost / 1000).toFixed(1)}K</div>
                                <div className="text-xs text-muted-foreground">Labor</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur">
                                <div className="text-2xl font-bold">{estimate.totals.margin}%</div>
                                <div className="text-xs text-muted-foreground">Margin</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur">
                                <div className="text-2xl font-bold text-success">${(estimate.totals.total / 1000).toFixed(1)}K</div>
                                <div className="text-xs text-muted-foreground">Total</div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={estimateTab} onValueChange={(v) => setEstimateTab(v as EstimateTab)} className="p-4 lg:p-6">
                        <TabsList className="mb-6">
                            <TabsTrigger value="takeoff">📐 Takeoff</TabsTrigger>
                            <TabsTrigger value="labor">👷 Labor</TabsTrigger>
                            <TabsTrigger value="proposal">📄 Proposal</TabsTrigger>
                            <TabsTrigger value="approval">✅ Approval</TabsTrigger>
                        </TabsList>

                        {/* Takeoff Tab */}
                        <TabsContent value="takeoff" className="space-y-4 mt-0">
                            <Button variant="secondary" size="sm" onClick={() => toast.success('Adding room...')}>
                                + Add Room
                            </Button>

                            <Card>
                                <CardHeader><CardTitle className="text-base">Room Measurements</CardTitle></CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b bg-muted/50">
                                                    <th className="text-left p-4 font-semibold">Room</th>
                                                    <th className="text-left p-4 font-semibold">Width (ft)</th>
                                                    <th className="text-left p-4 font-semibold">Length (ft)</th>
                                                    <th className="text-left p-4 font-semibold">Sq Ft</th>
                                                    <th className="text-left p-4 font-semibold">Material</th>
                                                    <th className="text-left p-4 font-semibold">Waste %</th>
                                                    <th className="text-left p-4 font-semibold">Total Needed</th>
                                                    <th className="text-left p-4 font-semibold">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {estimate.rooms.map((r, i) => (
                                                    <tr key={i} className="border-b last:border-0">
                                                        <td className="p-4 font-semibold">{r.name}</td>
                                                        <td className="p-4">{r.width}</td>
                                                        <td className="p-4">{r.length}</td>
                                                        <td className="p-4 font-bold">{r.sqft}</td>
                                                        <td className="p-4">{r.material}</td>
                                                        <td className="p-4">{r.wastePercent}%</td>
                                                        <td className="p-4 font-bold">{Math.ceil(r.sqft * (1 + r.wastePercent / 100))}</td>
                                                        <td className="p-4">
                                                            <Button variant="secondary" size="sm" onClick={() => toast.success('Editing...')}>Edit</Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-muted/50 font-bold">
                                                    <td colSpan={3} className="p-4">TOTALS</td>
                                                    <td className="p-4">{totalSqft.toLocaleString()}</td>
                                                    <td className="p-4">—</td>
                                                    <td className="p-4">—</td>
                                                    <td className="p-4">{Math.ceil(totalWithWaste).toLocaleString()}</td>
                                                    <td className="p-4">—</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle className="text-base">Materials Breakdown</CardTitle></CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b bg-muted/50">
                                                    <th className="text-left p-4 font-semibold">Material</th>
                                                    <th className="text-left p-4 font-semibold">Sq Ft / Qty</th>
                                                    <th className="text-left p-4 font-semibold">Price</th>
                                                    <th className="text-left p-4 font-semibold">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {estimate.materials.map((m, i) => (
                                                    <tr key={i} className="border-b last:border-0">
                                                        <td className="p-4 font-semibold">{m.name}</td>
                                                        <td className="p-4">{m.sqft ? m.sqft + ' sf' : m.qty + ' units'}</td>
                                                        <td className="p-4">${m.pricePerSqft ? m.pricePerSqft.toFixed(2) + '/sf' : m.pricePerUnit?.toFixed(2) + '/unit'}</td>
                                                        <td className="p-4 text-success font-bold">${m.total.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-muted/50 font-bold">
                                                    <td colSpan={3} className="p-4">MATERIALS TOTAL</td>
                                                    <td className="p-4 text-success">${estimate.totals.materialsCost.toLocaleString()}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Labor Tab */}
                        <TabsContent value="labor" className="space-y-4 mt-0">
                            <Button variant="secondary" size="sm" onClick={() => toast.success('Adding labor item...')}>
                                + Add Labor Item
                            </Button>

                            <Card>
                                <CardHeader><CardTitle className="text-base">Labor Calculator</CardTitle></CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b bg-muted/50">
                                                    <th className="text-left p-4 font-semibold">Type</th>
                                                    <th className="text-left p-4 font-semibold">Quantity</th>
                                                    <th className="text-left p-4 font-semibold">Rate</th>
                                                    <th className="text-left p-4 font-semibold">Total</th>
                                                    <th className="text-left p-4 font-semibold">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {estimate.labor.map((l, i) => (
                                                    <tr key={i} className="border-b last:border-0">
                                                        <td className="p-4 font-semibold">{l.type}</td>
                                                        <td className="p-4">{l.hours ? l.hours + ' hrs' : l.sqft ? l.sqft + ' sf' : l.trips + ' trips'}</td>
                                                        <td className="p-4">${l.rate ? l.rate.toFixed(2) + '/hr' : l.ratePerSqft?.toFixed(2) + '/sf'}</td>
                                                        <td className="p-4 text-primary font-bold">${l.total.toLocaleString()}</td>
                                                        <td className="p-4">
                                                            <Button variant="secondary" size="sm" onClick={() => toast.success('Editing...')}>Edit</Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-muted/50 font-bold">
                                                    <td colSpan={3} className="p-4">LABOR TOTAL</td>
                                                    <td className="p-4 text-primary">${estimate.totals.laborCost.toLocaleString()}</td>
                                                    <td className="p-4">—</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-xs text-muted-foreground">Materials Cost</div>
                                        <div className="text-2xl font-bold">${estimate.totals.materialsCost.toLocaleString()}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-xs text-muted-foreground">Labor Cost</div>
                                        <div className="text-2xl font-bold">${estimate.totals.laborCost.toLocaleString()}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-xs text-muted-foreground">Subtotal</div>
                                        <div className="text-2xl font-bold">${estimate.totals.subtotal.toLocaleString()}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-xs text-muted-foreground">With {estimate.totals.margin}% Margin</div>
                                        <div className="text-2xl font-bold text-success">${estimate.totals.total.toLocaleString()}</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Proposal Tab */}
                        <TabsContent value="proposal" className="space-y-4 mt-0">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-base">Client Proposal</CardTitle>
                                    <Button variant="secondary" size="sm" onClick={() => toast.success('Generating PDF...')}>
                                        📥 Export PDF
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="max-w-2xl mx-auto p-6 bg-white text-black rounded-xl">
                                        <div className="text-center mb-8">
                                            <h2 className="text-2xl font-bold">FloorOps Pro</h2>
                                            <p className="text-gray-500">Professional Flooring Installation</p>
                                        </div>

                                        <div className="mb-8">
                                            <h3 className="text-lg font-bold mb-4">Proposal For:</h3>
                                            <div className="bg-gray-100 p-4 rounded-lg">
                                                <p className="font-bold">{estimate.client}</p>
                                                <p>{estimate.address}</p>
                                                <p>Contact: {estimate.contact}</p>
                                                <p>Phone: {estimate.phone}</p>
                                                <p>Email: {estimate.email}</p>
                                            </div>
                                        </div>

                                        <div className="mb-8">
                                            <h3 className="text-lg font-bold mb-4">Scope of Work</h3>
                                            {estimate.rooms.map((r, i) => (
                                                <div key={i} className="mb-3 p-3 bg-gray-50 border-l-4 border-primary rounded">
                                                    <strong>{r.name}</strong> — {r.sqft} sq ft — {r.material}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mb-8">
                                            <h3 className="text-lg font-bold mb-4">Investment Breakdown</h3>
                                            <table className="w-full">
                                                <tbody>
                                                    <tr className="border-b">
                                                        <td className="py-3 font-bold">Materials</td>
                                                        <td className="py-3 text-right">${estimate.totals.materialsCost.toLocaleString()}</td>
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="py-3 font-bold">Labor & Installation</td>
                                                        <td className="py-3 text-right">${estimate.totals.laborCost.toLocaleString()}</td>
                                                    </tr>
                                                    <tr className="border-b-2 border-black">
                                                        <td className="py-3 font-bold text-lg">Total Investment</td>
                                                        <td className="py-3 text-right font-bold text-lg text-green-600">${estimate.totals.total.toLocaleString()}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="mb-8">
                                            <h3 className="text-lg font-bold mb-4">Payment Terms</h3>
                                            <div className="bg-gray-100 p-4 rounded-lg">
                                                <p><strong>Deposit ({estimate.depositPercent}%):</strong> ${deposit.toLocaleString()}</p>
                                                <p><strong>Balance:</strong> ${(estimate.totals.total - deposit).toLocaleString()}</p>
                                                <p className="text-sm text-gray-500 mt-2">Deposit due upon contract signing. Balance due upon project completion.</p>
                                            </div>
                                        </div>

                                        {estimate.notes && (
                                            <div className="mb-8">
                                                <h3 className="text-lg font-bold mb-4">Notes</h3>
                                                <p className="text-gray-600">{estimate.notes}</p>
                                            </div>
                                        )}

                                        <div className="text-center pt-6 border-t">
                                            <p className="text-gray-500 text-sm">Thank you for considering FloorOps Pro!</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Approval Tab */}
                        <TabsContent value="approval" className="space-y-4 mt-0">
                            <div className="grid lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader><CardTitle className="text-base">Approval Status</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8">
                                            <div className="text-6xl mb-4">
                                                {estimate.status === 'approved' ? '✅' : estimate.status === 'sent' ? '⏳' : '📝'}
                                            </div>
                                            <h3 className="text-2xl font-bold mb-2">
                                                {estimate.status === 'approved' ? 'Approved!' : estimate.status === 'sent' ? 'Awaiting Approval' : 'Draft'}
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {estimate.status === 'approved' ? `Client approved on ${estimate.approvedDate}` :
                                                    estimate.status === 'sent' ? `Sent to client on ${estimate.sentDate}` :
                                                        'Complete the estimate and send for approval'}
                                            </p>
                                        </div>

                                        {estimate.status === 'draft' && (
                                            <Button className="w-full" onClick={() => handleSendEstimate(estimate.id)}>
                                                📤 Send for Approval
                                            </Button>
                                        )}

                                        {estimate.status === 'sent' && (
                                            <div className="flex gap-2">
                                                <Button variant="secondary" className="flex-1" onClick={() => toast.success('Reminder sent!')}>
                                                    📧 Send Reminder
                                                </Button>
                                                <Button className="flex-1" onClick={() => handleApproveEstimate(estimate.id)}>
                                                    ✅ Mark Approved
                                                </Button>
                                            </div>
                                        )}

                                        {estimate.status === 'approved' && (
                                            <Button className="w-full" onClick={() => handleConvertToProject(estimate.id)}>
                                                ✨ Convert to Project
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex gap-4">
                                                <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-success-foreground text-xs">✓</div>
                                                <div>
                                                    <div className="font-semibold">Estimate Created</div>
                                                    <div className="text-sm text-muted-foreground">{estimate.createdDate}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className={cn(
                                                    'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                                                    estimate.sentDate ? 'bg-success text-success-foreground' : 'bg-muted border-2 border-border'
                                                )}>
                                                    {estimate.sentDate ? '✓' : '○'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold">Sent to Client</div>
                                                    <div className="text-sm text-muted-foreground">{estimate.sentDate || 'Pending'}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className={cn(
                                                    'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                                                    estimate.approvedDate ? 'bg-success text-success-foreground' : 'bg-muted border-2 border-border'
                                                )}>
                                                    {estimate.approvedDate ? '✓' : '○'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold">Client Approval</div>
                                                    <div className="text-sm text-muted-foreground">{estimate.approvedDate || 'Pending'}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="w-6 h-6 rounded-full bg-muted border-2 border-border flex items-center justify-center text-xs">○</div>
                                                <div>
                                                    <div className="font-semibold">Convert to Project</div>
                                                    <div className="text-sm text-muted-foreground">Pending</div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </>
        );
    }

    // Estimates List View
    return (
        <>
            <TopBar
                title="Estimates"
                breadcrumb="Sales Pipeline"
                showNewProject={false}
            >
                <Button onClick={() => toast.info('New estimate form coming soon')} className="hidden sm:flex">
                    <Plus className="w-4 h-4 mr-2" />
                    New Estimate
                </Button>
            </TopBar>

            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                {/* Pipeline Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-primary/5 to-transparent">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{data.estimates.length}</div>
                            <div className="text-sm text-muted-foreground">Total Estimates</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-warning/5 to-transparent">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-warning">
                                ${(data.estimates.filter(e => e.status === 'sent').reduce((s, e) => s + e.totals.total, 0) / 1000).toFixed(0)}K
                            </div>
                            <div className="text-sm text-muted-foreground">Pending Value</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-success/5 to-transparent">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-success">
                                ${(data.estimates.filter(e => e.status === 'approved').reduce((s, e) => s + e.totals.total, 0) / 1000).toFixed(0)}K
                            </div>
                            <div className="text-sm text-muted-foreground">Won Value</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">
                                {Math.round((data.estimates.filter(e => e.status === 'approved').length / Math.max(data.estimates.length, 1)) * 100)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Win Rate</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                    {filters.map(f => (
                        <Button
                            key={f.value}
                            variant={filter === f.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter(f.value)}
                        >
                            {f.label}
                            {f.value !== 'all' && (
                                <span className="ml-2 opacity-60">
                                    ({data.estimates.filter(e => e.status === f.value).length})
                                </span>
                            )}
                        </Button>
                    ))}
                </div>

                {/* Estimates List */}
                <div className="grid gap-4">
                    {filteredEstimates.map(est => {
                        const status = statusConfig[est.status];
                        const StatusIcon = status.icon;

                        return (
                            <Card key={est.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedEstimate(est.id)}>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg truncate">{est.client}</h3>
                                                <Badge className={cn('shrink-0', status.className)}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {status.label}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{est.address}</p>
                                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                <span>👤 {est.contact}</span>
                                                <span>📧 {est.email}</span>
                                                <span>📅 Created: {est.createdDate}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-2xl font-bold">${est.totals.total.toLocaleString()}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {est.rooms.reduce((s, r) => s + r.sqft, 0).toLocaleString()} sq ft • {est.totals.margin}% margin
                                                </div>
                                            </div>
                                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                {est.status === 'approved' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleConvertToProject(est.id)}
                                                    >
                                                        Convert to Project
                                                    </Button>
                                                )}
                                                {est.status === 'draft' && (
                                                    <Button size="sm" variant="outline" onClick={() => handleSendEstimate(est.id)}>
                                                        <Send className="w-4 h-4 mr-1" />
                                                        Send
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="ghost" onClick={() => setSelectedEstimate(est.id)}>
                                                    View
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filteredEstimates.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No estimates found with the selected filter.</p>
                    </div>
                )}
            </div>
        </>
    );
}
