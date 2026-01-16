'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSmartBack } from '@/hooks/use-smart-back';
import { TopBar } from '@/components/top-bar';
import { StatCard } from '@/components/stat-card';
import { ScheduleItemCard } from '@/components/schedule-item';
import { useData } from '@/components/data-provider';
import { usePermissions } from '@/components/permission-context';
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
import {
    EnhancedPunchModal,
    ClientWalkthroughMode,
    CompletionCertificateModal,
    WalkthroughManager
} from '@/components/walkthrough-modals';
import {
    CreateInvoiceModal,
    InvoiceDetailModal,
    RecordPaymentModal,
    InvoiceStatusBadge,
    ProjectInvoiceSummaryCard
} from '@/components/invoice-modals';
import { MessageFeed } from '@/components/message-feed';
import { ClientUpdateModal } from '@/components/client-update-modal';
import { SafetyComplianceTab } from '@/components/safety-compliance-tab';
import { ScopeTab } from '@/components/scope-tab';
import { ScheduleTabEnhanced } from '@/components/schedule-tab-enhanced';
import { MaterialsTabEnhanced } from '@/components/materials-tab-enhanced';
import { PhotosTabEnhanced } from '@/components/photos-tab-enhanced';
import { AddMoistureTestModal } from '@/components/project-modals';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ChangeOrder, DailyLog, PunchItem, PhotoCapture, QAChecklistType, PHASE_CONFIGS, WalkthroughSession, CompletionCertificate, SignatureData, ClientInvoice, ClientInvoiceType } from '@/lib/data';
import { Progress } from '@/components/ui/progress';
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
    Download,
    ClipboardCheck,
    FileSignature,
    Star,
    FileText,
    MessageSquare
} from 'lucide-react';

