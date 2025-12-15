'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TopBar } from '@/components/top-bar';
import { StatCard } from '@/components/stat-card';
import { ScheduleItemCard } from '@/components/schedule-item';
import { useData } from '@/components/data-provider';
import {
    CODetailModal,
    NewCOModal,
    NewPunchModal,
    NewLogModal,
    CaptureModal,
    ExecutionSuccessModal,
    CaptureSuccessModal,
    PhotoCaptureModal,
    QAChecklistModal
} from '@/components/modals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ChangeOrder, DailyLog, PunchItem, PhotoCapture, QAChecklistType } from '@/lib/data';
import {
    ArrowLeft,
    Zap,
    MapPin,
    User,
    Users,
    CheckCircle2,
    Circle,
    Camera,
    Plus,
    Download
} from 'lucide-react';

type TabType = 'overview' | 'timeline' | 'schedule' | 'logs' | 'photos' | 'punch' | 'materials' | 'changeorders' | 'financials';

const statusConfig = {
    active: { label: 'Active', className: 'bg-success/10 text-success border-success/20' },
    scheduled: { label: 'Scheduled', className: 'bg-primary/10 text-primary border-primary/20' },
    pending: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' },
    completed: { label: 'Completed', className: 'bg-muted text-muted-foreground' },
};

