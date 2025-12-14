'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/top-bar';
import { useData } from '@/components/data-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Plus, FileText, Send, Check, X } from 'lucide-react';

const statusConfig = {
    draft: { label: 'Draft', icon: FileText, className: 'bg-muted text-muted-foreground' },
    sent: { label: 'Sent', icon: Send, className: 'bg-warning/10 text-warning' },
    approved: { label: 'Approved', icon: Check, className: 'bg-success/10 text-success' },
    rejected: { label: 'Rejected', icon: X, className: 'bg-destructive/10 text-destructive' },
};

type FilterType = 'all' | 'draft' | 'sent' | 'approved' | 'rejected';

export default function EstimatesPage() {
    const { data, convertEstimateToProject } = useData();
    const [filter, setFilter] = useState<FilterType>('all');

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
                    {filteredEstimates.map(estimate => {
                        const status = statusConfig[estimate.status];
                        const StatusIcon = status.icon;

                        return (
                            <Card key={estimate.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg truncate">{estimate.client}</h3>
                                                <Badge className={cn('shrink-0', status.className)}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {status.label}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{estimate.address}</p>
                                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                <span>👤 {estimate.contact}</span>
                                                <span>📧 {estimate.email}</span>
                                                <span>📅 Created: {estimate.createdDate}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-2xl font-bold">${estimate.totals.total.toLocaleString()}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {estimate.rooms.reduce((s, r) => s + r.sqft, 0).toLocaleString()} sq ft • {estimate.totals.margin}% margin
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {estimate.status === 'approved' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            convertEstimateToProject(estimate.id);
                                                            toast.success('Estimate converted to project!');
                                                        }}
                                                    >
                                                        Convert to Project
                                                    </Button>
                                                )}
                                                {estimate.status === 'draft' && (
                                                    <Button size="sm" variant="outline" onClick={() => toast.info('Send functionality coming soon')}>
                                                        <Send className="w-4 h-4 mr-1" />
                                                        Send
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="ghost" onClick={() => toast.info('Estimate detail view coming soon')}>
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