type TabType = 'overview' | 'timeline' | 'scope' | 'schedule' | 'logs' | 'photos' | 'punch' | 'materials' | 'changeorders' | 'financials' | 'invoices' | 'walkthrough' | 'safety' | 'communication';

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
    const {
        data,
        getProject,
        togglePunchItem,
        addPunchItem,
        updatePunchItem,
        addChangeOrder,
        updateChangeOrder,
        addDailyLog,
        updateProject,
        getProjectBudget,
        getLaborSummary,
        getProfitLeakAlerts,
        getInvoicesByProject,
        createWalkthroughSession,
        updateWalkthroughSession,
        startWalkthrough,
        completeWalkthrough,
        getWalkthroughsByProject,
        createCompletionCertificate,
        updateCompletionCertificate,
        addSignature,
        getCertificateByProject,
        getTeamMembers,
        // Client Invoicing
        getClientInvoicesByProject,
        getProjectInvoiceSummary,
        sendClientInvoice,
        recordPayment,
        // Safety
        addMoistureTest
    } = useData();

    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [captureText, setCaptureText] = useState('');

    // Modal states
    const [showNewCO, setShowNewCO] = useState(false);
    const [showCODetail, setShowCODetail] = useState<ChangeOrder | null>(null);
    const [showNewPunch, setShowNewPunch] = useState(false);
    const [showNewLog, setShowNewLog] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const [showClientUpdate, setShowClientUpdate] = useState(false);
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

    // Walkthrough modal states
    const [showEnhancedPunch, setShowEnhancedPunch] = useState(false);
    const [showWalkthroughManager, setShowWalkthroughManager] = useState(false);
    const [showClientWalkthrough, setShowClientWalkthrough] = useState<WalkthroughSession | null>(null);
    const [showMoistureTest, setShowMoistureTest] = useState(false);
    const [showCompletionCert, setShowCompletionCert] = useState(false);

    // Invoice modal states
    const [showCreateInvoice, setShowCreateInvoice] = useState(false);
    const [showInvoiceDetail, setShowInvoiceDetail] = useState<ClientInvoice | null>(null);
    const [showRecordPayment, setShowRecordPayment] = useState<ClientInvoice | null>(null);
    const [suggestedInvoiceType, setSuggestedInvoiceType] = useState<ClientInvoiceType | undefined>(undefined);

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
                    id: `dl-co-${Date.now()}`,
                    projectId: project.id,
                    date: new Date().toISOString().split('T')[0],
                    crewMembers: [],
                    totalCrewCount: 0,
                    totalHours: 0,
                    weather: 'sunny' as const,
                    sqftCompleted: 0,
                    workCompleted: `[CO EXECUTED] ${co.id}: ${co.desc}. Contract adjusted by +$${co.costImpact.toLocaleString()}, schedule extended by ${co.timeImpact} day(s).`,
                    areasWorked: [],
                    delays: [],
                    hasDelays: false,
                    totalDelayMinutes: 0,
                    photos: [],
                    materialsUsed: [],
                    incidentReported: false,
                    clientOnSite: false,
                    createdBy: 'System',
                    createdByUserId: 0,
                    createdAt: new Date().toISOString(),
                    submittedOffline: false,
                    // Legacy compat
                    crew: 0,
                    hours: 0,
                    notes: `[CO EXECUTED] ${co.id}: ${co.desc}`,
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
        const today = new Date().toISOString().split('T')[0];
        const sqftMatch = text.match(/(\d+)\s*(sf|sq\s*ft|square\s*feet)/i);
        const crewMatch = text.match(/crew\s*of\s*(\d+)/i);
        const hoursMatch = text.match(/(\d+)\s*hours?/i);

        const crewCount = crewMatch ? parseInt(crewMatch[1]) : 3;
        const hours = hoursMatch ? parseInt(hoursMatch[1]) * crewCount : 24;
        const sqft = sqftMatch ? parseInt(sqftMatch[1]) : 0;

        addDailyLog(project.id, {
            projectId: project.id,
            date: today,
            crewMembers: [],
            totalCrewCount: crewCount,
            totalHours: hours,
            weather: 'sunny',
            sqftCompleted: sqft,
            workCompleted: text,
            areasWorked: [],
            delays: [],
            hasDelays: false,
            totalDelayMinutes: 0,
            photos: [],
            materialsUsed: [],
            incidentReported: false,
            clientOnSite: false,
            createdBy: 'Current User',
            createdByUserId: 0,
            createdAt: new Date().toISOString(),
            submittedOffline: false,
            // Legacy compat
            crew: crewCount,
            hours: hours,
            notes: text,
        });

        setCaptureSuccess({
            log: { date: today, crew: crewCount, hours, sqft },
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

    // Permissions - must be called unconditionally (Rules of Hooks)
    const { canViewPricing, can } = usePermissions();
    const showPricing = canViewPricing();

    // Smart back navigation - takes you where you came from
    const { goBack, backLabel } = useSmartBack({
        title: project?.name || 'Project',
        fallbackPath: '/projects'
    });

    if (!project) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
                    <p className="text-muted-foreground mb-4">The project you&apos;re looking for doesn&apos;t exist.</p>
                    <Button onClick={goBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {backLabel}
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
                            <Button variant="outline" onClick={goBack}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {backLabel}
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
                            <div className="text-2xl font-bold text-success">{showPricing ? `$${(project.value / 1000).toFixed(1)}K` : '—'}</div>
                            <div className="text-xs text-muted-foreground">{showPricing ? 'Value' : 'Restricted'}</div>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur">
                            <div className="text-2xl font-bold text-primary">{project.progress}%</div>
                            <div className="text-xs text-muted-foreground">Complete</div>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur">
                            <div className="text-2xl font-bold">{openPunch.length}</div>
                            <div className="text-xs text-muted-foreground">Open Punch</div>
                        </div>
                        {showPricing && (
                            <div className="text-center p-4 rounded-xl bg-background/50 backdrop-blur">
                                <div className="text-2xl font-bold text-success">{project.financials.margin}%</div>
                                <div className="text-xs text-muted-foreground">Margin</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="p-4 lg:p-6">
                    <TabsList className="flex flex-nowrap overflow-x-auto h-auto gap-1 mb-6 bg-muted/50 p-1.5 lg:flex-wrap w-full lg:w-auto justify-start mobile-tabs">
                        <TabsTrigger value="overview" className="data-[state=active]:shadow-sm flex-shrink-0">📋 Overview</TabsTrigger>
                        <TabsTrigger value="timeline" className="flex-shrink-0">📈 Timeline</TabsTrigger>
                        {can('VIEW_CONTRACT_SCOPE') && (
                            <TabsTrigger value="scope" className="flex-shrink-0">📜 Scope</TabsTrigger>
                        )}
                        <TabsTrigger value="schedule" className="flex-shrink-0">📅 Schedule</TabsTrigger>
                        <TabsTrigger value="logs" className="flex-shrink-0">📝 Daily Logs</TabsTrigger>
                        <TabsTrigger value="photos" className="flex-shrink-0">📷 Photos</TabsTrigger>
                        <TabsTrigger value="punch" className="relative flex-shrink-0">
                            🔧 Punch List
                            {openPunch.length > 0 && (
                                <Badge className="ml-1 h-5 px-1.5 bg-destructive text-destructive-foreground text-xs">
                                    {openPunch.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="materials" className="flex-shrink-0">📦 Materials</TabsTrigger>
                        <TabsTrigger value="changeorders" className="flex-shrink-0">🔄 Change Orders</TabsTrigger>
                        {showPricing && <TabsTrigger value="financials" className="flex-shrink-0">💰 Financials</TabsTrigger>}
                        {can('VIEW_CLIENT_INVOICES') && (
                            <TabsTrigger value="invoices" className="relative flex-shrink-0">
                                🧾 Invoices
                                {getClientInvoicesByProject(project.id).filter(inv => inv.status === 'sent' || inv.status === 'partial').length > 0 && (
                                    <Badge className="ml-1 h-5 px-1.5 bg-amber-500 text-white text-xs">
                                        {getClientInvoicesByProject(project.id).filter(inv => inv.status === 'sent' || inv.status === 'partial').length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="walkthrough" className="relative flex-shrink-0">
                            ✅ Walkthrough
                            {getWalkthroughsByProject(project.id).filter(w => w.status === 'scheduled').length > 0 && (
                                <Badge className="ml-1 h-5 px-1.5 bg-primary text-primary-foreground text-xs">
                                    {getWalkthroughsByProject(project.id).filter(w => w.status === 'scheduled').length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        {can('VIEW_SAFETY_RECORDS') && (
                            <TabsTrigger value="safety" className="relative flex-shrink-0">
                                🛡️ Safety
                                {(project.siteConditions || []).filter(c => c.riskLevel === 'critical' || c.riskLevel === 'high').filter(c => c.status === 'active').length > 0 && (
                                    <Badge className="ml-1 h-5 px-1.5 bg-red-500 text-white text-xs">
                                        {(project.siteConditions || []).filter(c => c.riskLevel === 'critical' || c.riskLevel === 'high').filter(c => c.status === 'active').length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="communication" className="relative flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                <span>Communication</span>
                            </div>
                        </TabsTrigger>
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
                                        Capture Photo
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

                    {/* Safety & Compliance Tab */}
                    {can('VIEW_SAFETY_RECORDS') && (
                        <TabsContent value="safety" className="space-y-6 mt-0">
                            <SafetyComplianceTab
                                project={project}
                                onAddMoistureTest={() => setShowMoistureTest(true)}
                                onAddSubfloorTest={() => toast.success('Opening subfloor test form...')}
                                onAddSiteCondition={() => toast.success('Opening site condition form...')}
                                onReportIncident={() => toast.success('Opening incident report form...')}
                                onCreateChecklist={() => toast.success('Opening checklist form...')}
                            />
                        </TabsContent>
                    )}


                    {/* Communication Tab */}
                    <TabsContent value="communication" className="space-y-6 mt-0">
                        <div className="grid lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Main Message Feed */}
                                <MessageFeed projectId={project.id} />
                            </div>

                            <div className="space-y-6">
                                {/* Communication Actions */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button
                                            className="w-full justify-start gap-2"
                                            onClick={() => setShowClientUpdate(true)}
                                            variant="secondary"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Generate Client Update
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Team</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">PM</div>
                                                <div>
                                                    <div className="text-sm font-medium">Samson (You)</div>
                                                    <div className="text-xs text-muted-foreground">Project Manager</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs">CL</div>
                                                <div>
                                                    <div className="text-sm font-medium">{project.client}</div>
                                                    <div className="text-xs text-muted-foreground">Client</div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <ClientUpdateModal
                            isOpen={showClientUpdate}
                            onClose={() => setShowClientUpdate(false)}
                            projectId={project.id}
                        />
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

                    {/* Scope Tab - System of Record */}
                    <TabsContent value="scope" className="mt-0 space-y-4">
                        <ScopeTab
                            project={project}
                            onUpdate={(updates) => updateProject(project.id, updates)}
                        />
                    </TabsContent>

                    {/* Schedule Tab */}
                    <TabsContent value="schedule" className="mt-0 space-y-4">
                        {/* Enhanced Schedule - Phase Dependencies & Critical Path */}
                        {project.schedulePhases && project.schedulePhases.length > 0 && (
                            <ScheduleTabEnhanced
                                project={project}
                                onUpdate={(updates) => updateProject(project.id, updates)}
                            />
                        )}

                        {/* Legacy Schedule Entries */}
                        <Button variant="secondary" size="sm" onClick={() => toast.success('Adding entry...')}>
                            <Plus className="w-4 h-4 mr-1" />
                            Add Entry
                        </Button>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">{project.name} — Daily Schedule</CardTitle>
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
                                <Card key={log.id} className={cn(log.hasDelays && "border-l-4 border-l-amber-500")}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="font-semibold">📅 {log.date}</div>
                                            <div className="flex items-center gap-2">
                                                {log.hasDelays && <Badge variant="outline" className="border-amber-500 text-amber-600">Delays</Badge>}
                                                <span className="text-sm capitalize">{log.weather}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4 mb-4">
                                            <div className="text-center p-3 rounded-lg bg-muted/50">
                                                <div className="text-lg font-bold">{log.totalCrewCount || log.crew || 0}</div>
                                                <div className="text-xs text-muted-foreground">Crew</div>
                                            </div>
                                            <div className="text-center p-3 rounded-lg bg-muted/50">
                                                <div className="text-lg font-bold">{log.totalHours || log.hours || 0}</div>
                                                <div className="text-xs text-muted-foreground">Hours</div>
                                            </div>
                                            <div className="text-center p-3 rounded-lg bg-muted/50">
                                                <div className="text-lg font-bold">{log.sqftCompleted || 0}</div>
                                                <div className="text-xs text-muted-foreground">Sq Ft</div>
                                            </div>
                                            <div className="text-center p-3 rounded-lg bg-muted/50">
                                                <div className="text-lg font-bold capitalize">{log.weather}</div>
                                                <div className="text-xs text-muted-foreground">Weather</div>
                                            </div>
                                        </div>
                                        <div className="text-sm">
                                            <strong>Notes:</strong> {log.workCompleted || log.notes || 'No notes'}
                                        </div>
                                        {log.signedBy && (
                                            <div className="text-xs text-muted-foreground mt-2">
                                                ✓ Signed by {log.signedBy}
                                            </div>
                                        )}
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
                        {/* Enhanced Photos - Phase-based Organization */}
                        {project.phasePhotos && project.phasePhotos.length > 0 ? (
                            <PhotosTabEnhanced
                                project={project}
                                onUpdate={(updates) => updateProject(project.id, updates)}
                            />
                        ) : (
                            <>
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
                            </>
                        )}
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
                        {/* Enhanced Materials - Delivery Tracking & Acclimation */}
                        <MaterialsTabEnhanced
                            project={project}
                            onUpdate={(updates) => updateProject(project.id, updates)}
                        />
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
                        {/* Revenue & Margin Overview */}
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

                        {(() => {
                            const budget = getProjectBudget(project.id);
                            const laborSummary = getLaborSummary(project.id);
                            const alerts = getProfitLeakAlerts(project.id).filter(a => !a.resolvedAt);
                            const invoices = getInvoicesByProject(project.id);

                            if (budget) {
                                return (
                                    <>
                                        {/* Margin Health Card */}
                                        <Card className={cn(
                                            "overflow-hidden",
                                            budget.projectedMargin >= budget.targetMargin
                                                ? "border-green-500/30 bg-gradient-to-r from-green-500/5 to-transparent"
                                                : budget.projectedMargin >= budget.targetMargin - 5
                                                    ? "border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent"
                                                    : "border-red-500/30 bg-gradient-to-r from-red-500/5 to-transparent"
                                        )}>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-semibold">Margin Health</h3>
                                                        <p className="text-sm text-muted-foreground">Projected vs target margin</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={cn(
                                                            "text-3xl font-bold",
                                                            budget.projectedMargin >= budget.targetMargin ? "text-green-500" :
                                                                budget.projectedMargin >= budget.targetMargin - 5 ? "text-amber-500" : "text-red-500"
                                                        )}>
                                                            {budget.projectedMargin.toFixed(1)}%
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">Target: {budget.targetMargin}%</div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                                                    <div>
                                                        <div className="text-xs text-muted-foreground uppercase">Revenue</div>
                                                        <div className="text-lg font-bold">${(budget.totalRevenue / 1000).toFixed(1)}K</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-muted-foreground uppercase">Spent</div>
                                                        <div className="text-lg font-bold">${(budget.actualCost / 1000).toFixed(1)}K</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-muted-foreground uppercase">Projected</div>
                                                        <div className="text-lg font-bold">${(budget.projectedCost / 1000).toFixed(1)}K</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-muted-foreground uppercase">Profit</div>
                                                        <div className="text-lg font-bold text-green-500">
                                                            ${((budget.totalRevenue - budget.projectedCost) / 1000).toFixed(1)}K
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Profit Leak Alerts */}
                                        {alerts.length > 0 && (
                                            <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent">
                                                <CardHeader>
                                                    <CardTitle className="text-base flex items-center gap-2">
                                                        ⚠️ Profit Leak Alerts ({alerts.length})
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    {alerts.map(alert => (
                                                        <div key={alert.id} className={cn(
                                                            "p-3 rounded-lg border",
                                                            alert.severity === 'critical' ? "bg-red-500/10 border-red-500/30" :
                                                                alert.severity === 'warning' ? "bg-amber-500/10 border-amber-500/30" : "bg-blue-500/10 border-blue-500/30"
                                                        )}>
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div>
                                                                    <div className="font-medium">{alert.title}</div>
                                                                    <div className="text-sm text-muted-foreground">{alert.description}</div>
                                                                </div>
                                                                <div className="text-right shrink-0">
                                                                    <div className={cn(
                                                                        "font-bold",
                                                                        alert.severity === 'critical' ? "text-red-500" : "text-amber-500"
                                                                    )}>
                                                                        ${alert.impact.toLocaleString()}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">impact</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Phase Budget Breakdown */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">📊 Actual vs Estimate by Phase</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {budget.phaseBudgets.map(phase => {
                                                    const config = PHASE_CONFIGS[phase.phase];
                                                    const progressPercent = phase.estimatedTotal > 0
                                                        ? Math.min((phase.actualTotal / phase.estimatedTotal) * 100, 150)
                                                        : 0;

                                                    return (
                                                        <div key={phase.phase} className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-lg">{config?.icon}</span>
                                                                    <span className="font-medium">{config?.label || phase.phase}</span>
                                                                    <Badge variant="outline" className={cn(
                                                                        "text-xs",
                                                                        phase.status === 'on-budget' ? "border-green-500/30 text-green-500" :
                                                                            phase.status === 'warning' ? "border-amber-500/30 text-amber-500" :
                                                                                "border-red-500/30 text-red-500"
                                                                    )}>
                                                                        {phase.status === 'on-budget' ? 'On Budget' :
                                                                            phase.status === 'warning' ? 'Warning' : 'Over Budget'}
                                                                    </Badge>
                                                                </div>
                                                                <div className="text-right text-sm">
                                                                    <span className="font-medium">${phase.actualTotal.toLocaleString()}</span>
                                                                    <span className="text-muted-foreground"> / ${phase.estimatedTotal.toLocaleString()}</span>
                                                                    {phase.variance !== 0 && (
                                                                        <span className={cn(
                                                                            "ml-2",
                                                                            phase.variance > 0 ? "text-red-500" : "text-green-500"
                                                                        )}>
                                                                            ({phase.variance > 0 ? '+' : ''}{phase.variancePercent.toFixed(0)}%)
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Progress
                                                                value={progressPercent > 100 ? 100 : progressPercent}
                                                                className={cn(
                                                                    "h-2",
                                                                    progressPercent > 100 && "[&>div]:bg-red-500"
                                                                )}
                                                            />
                                                            <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                                                                <div>Labor: ${phase.actualLabor.toLocaleString()}</div>
                                                                <div>Materials: ${phase.actualMaterials.toLocaleString()}</div>
                                                                <div>Subs: ${phase.actualSubcontractors.toLocaleString()}</div>
                                                                <div>Other: ${phase.actualOther.toLocaleString()}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </CardContent>
                                        </Card>

                                        {/* Labor & Subcontractor Summary */}
                                        <div className="grid lg:grid-cols-2 gap-6">
                                            {/* Labor Summary */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-base">👷 Labor Summary</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                                                            <div className="text-2xl font-bold">{laborSummary.totalHours.toFixed(0)}h</div>
                                                            <div className="text-xs text-muted-foreground">Total Hours</div>
                                                        </div>
                                                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                                                            <div className="text-2xl font-bold">${laborSummary.totalCost.toLocaleString()}</div>
                                                            <div className="text-xs text-muted-foreground">Labor Cost</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">By Phase</div>
                                                    <div className="space-y-1">
                                                        {Object.entries(laborSummary.byPhase).map(([phase, data]) => (
                                                            <div key={phase} className="flex items-center justify-between py-1 text-sm">
                                                                <span className="flex items-center gap-1">
                                                                    {PHASE_CONFIGS[phase as keyof typeof PHASE_CONFIGS]?.icon}
                                                                    {PHASE_CONFIGS[phase as keyof typeof PHASE_CONFIGS]?.label || phase}
                                                                </span>
                                                                <span className="font-medium">{data.hours.toFixed(0)}h / ${data.cost.toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Subcontractor Summary */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-base">🏗️ Subcontractor Invoices</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    {invoices.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {invoices.slice(0, 4).map(inv => (
                                                                <div key={inv.id} className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                                                                    <div>
                                                                        <div className="font-medium text-sm">{inv.subcontractorName}</div>
                                                                        <div className="text-xs text-muted-foreground">{inv.invoiceNumber}</div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="font-bold">${inv.total.toLocaleString()}</div>
                                                                        <Badge className={cn("text-xs",
                                                                            inv.status === 'paid' ? "bg-green-500/10 text-green-500" :
                                                                                inv.status === 'approved' ? "bg-blue-500/10 text-blue-500" :
                                                                                    inv.status === 'pending-approval' ? "bg-amber-500/10 text-amber-500" : ""
                                                                        )}>
                                                                            {inv.status}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {invoices.length > 4 && (
                                                                <Button variant="ghost" size="sm" className="w-full" onClick={() => router.push('/subcontractors')}>
                                                                    View all {invoices.length} invoices →
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-6 text-muted-foreground">
                                                            No subcontractor invoices yet
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </>
                                );
                            }
                            return null;
                        })()}

                        {/* Change Orders Summary */}
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

                    {/* Invoices Tab */}
                    <TabsContent value="invoices" className="mt-0 space-y-6">
                        {(() => {
                            const invoiceSummary = getProjectInvoiceSummary(project.id);
                            const projectInvoices = getClientInvoicesByProject(project.id);

                            return (
                                <>
                                    {/* Invoice Summary Card */}
                                    <div className="grid lg:grid-cols-3 gap-6">
                                        <div className="lg:col-span-1">
                                            <ProjectInvoiceSummaryCard
                                                summary={invoiceSummary}
                                                onCreateInvoice={(type) => {
                                                    setSuggestedInvoiceType(type);
                                                    setShowCreateInvoice(true);
                                                }}
                                            />
                                        </div>

                                        {/* Invoice List */}
                                        <div className="lg:col-span-2">
                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between">
                                                    <CardTitle className="text-base">Project Invoices</CardTitle>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setShowCreateInvoice(true)}
                                                    >
                                                        <Plus className="w-4 h-4 mr-1" />
                                                        New Invoice
                                                    </Button>
                                                </CardHeader>
                                                <CardContent className="p-0">
                                                    {projectInvoices.length > 0 ? (
                                                        <div className="divide-y">
                                                            {projectInvoices.map(invoice => (
                                                                <div
                                                                    key={invoice.id}
                                                                    className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                                                    onClick={() => setShowInvoiceDetail(invoice)}
                                                                >
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="font-mono font-medium">{invoice.invoiceNumber}</span>
                                                                            <InvoiceStatusBadge status={invoice.status} />
                                                                            <Badge variant="outline" className="text-xs capitalize">{invoice.type}</Badge>
                                                                        </div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            Due: {invoice.dueDate}
                                                                            {invoice.retainageAmount > 0 && (
                                                                                <span className="text-blue-500 ml-2">
                                                                                    +${invoice.retainageAmount.toLocaleString()} retainage
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="text-lg font-bold">${invoice.total.toLocaleString()}</div>
                                                                        {invoice.balance > 0 && invoice.balance < invoice.total && (
                                                                            <div className="text-sm text-amber-600">
                                                                                Balance: ${invoice.balance.toLocaleString()}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-12 text-muted-foreground">
                                                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                            <p className="font-medium">No invoices yet</p>
                                                            <p className="text-sm mb-4">Create your first invoice for this project</p>
                                                            <Button onClick={() => setShowCreateInvoice(true)}>
                                                                <Plus className="w-4 h-4 mr-2" />
                                                                Create Invoice
                                                            </Button>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>

                                    {/* Payment History */}
                                    {projectInvoices.some(inv => inv.payments.length > 0) && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base">💳 Recent Payments</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    {projectInvoices
                                                        .flatMap(inv => inv.payments.map(p => ({ ...p, invoiceNumber: inv.invoiceNumber })))
                                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                        .slice(0, 5)
                                                        .map(payment => (
                                                            <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 rounded-full bg-green-500/10">
                                                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium">${payment.amount.toLocaleString()}</div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {payment.invoiceNumber} • {payment.method.toUpperCase()}
                                                                            {payment.reference && ` • ${payment.reference}`}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right text-sm text-muted-foreground">
                                                                    {payment.date}
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </>
                            );
                        })()}
                    </TabsContent>

                    {/* Walkthrough Tab */}
                    <TabsContent value="walkthrough" className="mt-0 space-y-6">
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={() => setShowWalkthroughManager(true)}>
                                <ClipboardCheck className="w-4 h-4 mr-2" />
                                Manage Walkthroughs
                            </Button>
                            <Button variant="secondary" onClick={() => setShowEnhancedPunch(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Punch Item
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowCompletionCert(true)}
                                disabled={openPunch.length > 0}
                            >
                                <FileSignature className="w-4 h-4 mr-2" />
                                Completion Certificate
                            </Button>
                        </div>

                        {/* Upcoming Walkthroughs */}
                        {(() => {
                            const sessions = getWalkthroughsByProject(project.id);
                            const scheduled = sessions.filter(s => s.status === 'scheduled');
                            const completed = sessions.filter(s => s.status === 'completed');

                            return (
                                <div className="grid lg:grid-cols-2 gap-6">
                                    {/* Scheduled Sessions */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <ClipboardCheck className="w-5 h-5 text-primary" />
                                                Scheduled Walkthroughs
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {scheduled.length > 0 ? (
                                                <div className="space-y-3">
                                                    {scheduled.map(session => (
                                                        <div
                                                            key={session.id}
                                                            className="p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-transparent hover:border-primary/50 transition-colors"
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <div className="font-medium flex items-center gap-2">
                                                                        <span className="text-lg">
                                                                            {session.type === 'final' ? '✅' :
                                                                                session.type === 'punch' ? '🔧' :
                                                                                    session.type === 'mid-project' ? '🔄' : '📋'}
                                                                        </span>
                                                                        {session.type.charAt(0).toUpperCase() + session.type.slice(1).replace('-', ' ')} Walkthrough
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground mt-1">
                                                                        📅 {session.scheduledDate} {session.scheduledTime && `at ${session.scheduledTime}`}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground mt-1">
                                                                        👥 {session.attendees.map(a => a.name).join(', ')}
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        startWalkthrough(session.id);
                                                                        setShowClientWalkthrough(session);
                                                                    }}
                                                                >
                                                                    Start
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    <ClipboardCheck className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                                    <div>No walkthroughs scheduled</div>
                                                    <Button
                                                        variant="link"
                                                        onClick={() => setShowWalkthroughManager(true)}
                                                    >
                                                        Schedule one →
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Completed Sessions */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-success" />
                                                Completed Walkthroughs
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {completed.length > 0 ? (
                                                <div className="space-y-3">
                                                    {completed.map(session => (
                                                        <div
                                                            key={session.id}
                                                            className="p-4 rounded-lg border bg-muted/30"
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <div className="font-medium">
                                                                        {session.type.charAt(0).toUpperCase() + session.type.slice(1).replace('-', ' ')} Walkthrough
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        Completed {new Date(session.completedAt || '').toLocaleDateString()}
                                                                    </div>
                                                                    <div className="text-xs mt-1">
                                                                        {session.punchItemsCreated.length} issues found
                                                                    </div>
                                                                </div>
                                                                {session.overallRating && (
                                                                    <div className="flex items-center gap-0.5">
                                                                        {[1, 2, 3, 4, 5].map(n => (
                                                                            <Star
                                                                                key={n}
                                                                                className={cn(
                                                                                    'w-4 h-4',
                                                                                    n <= session.overallRating! ? 'fill-warning text-warning' : 'text-muted-foreground/30'
                                                                                )}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {session.clientFeedback && (
                                                                <div className="mt-2 text-sm italic text-muted-foreground">
                                                                    "{session.clientFeedback}"
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    No completed walkthroughs yet
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            );
                        })()}

                        {/* Completion Status */}
                        <Card className={cn(
                            "bg-gradient-to-r",
                            openPunch.length === 0 ? "from-success/10 to-transparent border-success/30" : "from-muted/50 to-transparent"
                        )}>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileSignature className="w-5 h-5" />
                                    Project Completion Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className={cn(
                                        "p-3 rounded-lg border text-center",
                                        project.punchList.every(p => p.completed) ? "bg-success/10 border-success/30" : "bg-muted/30"
                                    )}>
                                        <div className="text-2xl mb-1">
                                            {project.punchList.every(p => p.completed) ? '✅' : '📋'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Punch List</div>
                                        <div className="font-medium text-sm">
                                            {project.punchList.every(p => p.completed) ? 'Complete' : `${openPunch.length} Open`}
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "p-3 rounded-lg border text-center",
                                        getWalkthroughsByProject(project.id).some(s => s.type === 'final' && s.status === 'completed')
                                            ? "bg-success/10 border-success/30" : "bg-muted/30"
                                    )}>
                                        <div className="text-2xl mb-1">
                                            {getWalkthroughsByProject(project.id).some(s => s.type === 'final' && s.status === 'completed') ? '✅' : '🚶'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Final Walkthrough</div>
                                        <div className="font-medium text-sm">
                                            {getWalkthroughsByProject(project.id).some(s => s.type === 'final' && s.status === 'completed')
                                                ? 'Complete' : 'Pending'}
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "p-3 rounded-lg border text-center",
                                        (project.qaChecklists || []).some(c => c.type === 'closeout' && c.completedAt)
                                            ? "bg-success/10 border-success/30" : "bg-muted/30"
                                    )}>
                                        <div className="text-2xl mb-1">
                                            {(project.qaChecklists || []).some(c => c.type === 'closeout' && c.completedAt) ? '✅' : '📝'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">QA Closeout</div>
                                        <div className="font-medium text-sm">
                                            {(project.qaChecklists || []).some(c => c.type === 'closeout' && c.completedAt) ? 'Complete' : 'Pending'}
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "p-3 rounded-lg border text-center",
                                        getCertificateByProject(project.id)?.status === 'fully-executed'
                                            ? "bg-success/10 border-success/30" : "bg-muted/30"
                                    )}>
                                        <div className="text-2xl mb-1">
                                            {getCertificateByProject(project.id)?.status === 'fully-executed' ? '✅' : '🏆'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Certificate</div>
                                        <div className="font-medium text-sm">
                                            {getCertificateByProject(project.id)?.status === 'fully-executed' ? 'Signed' :
                                                getCertificateByProject(project.id) ? 'Pending Signatures' : 'Not Generated'}
                                        </div>
                                    </div>
                                </div>

                                {openPunch.length === 0 && (
                                    <div className="mt-4 text-center">
                                        <Button onClick={() => setShowCompletionCert(true)} size="lg">
                                            <FileSignature className="w-5 h-5 mr-2" />
                                            Generate Completion Certificate
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div >

            {/* Modals */}
            {
                showCODetail && (
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
                )
            }

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

            {
                executionSuccess && (
                    <ExecutionSuccessModal
                        open={!!executionSuccess}
                        onClose={() => setExecutionSuccess(null)}
                        {...executionSuccess}
                    />
                )
            }

            {
                captureSuccess && (
                    <CaptureSuccessModal
                        open={!!captureSuccess}
                        onClose={() => setCaptureSuccess(null)}
                        projectName={project.name}
                        log={captureSuccess.log}
                        extractedPunch={captureSuccess.extractedPunch}
                    />
                )
            }

            <PhotoCaptureModal
                open={showPhotoCapture}
                onClose={() => setShowPhotoCapture(false)}
                onCapture={(photo) => {
                    const label = photo.label.charAt(0).toUpperCase() + photo.label.slice(1);
                    updateProject(project.id, {
                        photos: [...project.photos, label + (photo.location ? ` - ${photo.location}` : '')],
                    });
                    toast.success(`Photo saved with "${label}" label!`);
                }}
            />

            {
                showQAChecklist && (
                    <QAChecklistModal
                        open={!!showQAChecklist}
                        onClose={() => setShowQAChecklist(null)}
                        projectId={project.id}
                        type={showQAChecklist}
                        onSave={(checklist) => {
                            const typeName = checklist.type.charAt(0).toUpperCase() + checklist.type.slice(1);
                            const completed = checklist.completedAt ? ' (Complete)' : '';
                            toast.success(`${typeName} Checklist${completed} saved!`);
                        }}
                    />
                )
            }

            {/* Walkthrough Modals */}
            <EnhancedPunchModal
                open={showEnhancedPunch}
                onClose={() => setShowEnhancedPunch(false)}
                onCreate={handleCreatePunch}
                teamMembers={getTeamMembers()}
                projectAreas={['Main Lobby', 'Hallway', 'Reception', 'Break Room', 'Office Area', 'Restroom', 'Elevator Area']}
            />

            <WalkthroughManager
                open={showWalkthroughManager}
                onClose={() => setShowWalkthroughManager(false)}
                project={project}
                sessions={getWalkthroughsByProject(project.id)}
                onCreateSession={(session) => createWalkthroughSession(session)}
                onStartSession={(id) => {
                    startWalkthrough(id);
                    const session = getWalkthroughsByProject(project.id).find(s => s.id === id);
                    if (session) {
                        setShowClientWalkthrough(session);
                        setShowWalkthroughManager(false);
                    }
                }}
            />

            {
                showClientWalkthrough && (
                    <ClientWalkthroughMode
                        open={!!showClientWalkthrough}
                        onClose={() => setShowClientWalkthrough(null)}
                        project={project}
                        session={showClientWalkthrough}
                        onAddPunchItem={handleCreatePunch}
                        onComplete={(rating, feedback) => {
                            completeWalkthrough(showClientWalkthrough.id, rating, feedback);
                        }}
                        onUpdateSession={(updates) => {
                            updateWalkthroughSession(showClientWalkthrough.id, updates);
                        }}
                        teamMembers={getTeamMembers()}
                    />
                )
            }

            <CompletionCertificateModal
                open={showCompletionCert}
                onClose={() => setShowCompletionCert(false)}
                project={project}
                certificate={getCertificateByProject(project.id)}
                onGenerate={(cert) => createCompletionCertificate(cert)}
                onAddSignature={(type, signature) => {
                    const cert = getCertificateByProject(project.id);
                    if (cert) {
                        addSignature(cert.id, type, signature);
                    }
                }}
            />

            {/* Invoice Modals */}
            <CreateInvoiceModal
                open={showCreateInvoice}
                onClose={() => {
                    setShowCreateInvoice(false);
                    setSuggestedInvoiceType(undefined);
                }}
                project={project}
                suggestedType={suggestedInvoiceType}
            />

            <InvoiceDetailModal
                open={!!showInvoiceDetail}
                onClose={() => setShowInvoiceDetail(null)}
                invoice={showInvoiceDetail}
                onRecordPayment={(invoice) => {
                    setShowInvoiceDetail(null);
                    setShowRecordPayment(invoice);
                }}
            />

            <RecordPaymentModal
                open={!!showRecordPayment}
                onClose={() => setShowRecordPayment(null)}
                invoice={showRecordPayment}
            />

            {/* Moisture Test Modal */}
            <AddMoistureTestModal
                open={showMoistureTest}
                onClose={() => setShowMoistureTest(false)}
                projectId={project.id}
                onCreate={(test) => {
                    addMoistureTest(project.id, test);
                }}
            />
        </>
    );
}