const coStatusConfig = {
    draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
    submitted: { label: 'Submitted', className: 'bg-warning/10 text-warning' },
    approved: { label: 'Approved', className: 'bg-success/10 text-success' },
    rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive' },
    executed: { label: 'Executed', className: 'bg-primary/10 text-primary' },
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data, getProject, togglePunchItem, addPunchItem, addChangeOrder, updateChangeOrder, addDailyLog, updateProject } = useData();

    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [captureText, setCaptureText] = useState('');

    // Modal states
    const [showNewCO, setShowNewCO] = useState(false);
    const [showCODetail, setShowCODetail] = useState<ChangeOrder | null>(null);
    const [showNewPunch, setShowNewPunch] = useState(false);
    const [showNewLog, setShowNewLog] = useState(false);
    const [showCapture, setShowCapture] = useState(false);
    const [executionSuccess, setExecutionSuccess] = useState<{
        coId: string;
        costImpact: number;
        timeImpact: number;
        newDueDate: string;
        newContract: number;
        newMargin: number;
    } | null>(null);
    const [captureSuccess, setCaptureSuccess] = useState<{
        log: { date: string; crew: number; hours: number; sqft: number };
        extractedPunch: string[];
    } | null>(null);
    const [showPhotoCapture, setShowPhotoCapture] = useState(false);
    const [showQAChecklist, setShowQAChecklist] = useState<QAChecklistType | null>(null);

    const project = getProject(parseInt(id));

    useEffect(() => {
        const tab = searchParams.get('tab') as TabType;
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    // CO Actions
    const handleSubmitCO = useCallback((coId: string) => {
        if (!project) return;
        const today = new Date().toISOString().split('T')[0];
        const co = project.changeOrders.find(c => c.id === coId);
        if (!co) return;

        updateChangeOrder(project.id, coId, {
            status: 'submitted',
            submittedDate: today,
            history: [...co.history, { action: 'Submitted for Approval', date: today, by: 'Derek Morrison' }],
        });
        toast.success(`${coId} submitted for approval!`);
    }, [project, updateChangeOrder]);

    const handleApproveCO = useCallback((coId: string) => {
        if (!project) return;
        const today = new Date().toISOString().split('T')[0];
        const co = project.changeOrders.find(c => c.id === coId);
        if (!co) return;

        updateChangeOrder(project.id, coId, {
            status: 'approved',
            approvedDate: today,
            approvedBy: project.client,
            history: [...co.history, { action: 'Approved', date: today, by: project.client }],
        });
        toast.success(`${coId} approved by client! Ready for execution.`);
    }, [project, updateChangeOrder]);

    const handleRejectCO = useCallback((coId: string) => {
        if (!project) return;
        const today = new Date().toISOString().split('T')[0];
        const co = project.changeOrders.find(c => c.id === coId);
        if (!co) return;

        updateChangeOrder(project.id, coId, {
            status: 'rejected',
            history: [...co.history, { action: 'Rejected', date: today, by: project.client }],
        });
        toast.error(`${coId} was rejected.`);
    }, [project, updateChangeOrder]);

    const handleExecuteCO = useCallback((coId: string) => {
        if (!project) return;
        const today = new Date().toISOString().split('T')[0];
        const co = project.changeOrders.find(c => c.id === coId);
        if (!co) return;

        // Calculate new values
        const oldDueDate = new Date(project.dueDate);
        oldDueDate.setDate(oldDueDate.getDate() + co.timeImpact);
        const newDueDate = oldDueDate.toISOString().split('T')[0];
        const newContract = project.financials.contract + co.costImpact;
        const newMargin = Math.round(((newContract - project.financials.costs) / newContract) * 100);

        // Update CO
        updateChangeOrder(project.id, coId, {
            status: 'executed',
            executedDate: today,
            history: [...co.history, { action: 'Executed & Applied', date: today, by: 'System' }],
        });

        // Update project
        updateProject(project.id, {
            value: project.value + co.costImpact,
            dueDate: newDueDate,
            financials: {
                contract: newContract,
                costs: project.financials.costs,
                margin: newMargin,
            },
            dailyLogs: [
                {
                    id: Date.now(),
                    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                    crew: 0,
                    hours: 0,
                    weather: '📋',
                    sqft: 0,
                    notes: `[CO EXECUTED] ${co.id}: ${co.desc}. Contract adjusted by +$${co.costImpact.toLocaleString()}, schedule extended by ${co.timeImpact} day(s).`,
                },
                ...project.dailyLogs,
            ],
        });

        // Show success modal
        setExecutionSuccess({
            coId: co.id,
            costImpact: co.costImpact,
            timeImpact: co.timeImpact,
            newDueDate,
            newContract,
            newMargin,
        });
    }, [project, updateChangeOrder, updateProject]);

    const handleDeleteCO = useCallback((coId: string) => {
        if (!project) return;
        const newCOs = project.changeOrders.filter(c => c.id !== coId);
        updateProject(project.id, { changeOrders: newCOs });
        toast.success(`${coId} deleted`);
    }, [project, updateProject]);

    const handleCreateCO = useCallback((co: Omit<ChangeOrder, 'id'>) => {
        if (!project) return;
        addChangeOrder(project.id, co);
    }, [project, addChangeOrder]);

    const handleCreatePunch = useCallback((item: Omit<PunchItem, 'id'>) => {
        if (!project) return;
        addPunchItem(project.id, item);
    }, [project, addPunchItem]);

    const handleCreateLog = useCallback((log: Omit<DailyLog, 'id'>) => {
        if (!project) return;
        addDailyLog(project.id, log);
    }, [project, addDailyLog]);

    const handleProcessCapture = useCallback((text: string) => {
        if (!project) return;

        // Simulate AI extraction
        const extractedPunch: string[] = [];
        const words = text.toLowerCase();
        if (words.includes('issue') || words.includes('problem') || words.includes('found')) {
            extractedPunch.push('AI-extracted: ' + text.substring(0, 50) + '...');
            addPunchItem(project.id, {
                text: 'AI-extracted: ' + text.substring(0, 50) + '...',
                priority: 'medium',
                reporter: 'Derek',
                due: 'Dec 15',
                completed: false,
            });
        }

        // Create log
        const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const sqftMatch = text.match(/(\d+)\s*(sf|sq\s*ft|square\s*feet)/i);
        const crewMatch = text.match(/crew\s*of\s*(\d+)/i);
        const hoursMatch = text.match(/(\d+)\s*hours?/i);

        const crew = crewMatch ? parseInt(crewMatch[1]) : 3;
        const hours = hoursMatch ? parseInt(hoursMatch[1]) * crew : 24;
        const sqft = sqftMatch ? parseInt(sqftMatch[1]) : 0;

        addDailyLog(project.id, {
            date: today,
            crew,
            hours,
            weather: '☀️',
            sqft,
            notes: text,
        });

        setCaptureSuccess({
            log: { date: today, crew, hours, sqft },
            extractedPunch,
        });
    }, [project, addPunchItem, addDailyLog]);

    const handleCapture = () => {
        if (!project) return;
        if (!captureText.trim()) {
            toast.error('Please enter an update');
            return;
        }
        handleProcessCapture(captureText);
        setCaptureText('');
    };

    if (!project) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
                    <p className="text-muted-foreground mb-4">The project you&apos;re looking for doesn&apos;t exist.</p>
                    <Button onClick={() => router.push('/projects')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Projects
                    </Button>
                </div>
            </div>
        );
    }

    const status = statusConfig[project.status];
    const openPunch = project.punchList.filter(i => !i.completed);
    const completedPunch = project.punchList.filter(i => i.completed);
    const approvedCOs = project.changeOrders.filter(co => co.status === 'approved' || co.status === 'executed');
    const approvedTotal = approvedCOs.reduce((sum, co) => sum + co.costImpact, 0);
    const adjustedContract = project.financials.contract + (project.changeOrders.filter(co => co.status === 'approved').reduce((s, co) => s + co.costImpact, 0));

    // CO Stats
    const coStats = {
        submitted: project.changeOrders.filter(co => co.status === 'submitted').length,
        approved: project.changeOrders.filter(co => co.status === 'approved' || co.status === 'executed').length,
        approvedValue: project.changeOrders.filter(co => co.status === 'approved' || co.status === 'executed').reduce((s, co) => s + co.costImpact, 0),
        totalDays: project.changeOrders.filter(co => co.status === 'approved' || co.status === 'executed').reduce((s, co) => s + co.timeImpact, 0),
    };
    const needsActionCOs = project.changeOrders.filter(co => co.status === 'submitted' || co.status === 'approved');

    return (
        <>
            <TopBar
                title={project.name}
                breadcrumb={`Projects → ${project.name}`}
                showNewProject={false}
            />

            <div className="flex-1 overflow-y-auto">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-card via-card to-muted/30 border-b p-4 lg:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <Badge className={cn('text-sm', status.className)}>{status.label}</Badge>
                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    {project.address}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {project.client}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {project.crew}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => router.push('/projects')}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={() => setShowCapture(true)}>
                                <Zap className="w-4 h-4 mr-2" />
                                Capture Update
                            </Button>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur">
                            <div className="text-2xl font-bold">{project.sqft.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Sq Ft</div>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur">
                            <div className="text-2xl font-bold text-success">${(project.value / 1000).toFixed(1)}K</div>
                            <div className="text-xs text-muted-foreground">Value</div>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur">
                            <div className="text-2xl font-bold text-primary">{project.progress}%</div>
                            <div className="text-xs text-muted-foreground">Complete</div>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur">
                            <div className="text-2xl font-bold">{openPunch.length}</div>
                            <div className="text-xs text-muted-foreground">Open Punch</div>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur">
                            <div className="text-2xl font-bold text-success">{project.financials.margin}%</div>
                            <div className="text-xs text-muted-foreground">Margin</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="p-4 lg:p-6">
                    <TabsList className="flex-wrap h-auto gap-1 mb-6 bg-muted/50 p-1">
                        <TabsTrigger value="overview" className="data-[state=active]:shadow-sm">📋 Overview</TabsTrigger>
                        <TabsTrigger value="timeline">📈 Timeline</TabsTrigger>
                        <TabsTrigger value="schedule">📅 Schedule</TabsTrigger>
                        <TabsTrigger value="logs">📝 Daily Logs</TabsTrigger>
                        <TabsTrigger value="photos">📷 Photos</TabsTrigger>
                        <TabsTrigger value="punch" className="relative">
                            🔧 Punch List
                            {openPunch.length > 0 && (
                                <Badge className="ml-1 h-5 px-1.5 bg-destructive text-destructive-foreground text-xs">
                                    {openPunch.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="materials">📦 Materials</TabsTrigger>
                        <TabsTrigger value="changeorders">🔄 Change Orders</TabsTrigger>
                        <TabsTrigger value="financials">💰 Financials</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6 mt-0">
                        {/* Quick Capture */}
                        <Card className="bg-gradient-to-r from-primary/5 via-transparent to-transparent border-primary/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-primary" />
                                    Quick Capture Update
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    value={captureText}
                                    onChange={(e) => setCaptureText(e.target.value)}
                                    placeholder="What happened today? (e.g., 'Installed 300sf tile, found grout issue near door, crew of 3 worked 8 hours')"
                                    className="min-h-[100px] resize-none"
                                />
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <p className="text-xs text-muted-foreground">AI will extract punch items, log details, and create a summary</p>
                                    <Button onClick={handleCapture}>Process Update</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Project Details */}
                            <Card>
                                <CardHeader><CardTitle className="text-base">Project Details</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-muted-foreground uppercase tracking-wide">Start Date</div>
                                            <div className="font-semibold mt-1">{project.startDate}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground uppercase tracking-wide">Due Date</div>
                                            <div className="font-semibold mt-1">{project.dueDate}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground uppercase tracking-wide">Type</div>
                                            <div className="font-semibold mt-1">{project.type}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground uppercase tracking-wide">Crew</div>
                                            <div className="font-semibold mt-1">{project.crew}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    <Button variant="secondary" className="w-full justify-start" onClick={() => setShowPhotoCapture(true)}>
                                        <Camera className="w-4 h-4 mr-2" />
                                        📷 Capture Photo
                                    </Button>
                                    <Button variant="secondary" className="w-full justify-start" onClick={() => setShowNewLog(true)}>
                                        📝 Add Daily Log
                                    </Button>
                                    <Button variant="secondary" className="w-full justify-start" onClick={() => setShowNewPunch(true)}>
                                        🔧 Add Punch Item
                                    </Button>
                                    <div className="border-t pt-3 mt-2">
                                        <div className="text-xs text-muted-foreground mb-2 font-medium">📋 QA Checklists</div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setShowQAChecklist('prep')} className="flex flex-col h-auto py-2">
                                                <span className="text-lg">🏗️</span>
                                                <span className="text-xs">Prep</span>
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => setShowQAChecklist('install')} className="flex flex-col h-auto py-2">
                                                <span className="text-lg">🔨</span>
                                                <span className="text-xs">Install</span>
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => setShowQAChecklist('closeout')} className="flex flex-col h-auto py-2">
                                                <span className="text-lg">✅</span>
                                                <span className="text-xs">Closeout</span>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Open Punch Items Preview */}
                        {openPunch.length > 0 && (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-base">Open Punch Items</CardTitle>
                                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('punch')}>
                                        View All →
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {openPunch.slice(0, 3).map(item => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                                            onClick={() => {
                                                togglePunchItem(project.id, item.id);
                                                toast.success('Item marked as complete!');
                                            }}
                                        >
                                            <Circle className="w-5 h-5 text-muted-foreground" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{item.text}</div>
                                                <div className="text-xs text-muted-foreground">👤 {item.reporter} • 📅 {item.due}</div>
                                            </div>
                                            <Badge variant="outline" className={cn(
                                                item.priority === 'high' && 'border-destructive text-destructive',
                                                item.priority === 'medium' && 'border-warning text-warning',
                                                item.priority === 'low' && 'border-muted-foreground'
                                            )}>
                                                {item.priority}
                                            </Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Timeline Tab */}
                    <TabsContent value="timeline" className="mt-0">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base">{project.name} — Milestones</CardTitle>
                                <Button variant="secondary" size="sm" onClick={() => toast.success('Adding milestone...')}>
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Milestone
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-border" />
                                    <div className="space-y-6">
                                        {project.milestones.map((m) => (
                                            <div key={m.id} className="flex gap-4 relative">
                                                <div className={cn(
                                                    'w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10',
                                                    m.status === 'completed' && 'bg-success text-success-foreground',
                                                    m.status === 'current' && 'bg-primary text-primary-foreground',
                                                    m.status === 'upcoming' && 'bg-muted border-2 border-border'
                                                )}>
                                                    {m.status === 'completed' ? '✓' : m.status === 'current' ? '●' : '○'}
                                                </div>
                                                <div className={cn('flex-1 pb-6', m.status === 'upcoming' && 'opacity-50')}>
                                                    <div className="font-semibold">{m.title}</div>
                                                    <div className="text-sm text-muted-foreground">{m.date}</div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {m.status === 'completed' ? 'Completed' : m.status === 'current' ? 'In Progress' : 'Upcoming'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Schedule Tab */}
                    <TabsContent value="schedule" className="mt-0 space-y-4">
                        <Button variant="secondary" size="sm" onClick={() => toast.success('Adding entry...')}>
                            <Plus className="w-4 h-4 mr-1" />
                            Add Entry
                        </Button>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">{project.name} — Schedule</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {project.schedule.length > 0 ? (
                                    project.schedule.map(s => (
                                        <ScheduleItemCard key={s.id} item={s} />
                                    ))
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">No schedule entries yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Daily Logs Tab */}
                    <TabsContent value="logs" className="mt-0 space-y-4">
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={() => setShowNewLog(true)}>
                                <Plus className="w-4 h-4 mr-1" />
                                New Log
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => toast.success('Exporting...')}>
                                <Download className="w-4 h-4 mr-1" />
                                Export
                            </Button>
                        </div>
                        {project.dailyLogs.length > 0 ? (
                            project.dailyLogs.map(log => (
                                <Card key={log.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="font-semibold">📅 {log.date}</div>
                                            <span className="text-2xl">{log.weather}</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4 mb-4">
                                            <div className="text-center p-3 rounded-lg bg-muted/50">
                                                <div className="text-lg font-bold">{log.crew}</div>
                                                <div className="text-xs text-muted-foreground">Crew</div>
                                            </div>
                                            <div className="text-center p-3 rounded-lg bg-muted/50">
                                                <div className="text-lg font-bold">{log.hours}</div>
                                                <div className="text-xs text-muted-foreground">Hours</div>
                                            </div>
                                            <div className="text-center p-3 rounded-lg bg-muted/50">
                                                <div className="text-lg font-bold">{log.sqft}</div>
                                                <div className="text-xs text-muted-foreground">Sq Ft</div>
                                            </div>
                                            <div className="text-center p-3 rounded-lg bg-muted/50">
                                                <div className="text-lg font-bold">{log.weather}</div>
                                                <div className="text-xs text-muted-foreground">Weather</div>
                                            </div>
                                        </div>
                                        <div className="text-sm">
                                            <strong>Notes:</strong> {log.notes}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    No logs yet. <Button variant="link" onClick={() => setShowNewLog(true)}>Create one</Button>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Photos Tab */}
                    <TabsContent value="photos" className="mt-0 space-y-4">
                        <Button variant="secondary" size="sm" onClick={() => toast.success('Uploading...')}>
                            <Camera className="w-4 h-4 mr-1" />
                            Upload
                        </Button>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">{project.name} — Photos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {project.photos.map((label, i) => (
                                        <div
                                            key={i}
                                            className="aspect-square bg-muted rounded-xl flex items-center justify-center text-4xl cursor-pointer hover:bg-muted/80 transition-colors relative overflow-hidden group"
                                            onClick={() => toast.success(`Opening ${label}...`)}
                                        >
                                            📷
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white text-xs font-semibold translate-y-full group-hover:translate-y-0 transition-transform">
                                                {label}
                                            </div>
                                        </div>
                                    ))}
                                    <div
                                        className="aspect-square border-2 border-dashed rounded-xl flex items-center justify-center text-4xl text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors"
                                        onClick={() => toast.success('Upload...')}
                                    >
                                        +
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Punch List Tab */}
                    <TabsContent value="punch" className="mt-0 space-y-4">
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={() => setShowNewPunch(true)}>
                                <Plus className="w-4 h-4 mr-1" />
                                Add Item
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => toast.success('Exporting...')}>
                                <Download className="w-4 h-4 mr-1" />
                                Export
                            </Button>
                        </div>

                        {openPunch.length > 0 && (
                            <>
                                <h3 className="text-sm font-semibold text-muted-foreground">Open ({openPunch.length})</h3>
                                {openPunch.map(item => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:shadow-md cursor-pointer transition-all"
                                        onClick={() => {
                                            togglePunchItem(project.id, item.id);
                                            toast.success('Item marked as complete!');
                                        }}
                                    >
                                        <Circle className="w-6 h-6 text-muted-foreground hover:text-success transition-colors" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium">{item.text}</div>
                                            <div className="text-sm text-muted-foreground">👤 {item.reporter} • 📅 {item.due}</div>
                                        </div>
                                        <Badge variant="outline" className={cn(
                                            item.priority === 'high' && 'border-destructive text-destructive',
                                            item.priority === 'medium' && 'border-warning text-warning',
                                            item.priority === 'low' && 'border-muted-foreground'
                                        )}>
                                            {item.priority}
                                        </Badge>
                                    </div>
                                ))}
                            </>
                        )}

                        {completedPunch.length > 0 && (
                            <>
                                <h3 className="text-sm font-semibold text-muted-foreground mt-6">Completed ({completedPunch.length})</h3>
                                {completedPunch.map(item => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30 opacity-60 cursor-pointer transition-all hover:opacity-100"
                                        onClick={() => {
                                            togglePunchItem(project.id, item.id);
                                            toast.info('Item reopened');
                                        }}
                                    >
                                        <CheckCircle2 className="w-6 h-6 text-success" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium line-through">{item.text}</div>
                                            <div className="text-sm text-muted-foreground">👤 {item.reporter}</div>
                                        </div>
                                        <Badge variant="outline">{item.priority}</Badge>
                                    </div>
                                ))}
                            </>
                        )}

                        {project.punchList.length === 0 && (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    No punch items! Great work. 🎉
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Materials Tab */}
                    <TabsContent value="materials" className="mt-0 space-y-4">
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={() => toast.success('Adding material...')}>
                                <Plus className="w-4 h-4 mr-1" />
                                Add Material
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => toast.success('Opening order form...')}>
                                📦 Order
                            </Button>
                        </div>
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="text-left p-4 font-semibold">Material</th>
                                                <th className="text-left p-4 font-semibold">Qty</th>
                                                <th className="text-left p-4 font-semibold">Status</th>
                                                <th className="text-left p-4 font-semibold">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {project.materials.length > 0 ? (
                                                project.materials.map((m, i) => (
                                                    <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                                                        <td className="p-4 font-medium">{m.name}</td>
                                                        <td className="p-4">{m.qty} {m.unit}</td>
                                                        <td className="p-4">
                                                            <Badge className={cn(
                                                                m.status === 'delivered' && 'bg-success/10 text-success',
                                                                m.status === 'ordered' && 'bg-primary/10 text-primary',
                                                                m.status === 'low' && 'bg-warning/10 text-warning'
                                                            )}>
                                                                {m.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-4">
                                                            <Button variant="secondary" size="sm" onClick={() => toast.success('Opening order form...')}>
                                                                Order
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                                        No materials assigned.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Change Orders Tab */}
                    <TabsContent value="changeorders" className="mt-0 space-y-4">
                        {/* CO Stats Header */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="bg-warning/5 border-warning/20">
                                <CardContent className="pt-6">
                                    <div className="text-2xl font-bold text-warning">{coStats.submitted}</div>
                                    <div className="text-sm text-muted-foreground">Awaiting Approval</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-success/5 border-success/20">
                                <CardContent className="pt-6">
                                    <div className="text-2xl font-bold text-success">{coStats.approved}</div>
                                    <div className="text-sm text-muted-foreground">Approved</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-2xl font-bold text-success">+${coStats.approvedValue.toLocaleString()}</div>
                                    <div className="text-sm text-muted-foreground">Revenue Added</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-2xl font-bold text-warning">+{coStats.totalDays}d</div>
                                    <div className="text-sm text-muted-foreground">Schedule Impact</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2 flex-wrap">
                            <Button onClick={() => setShowNewCO(true)}>+ Request Change Order</Button>
                            <Button variant="outline" onClick={() => toast.success('Exporting CO report...')}>📥 Export Report</Button>
                            <Button variant="outline" onClick={() => toast.success('Sending summary to client...')}>📧 Send Summary</Button>
                        </div>

                        {/* Needs Action */}
                        {needsActionCOs.length > 0 && (
                            <Card className="border-warning">
                                <CardHeader className="bg-warning/10">
                                    <CardTitle className="text-base">⚠️ Needs Action ({needsActionCOs.length})</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 pt-4">
                                    {needsActionCOs.map(co => (
                                        <div
                                            key={co.id}
                                            className="p-4 rounded-lg border bg-card cursor-pointer hover:shadow-md transition-all"
                                            onClick={() => setShowCODetail(co)}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold">{co.id}</span>
                                                        <Badge className={coStatusConfig[co.status].className}>
                                                            {coStatusConfig[co.status].label}
                                                        </Badge>
                                                    </div>
                                                    <div className="font-medium">{co.desc}</div>
                                                    <div className="text-sm text-muted-foreground">{co.reason}</div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="font-bold text-success">+${co.costImpact.toLocaleString()}</div>
                                                    <div className="text-xs text-muted-foreground">+{co.timeImpact}d</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* All Change Orders */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">All Change Orders ({project.changeOrders.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {project.changeOrders.length > 0 ? (
                                    project.changeOrders.map(co => (
                                        <div
                                            key={co.id}
                                            className="p-4 rounded-lg border bg-card cursor-pointer hover:shadow-md transition-all"
                                            onClick={() => setShowCODetail(co)}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold">{co.id}</span>
                                                        <Badge className={coStatusConfig[co.status].className}>
                                                            {coStatusConfig[co.status].label}
                                                        </Badge>
                                                    </div>
                                                    <div className="font-medium">{co.desc}</div>
                                                    <div className="text-sm text-muted-foreground">{co.reason}</div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="font-bold text-success">+${co.costImpact.toLocaleString()}</div>
                                                    <div className="text-xs text-muted-foreground">+{co.timeImpact}d • Created: {co.createdDate}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-2">📋</div>
                                        <div className="font-semibold">No Change Orders Yet</div>
                                        <p className="text-sm text-muted-foreground mb-4">Change orders help you track scope changes and protect your profit margins.</p>
                                        <Button onClick={() => setShowNewCO(true)}>+ Create First Change Order</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Financials Tab */}
                    <TabsContent value="financials" className="mt-0 space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard label="Original Contract" value={`$${project.financials.contract.toLocaleString()}`} />
                            <StatCard label="Approved COs" value={`+$${approvedTotal.toLocaleString()}`} variant="success" />
                            <StatCard
                                label="Pending COs"
                                value={`+$${project.changeOrders.filter(co => co.status === 'submitted' || co.status === 'draft').reduce((s, co) => s + co.costImpact, 0).toLocaleString()}`}
                                variant="warning"
                            />
                            <StatCard label="Adjusted Contract" value={`$${adjustedContract.toLocaleString()}`} variant="primary" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <StatCard label="Costs to Date" value={`$${project.financials.costs.toLocaleString()}`} />
                            <StatCard label="Remaining" value={`$${(adjustedContract - project.financials.costs).toLocaleString()}`} variant="success" />
                            <StatCard
                                label="Current Margin"
                                value={`${Math.round(((adjustedContract - project.financials.costs) / adjustedContract) * 100)}%`}
                                variant="success"
                            />
                        </div>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base">Change Orders Summary</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setActiveTab('changeorders')}>
                                    View All COs →
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="text-left p-4 font-semibold">CO #</th>
                                                <th className="text-left p-4 font-semibold">Description</th>
                                                <th className="text-left p-4 font-semibold">Cost Impact</th>
                                                <th className="text-left p-4 font-semibold">Time</th>
                                                <th className="text-left p-4 font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {project.changeOrders.map(co => (
                                                <tr key={co.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => setShowCODetail(co)}>
                                                    <td className="p-4 font-medium">{co.id}</td>
                                                    <td className="p-4">{co.desc}</td>
                                                    <td className="p-4 text-success font-medium">+${co.costImpact.toLocaleString()}</td>
                                                    <td className="p-4">+{co.timeImpact}d</td>
                                                    <td className="p-4">
                                                        <Badge className={coStatusConfig[co.status].className}>
                                                            {coStatusConfig[co.status].label}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modals */}
            {showCODetail && (
                <CODetailModal
                    open={!!showCODetail}
                    onClose={() => setShowCODetail(null)}
                    project={project}
                    changeOrder={showCODetail}
                    onSubmit={handleSubmitCO}
                    onApprove={handleApproveCO}
                    onReject={handleRejectCO}
                    onExecute={handleExecuteCO}
                    onDelete={handleDeleteCO}
                />
            )}

            <NewCOModal
                open={showNewCO}
                onClose={() => setShowNewCO(false)}
                projectId={project.id}
                nextNumber={project.changeOrders.length + 1}
                onCreate={handleCreateCO}
            />

            <NewPunchModal
                open={showNewPunch}
                onClose={() => setShowNewPunch(false)}
                onCreate={handleCreatePunch}
            />

            <NewLogModal
                open={showNewLog}
                onClose={() => setShowNewLog(false)}
                onCreate={handleCreateLog}
            />

            <CaptureModal
                open={showCapture}
                onClose={() => setShowCapture(false)}
                projectName={project.name}
                onProcess={handleProcessCapture}
            />

            {executionSuccess && (
                <ExecutionSuccessModal
                    open={!!executionSuccess}
                    onClose={() => setExecutionSuccess(null)}
                    {...executionSuccess}
                />
            )}

            {captureSuccess && (
                <CaptureSuccessModal
                    open={!!captureSuccess}
                    onClose={() => setCaptureSuccess(null)}
                    projectName={project.name}
                    log={captureSuccess.log}
                    extractedPunch={captureSuccess.extractedPunch}
                />
            )}

            <PhotoCaptureModal
                open={showPhotoCapture}
                onClose={() => setShowPhotoCapture(false)}
                onCapture={(photo) => {
                    // Add photo to project's photos array (simulated)
                    const label = photo.label.charAt(0).toUpperCase() + photo.label.slice(1);
                    updateProject(project.id, {
                        photos: [...project.photos, label + (photo.location ? ` - ${photo.location}` : '')],
                    });
                    toast.success(`Photo saved with "${label}" label!`);
                }}
            />

            {showQAChecklist && (
                <QAChecklistModal
                    open={!!showQAChecklist}
                    onClose={() => setShowQAChecklist(null)}
                    projectId={project.id}
                    type={showQAChecklist}
                    onSave={(checklist) => {
                        // Save checklist to project (simulated - would need full integration)
                        const typeName = checklist.type.charAt(0).toUpperCase() + checklist.type.slice(1);
                        const completed = checklist.completedAt ? ' (Complete)' : '';
                        toast.success(`${typeName} Checklist${completed} saved!`);
                    }}
                />
            )}
        </>
    );
}
