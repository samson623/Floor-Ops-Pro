'use client';

import { useState, useMemo } from 'react';
import { TopBar } from '@/components/top-bar';
import { useData } from '@/components/data-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PHASE_CONFIGS, ProfitLeakAlert, ProjectBudget } from '@/lib/data';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Clock,
    Users,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Briefcase,
    PieChart,
    BarChart3,
    Zap,
    FileText,
    Building2
} from 'lucide-react';
import Link from 'next/link';

type TabType = 'overview' | 'labor' | 'subcontractors' | 'alerts';

const severityConfig = {
    info: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', icon: Zap },
    warning: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', icon: AlertTriangle },
    critical: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', icon: XCircle },
};

const invoiceStatusConfig = {
    draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
    submitted: { label: 'Submitted', className: 'bg-blue-500/10 text-blue-500' },
    'pending-approval': { label: 'Pending', className: 'bg-amber-500/10 text-amber-500' },
    approved: { label: 'Approved', className: 'bg-green-500/10 text-green-500' },
    rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-500' },
    paid: { label: 'Paid', className: 'bg-emerald-500/10 text-emerald-500' },
    disputed: { label: 'Disputed', className: 'bg-orange-500/10 text-orange-500' },
};

export default function BudgetPage() {
    const { data, getProjectBudget, getProfitLeakAlerts, acknowledgeAlert, approveInvoice, getLaborSummary, isLoaded } = useData();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [selectedProject, setSelectedProject] = useState<number | null>(null);

    // Aggregate metrics
    const metrics = useMemo(() => {
        const budgets = data.projectBudgets || [];
        const alerts = data.profitLeakAlerts || [];
        const invoices = data.subcontractorInvoices || [];
        const laborEntries = data.laborEntries || [];

        const totalRevenue = budgets.reduce((sum, b) => sum + b.totalRevenue, 0);
        const totalActualCost = budgets.reduce((sum, b) => sum + b.actualCost, 0);
        const totalProjectedCost = budgets.reduce((sum, b) => sum + b.projectedCost, 0);
        const avgMargin = budgets.length > 0 ? budgets.reduce((sum, b) => sum + b.currentMargin, 0) / budgets.length : 0;
        const avgProjectedMargin = budgets.length > 0 ? budgets.reduce((sum, b) => sum + b.projectedMargin, 0) / budgets.length : 0;

        const activeAlerts = alerts.filter(a => !a.resolvedAt);
        const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
        const pendingInvoices = invoices.filter(inv => inv.status === 'pending-approval' || inv.status === 'submitted');
        const pendingInvoiceValue = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);

        const totalLaborHours = laborEntries.reduce((sum, e) => sum + e.regularHours + e.overtimeHours, 0);
        const totalLaborCost = laborEntries.reduce((sum, e) => sum + e.totalCost, 0);
        const overtimeHours = laborEntries.reduce((sum, e) => sum + e.overtimeHours, 0);
        const overtimePercent = totalLaborHours > 0 ? (overtimeHours / totalLaborHours) * 100 : 0;

        return {
            totalRevenue,
            totalActualCost,
            totalProjectedCost,
            grossProfit: totalRevenue - totalProjectedCost,
            avgMargin,
            avgProjectedMargin,
            activeAlerts,
            criticalAlerts,
            pendingInvoices,
            pendingInvoiceValue,
            totalLaborHours,
            totalLaborCost,
            overtimeHours,
            overtimePercent,
        };
    }, [data]);

    const activeProjects = data.projects.filter(p => p.status === 'active' || p.status === 'scheduled');

    if (!isLoaded) {
        return (
            <>
                <TopBar title="Budgeting & Job Costing" breadcrumb="Finance → Budget" showNewProject={false} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse text-muted-foreground">Loading budget data...</div>
                </div>
            </>
        );
    }

    return (
        <>
            <TopBar title="Budgeting & Job Costing" breadcrumb="Finance → Budget" showNewProject={false} />

            <div className="flex-1 overflow-y-auto">
                {/* Hero Stats Section */}
                <div className="bg-gradient-to-br from-card via-card to-primary/5 border-b p-4 lg:p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {/* Total Pipeline Revenue */}
                        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                            <CardContent className="pt-4 pb-3">
                                <div className="flex items-center gap-2 text-emerald-500 mb-1">
                                    <DollarSign className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">Revenue</span>
                                </div>
                                <div className="text-2xl font-bold text-emerald-500">${(metrics.totalRevenue / 1000).toFixed(1)}K</div>
                                <div className="text-xs text-muted-foreground mt-1">Contract + COs</div>
                            </CardContent>
                        </Card>

                        {/* Actual Costs */}
                        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                            <CardContent className="pt-4 pb-3">
                                <div className="flex items-center gap-2 text-blue-500 mb-1">
                                    <BarChart3 className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">Spent</span>
                                </div>
                                <div className="text-2xl font-bold text-blue-500">${(metrics.totalActualCost / 1000).toFixed(1)}K</div>
                                <div className="text-xs text-muted-foreground mt-1">Actual costs</div>
                            </CardContent>
                        </Card>

                        {/* Gross Profit */}
                        <Card className={cn(
                            "bg-gradient-to-br border",
                            metrics.grossProfit >= 0
                                ? "from-green-500/10 to-green-600/5 border-green-500/20"
                                : "from-red-500/10 to-red-600/5 border-red-500/20"
                        )}>
                            <CardContent className="pt-4 pb-3">
                                <div className={cn("flex items-center gap-2 mb-1", metrics.grossProfit >= 0 ? "text-green-500" : "text-red-500")}>
                                    {metrics.grossProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    <span className="text-xs font-medium uppercase tracking-wide">Profit</span>
                                </div>
                                <div className={cn("text-2xl font-bold", metrics.grossProfit >= 0 ? "text-green-500" : "text-red-500")}>
                                    ${Math.abs(metrics.grossProfit / 1000).toFixed(1)}K
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">Projected</div>
                            </CardContent>
                        </Card>

                        {/* Average Margin */}
                        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                            <CardContent className="pt-4 pb-3">
                                <div className="flex items-center gap-2 text-purple-500 mb-1">
                                    <PieChart className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">Margin</span>
                                </div>
                                <div className="text-2xl font-bold text-purple-500">{metrics.avgProjectedMargin.toFixed(1)}%</div>
                                <div className="text-xs text-muted-foreground mt-1">Avg projected</div>
                            </CardContent>
                        </Card>

                        {/* Alert Count */}
                        <Card className={cn(
                            "bg-gradient-to-br border",
                            metrics.criticalAlerts.length > 0
                                ? "from-red-500/10 to-red-600/5 border-red-500/20"
                                : metrics.activeAlerts.length > 0
                                    ? "from-amber-500/10 to-amber-600/5 border-amber-500/20"
                                    : "from-green-500/10 to-green-600/5 border-green-500/20"
                        )}>
                            <CardContent className="pt-4 pb-3">
                                <div className={cn("flex items-center gap-2 mb-1",
                                    metrics.criticalAlerts.length > 0 ? "text-red-500" :
                                        metrics.activeAlerts.length > 0 ? "text-amber-500" : "text-green-500"
                                )}>
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">Alerts</span>
                                </div>
                                <div className={cn("text-2xl font-bold",
                                    metrics.criticalAlerts.length > 0 ? "text-red-500" :
                                        metrics.activeAlerts.length > 0 ? "text-amber-500" : "text-green-500"
                                )}>
                                    {metrics.activeAlerts.length}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {metrics.criticalAlerts.length > 0 ? `${metrics.criticalAlerts.length} critical` : 'Active'}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pending Invoices */}
                        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                            <CardContent className="pt-4 pb-3">
                                <div className="flex items-center gap-2 text-orange-500 mb-1">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-xs font-medium uppercase tracking-wide">Pending</span>
                                </div>
                                <div className="text-2xl font-bold text-orange-500">{metrics.pendingInvoices.length}</div>
                                <div className="text-xs text-muted-foreground mt-1">${metrics.pendingInvoiceValue.toLocaleString()}</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="p-4 lg:p-6">
                    <TabsList className="flex flex-nowrap overflow-x-auto h-auto gap-1 mb-6 bg-muted/50 p-1 mobile-tabs lg:flex-wrap">
                        <TabsTrigger value="overview" className="data-[state=active]:shadow-sm">📊 Overview</TabsTrigger>
                        <TabsTrigger value="labor" className="relative">
                            👷 Labor
                            <Badge className="ml-1.5 h-5 px-1.5 bg-blue-500/20 text-blue-500 text-xs">
                                {metrics.totalLaborHours.toFixed(0)}h
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="subcontractors" className="relative">
                            🏗️ Subcontractors
                            {metrics.pendingInvoices.length > 0 && (
                                <Badge className="ml-1.5 h-5 px-1.5 bg-amber-500/20 text-amber-500 text-xs">
                                    {metrics.pendingInvoices.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="alerts" className="relative">
                            🚨 Profit Leaks
                            {metrics.activeAlerts.length > 0 && (
                                <Badge className={cn(
                                    "ml-1.5 h-5 px-1.5 text-xs",
                                    metrics.criticalAlerts.length > 0 ? "bg-red-500 text-white" : "bg-amber-500/20 text-amber-500"
                                )}>
                                    {metrics.activeAlerts.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6 mt-0">
                        {/* Project Budget Cards */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            {activeProjects.map(project => {
                                const budget = getProjectBudget(project.id);
                                const alerts = getProfitLeakAlerts(project.id).filter(a => !a.resolvedAt);
                                const laborSummary = getLaborSummary(project.id);

                                if (!budget) return null;

                                const marginHealth = budget.projectedMargin >= budget.targetMargin ? 'healthy' :
                                    budget.projectedMargin >= budget.targetMargin - 5 ? 'warning' : 'critical';

                                return (
                                    <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                        <CardHeader className="pb-2 bg-gradient-to-r from-muted/50 to-transparent">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-lg">{project.name}</CardTitle>
                                                    <p className="text-sm text-muted-foreground">{project.client}</p>
                                                </div>
                                                <Link href={`/projects/${project.id}?tab=financials`}>
                                                    <Button variant="ghost" size="sm">
                                                        View Details <ArrowRight className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4 space-y-4">
                                            {/* Financial Overview */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                                                <div className="text-center p-2 rounded-lg bg-muted/50">
                                                    <div className="text-sm font-bold">${(budget.totalRevenue / 1000).toFixed(1)}K</div>
                                                    <div className="text-xs text-muted-foreground">Revenue</div>
                                                </div>
                                                <div className="text-center p-2 rounded-lg bg-muted/50">
                                                    <div className="text-sm font-bold">${(budget.actualCost / 1000).toFixed(1)}K</div>
                                                    <div className="text-xs text-muted-foreground">Spent</div>
                                                </div>
                                                <div className="text-center p-2 rounded-lg bg-muted/50">
                                                    <div className="text-sm font-bold">${(budget.projectedCost / 1000).toFixed(1)}K</div>
                                                    <div className="text-xs text-muted-foreground">Projected</div>
                                                </div>
                                                <div className={cn(
                                                    "text-center p-2 rounded-lg",
                                                    marginHealth === 'healthy' ? 'bg-green-500/10' :
                                                        marginHealth === 'warning' ? 'bg-amber-500/10' : 'bg-red-500/10'
                                                )}>
                                                    <div className={cn(
                                                        "text-sm font-bold",
                                                        marginHealth === 'healthy' ? 'text-green-500' :
                                                            marginHealth === 'warning' ? 'text-amber-500' : 'text-red-500'
                                                    )}>
                                                        {budget.projectedMargin.toFixed(1)}%
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Margin</div>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-muted-foreground">Budget Burn</span>
                                                    <span className="font-medium">{((budget.actualCost / budget.estimatedCost) * 100).toFixed(0)}%</span>
                                                </div>
                                                <Progress
                                                    value={Math.min((budget.actualCost / budget.estimatedCost) * 100, 100)}
                                                    className="h-2"
                                                />
                                            </div>

                                            {/* Phase Breakdown Mini */}
                                            <div className="flex gap-1 overflow-x-auto pb-1">
                                                {budget.phaseBudgets.slice(0, 5).map(phase => (
                                                    <Badge
                                                        key={phase.phase}
                                                        variant="outline"
                                                        className={cn(
                                                            "shrink-0 text-xs",
                                                            phase.status === 'on-budget' ? 'border-green-500/30 text-green-500' :
                                                                phase.status === 'warning' ? 'border-amber-500/30 text-amber-500' :
                                                                    'border-red-500/30 text-red-500'
                                                        )}
                                                    >
                                                        {PHASE_CONFIGS[phase.phase]?.icon} {PHASE_CONFIGS[phase.phase]?.label || phase.phase}
                                                    </Badge>
                                                ))}
                                            </div>

                                            {/* Alerts Strip */}
                                            {alerts.length > 0 && (
                                                <div className={cn(
                                                    "flex items-center gap-2 p-2 rounded-lg text-xs",
                                                    alerts.some(a => a.severity === 'critical') ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                                                )}>
                                                    <AlertTriangle className="w-4 h-4" />
                                                    <span className="font-medium">{alerts.length} alert{alerts.length > 1 ? 's' : ''}</span>
                                                    <span className="text-muted-foreground">—</span>
                                                    <span className="truncate">{alerts[0].title}</span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    {/* Labor Tab */}
                    <TabsContent value="labor" className="space-y-6 mt-0">
                        {/* Labor Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm">Total Hours</span>
                                    </div>
                                    <div className="text-2xl font-bold">{metrics.totalLaborHours.toFixed(1)}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <DollarSign className="w-4 h-4" />
                                        <span className="text-sm">Labor Cost</span>
                                    </div>
                                    <div className="text-2xl font-bold">${metrics.totalLaborCost.toLocaleString()}</div>
                                </CardContent>
                            </Card>
                            <Card className={cn(metrics.overtimePercent > 10 && "border-amber-500/50")}>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-sm">Overtime</span>
                                    </div>
                                    <div className={cn("text-2xl font-bold", metrics.overtimePercent > 10 ? "text-amber-500" : "")}>
                                        {metrics.overtimeHours.toFixed(1)}h
                                    </div>
                                    <div className="text-xs text-muted-foreground">{metrics.overtimePercent.toFixed(1)}% of total</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <Users className="w-4 h-4" />
                                        <span className="text-sm">Workers</span>
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {new Set((data.laborEntries || []).map(e => e.workerId)).size}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Labor Entries */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base">Recent Labor Entries</CardTitle>
                                <Button variant="secondary" size="sm" onClick={() => toast.success('Opening labor entry form...')}>
                                    + Add Entry
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="text-left p-3 text-sm font-medium">Date</th>
                                                <th className="text-left p-3 text-sm font-medium">Worker</th>
                                                <th className="text-left p-3 text-sm font-medium">Project</th>
                                                <th className="text-left p-3 text-sm font-medium">Phase</th>
                                                <th className="text-right p-3 text-sm font-medium">Reg</th>
                                                <th className="text-right p-3 text-sm font-medium">OT</th>
                                                <th className="text-right p-3 text-sm font-medium">Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(data.laborEntries || []).slice(0, 10).map(entry => {
                                                const project = data.projects.find(p => p.id === entry.projectId);
                                                return (
                                                    <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30">
                                                        <td className="p-3 text-sm">{entry.date}</td>
                                                        <td className="p-3">
                                                            <div className="text-sm font-medium">{entry.workerName}</div>
                                                            <div className="text-xs text-muted-foreground capitalize">{entry.role}</div>
                                                        </td>
                                                        <td className="p-3 text-sm">{project?.name || 'Unknown'}</td>
                                                        <td className="p-3">
                                                            <Badge variant="outline" className="text-xs">
                                                                {PHASE_CONFIGS[entry.phase]?.icon} {PHASE_CONFIGS[entry.phase]?.label || entry.phase}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-3 text-right text-sm">{entry.regularHours}h</td>
                                                        <td className={cn("p-3 text-right text-sm", entry.overtimeHours > 0 && "text-amber-500 font-medium")}>
                                                            {entry.overtimeHours > 0 ? `${entry.overtimeHours}h` : '-'}
                                                        </td>
                                                        <td className="p-3 text-right text-sm font-medium">${entry.totalCost.toLocaleString()}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Subcontractors Tab */}
                    <TabsContent value="subcontractors" className="space-y-6 mt-0">
                        {/* Pending Approvals */}
                        {metrics.pendingInvoices.length > 0 && (
                            <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                                        Pending Approvals ({metrics.pendingInvoices.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {metrics.pendingInvoices.map(inv => (
                                        <div key={inv.id} className="flex items-center justify-between p-4 rounded-lg bg-background border hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                                                    {inv.subcontractorName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{inv.subcontractorName}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {inv.invoiceNumber} • {inv.projectName}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="text-lg font-bold">${inv.total.toLocaleString()}</div>
                                                    <div className="text-xs text-muted-foreground">Due: {inv.dueDate}</div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => toast.info('View invoice details...')}
                                                    >
                                                        Review
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => {
                                                            approveInvoice(inv.id, 'Derek Morrison');
                                                            toast.success(`Invoice ${inv.invoiceNumber} approved!`);
                                                        }}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Subcontractor Directory */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base">Subcontractor Directory</CardTitle>
                                <Button variant="secondary" size="sm" onClick={() => toast.success('Add subcontractor...')}>
                                    + Add Subcontractor
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(data.subcontractors || []).map(sub => (
                                        <div key={sub.id} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-lg">
                                                    {sub.company.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">{sub.company}</div>
                                                    <div className="text-sm text-muted-foreground">{sub.trade}</div>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <span key={i} className={cn("text-xs", i < Math.floor(sub.rating) ? "text-amber-400" : "text-muted")}>★</span>
                                                        ))}
                                                        <span className="text-xs text-muted-foreground ml-1">({sub.totalJobsCompleted} jobs)</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t flex justify-between items-center">
                                                <div className="text-sm text-muted-foreground">${sub.hourlyRate}/hr</div>
                                                <Button variant="ghost" size="sm">Contact</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* All Invoices */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">All Invoices</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="text-left p-3 text-sm font-medium">Invoice</th>
                                                <th className="text-left p-3 text-sm font-medium">Subcontractor</th>
                                                <th className="text-left p-3 text-sm font-medium">Project</th>
                                                <th className="text-left p-3 text-sm font-medium">Status</th>
                                                <th className="text-right p-3 text-sm font-medium">Amount</th>
                                                <th className="text-left p-3 text-sm font-medium">Due</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(data.subcontractorInvoices || []).map(inv => (
                                                <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30">
                                                    <td className="p-3 text-sm font-medium">{inv.invoiceNumber}</td>
                                                    <td className="p-3 text-sm">{inv.subcontractorName}</td>
                                                    <td className="p-3 text-sm">{inv.projectName}</td>
                                                    <td className="p-3">
                                                        <Badge className={invoiceStatusConfig[inv.status]?.className || ''}>
                                                            {invoiceStatusConfig[inv.status]?.label || inv.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 text-right text-sm font-medium">${inv.total.toLocaleString()}</td>
                                                    <td className="p-3 text-sm text-muted-foreground">{inv.dueDate}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Alerts Tab */}
                    <TabsContent value="alerts" className="space-y-6 mt-0">
                        {/* Active Alerts Summary */}
                        <div className="grid grid-cols-3 gap-2 md:gap-4">
                            <Card className="border-red-500/30 bg-red-500/5">
                                <CardContent className="pt-4 text-center">
                                    <div className="text-3xl font-bold text-red-500">{metrics.criticalAlerts.length}</div>
                                    <div className="text-sm text-muted-foreground">Critical</div>
                                </CardContent>
                            </Card>
                            <Card className="border-amber-500/30 bg-amber-500/5">
                                <CardContent className="pt-4 text-center">
                                    <div className="text-3xl font-bold text-amber-500">
                                        {metrics.activeAlerts.filter(a => a.severity === 'warning').length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Warnings</div>
                                </CardContent>
                            </Card>
                            <Card className="border-blue-500/30 bg-blue-500/5">
                                <CardContent className="pt-4 text-center">
                                    <div className="text-3xl font-bold text-blue-500">
                                        {metrics.activeAlerts.filter(a => a.severity === 'info').length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Info</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Alert List */}
                        <div className="space-y-4">
                            {metrics.activeAlerts.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-green-500">All Clear!</h3>
                                        <p className="text-muted-foreground">No profit leak alerts at this time.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                metrics.activeAlerts.map(alert => {
                                    const config = severityConfig[alert.severity];
                                    const Icon = config.icon;

                                    return (
                                        <Card key={alert.id} className={cn("overflow-hidden", config.border, config.bg)}>
                                            <CardContent className="pt-4">
                                                <div className="flex items-start gap-4">
                                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", config.bg)}>
                                                        <Icon className={cn("w-5 h-5", config.text)} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge className={cn("uppercase text-xs", config.bg, config.text)}>
                                                                {alert.severity}
                                                            </Badge>
                                                            <span className="text-sm text-muted-foreground">{alert.projectName}</span>
                                                            {alert.phase && (
                                                                <>
                                                                    <span className="text-muted-foreground">•</span>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {PHASE_CONFIGS[alert.phase]?.icon} {PHASE_CONFIGS[alert.phase]?.label}
                                                                    </Badge>
                                                                </>
                                                            )}
                                                        </div>
                                                        <h4 className="font-semibold text-lg mb-1">{alert.title}</h4>
                                                        <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>

                                                        <div className="flex items-center gap-6 text-sm mb-4">
                                                            <div>
                                                                <span className="text-muted-foreground">Impact: </span>
                                                                <span className={cn("font-semibold", config.text)}>${alert.impact.toLocaleString()}</span>
                                                            </div>
                                                            {alert.impactPercent > 0 && (
                                                                <div>
                                                                    <span className="text-muted-foreground">Variance: </span>
                                                                    <span className={cn("font-semibold", config.text)}>+{alert.impactPercent.toFixed(1)}%</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="p-3 rounded-lg bg-background/80 border mb-4">
                                                            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Recommendation</div>
                                                            <div className="text-sm">{alert.recommendation}</div>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="text-xs text-muted-foreground">
                                                                Created: {new Date(alert.createdAt).toLocaleDateString()}
                                                                {alert.acknowledgedAt && (
                                                                    <span className="ml-2">• Acknowledged by {alert.acknowledgedBy}</span>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                {!alert.acknowledgedAt && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            acknowledgeAlert(alert.id, 'Derek Morrison');
                                                                            toast.success('Alert acknowledged');
                                                                        }}
                                                                    >
                                                                        Acknowledge
                                                                    </Button>
                                                                )}
                                                                <Link href={`/projects/${alert.projectId}?tab=financials`}>
                                                                    <Button size="sm">
                                                                        View Project <ArrowRight className="w-4 h-4 ml-1" />
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
