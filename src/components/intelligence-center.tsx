'use client';

import { useState, useRef, useEffect } from 'react';
import { usePermissions } from '@/components/permission-context';
import {
    Brain,
    Sparkles,
    Upload,
    Mic,
    Send,
    AlertTriangle,
    CheckCircle2,
    Clock,
    ArrowRight,
    Calendar,
    Hammer,
    Truck,
    AlertOctagon,
    TrendingUp,
    ChevronDown,
    ChevronUp,
    FileText,
    Image as ImageIcon,
    Lock,
    ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// --- Mock Data Generators (Simulating "Senior PM" inputs) ---

const MOCK_PUNCH_ITEMS = [
    { id: 1, task: 'Grout haze removal', location: 'Lobby - Main Entrance', trade: 'Tile', priority: 'medium', due: 'Tomorrow' },
    { id: 2, task: 'Fix transition strip height', location: 'Corridor 2B -> Conf Room', trade: 'Flooring', priority: 'high', due: 'Today' },
    { id: 3, task: 'Touch up baseboard paint', location: 'Executive Suite 404', trade: 'Painter', priority: 'low', due: 'Friday' },
];

const MOCK_BLOCKERS = [
    { id: 1, issue: 'Moisture readings too high (85% RH)', area: 'Lvl 1 Slab', impact: 'Stops LVP install', responsible: 'GC / HVAC', status: 'critical' },
    { id: 2, issue: 'Missing adhesive delivery', area: 'All phases', impact: 'Delaying carpet tile start', responsible: 'Vendor (FloorSupplyCo)', status: 'high' },
];

const MOCK_DAILY_PLAN = [
    { time: '07:00', task: 'Crew A: Prep Subfloor', location: 'Lobby', details: 'Grind & Patch high spots', status: 'ready' },
    { time: '09:30', task: 'Moisture Test Check', location: 'Lobby', details: 'Re-verify RH% after HVAC adjustment', status: 'pending' },
    { time: '11:00', task: 'Material Drop', location: 'Loading Dock', details: 'Accept LVP Pallets (Use Forklift)', status: 'pending' },
    { time: '13:00', task: 'Crew B: Start Install', location: 'Corridor 2B', details: 'Start from East Wall', status: 'blocked' }, // Blocked by Adhesive
];

// --- Components ---

export function IntelligenceCenter() {
    const { can, getCurrentRoleInfo } = usePermissions();
    const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
    const [inputValue, setInputValue] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [activeTab, setActiveTab] = useState('insights');

    // Permission checks
    const canViewIntelligence = can('VIEW_INTELLIGENCE_CENTER');
    const canUseAI = can('USE_AI_ASSISTANT');
    const roleInfo = getCurrentRoleInfo();

    // Access denied screen for users without permission
    if (!canViewIntelligence) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <Card className="max-w-2xl w-full border-2 border-muted">
                    <CardContent className="p-12 text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                                <ShieldAlert className="w-10 h-10 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">Intelligence Center Access Required</h2>
                            <p className="text-muted-foreground text-lg">
                                This feature is available to management and coordination roles.
                            </p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <p className="text-sm font-medium">Your Current Role: {roleInfo?.label}</p>
                            <p className="text-sm text-muted-foreground">
                                Contact your administrator to request access to AI-powered project intelligence and analytics.
                            </p>
                        </div>
                        <div className="pt-4">
                            <Button variant="outline" onClick={() => window.history.back()}>
                                Return to Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Simulate analysis process
    const handleAnalyze = () => {
        if (!inputValue.trim()) return;
        setIsAnalyzing(true);
        setAnalysisComplete(false);

        // "Processing" simulation
        setTimeout(() => {
            setIsAnalyzing(false);
            setAnalysisComplete(true);
            setActiveTab('action-plan');
        }, 2000);
    };

    const handleQuickQuery = (query: string) => {
        setInputValue(query);
        // Auto-trigger analyze for demo flow? Or just let user click? 
        // Let's just set it so user can maybe edit before sending.
    };

    return (
        <div className="h-full flex flex-col space-y-6 p-4 md:p-8 max-w-7xl mx-auto">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-purple-600 flex items-center gap-2">
                        <Brain className="w-8 h-8 text-indigo-600" />
                        FloorOps Intelligence
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Turn messy field reality into structured, profitable actions.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                    <Badge variant="outline" className="bg-background text-xs">
                        GPT-4 Turbo
                    </Badge>
                    <Badge variant="outline" className="bg-background text-xs">
                        Flooring Knwoledge Base Active
                    </Badge>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Input & Context */}
                <div className="lg:col-span-1 space-y-4 flex flex-col">
                    <Card className="border shadow-sm flex-1 flex flex-col overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-4 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <div className="p-2 bg-primary rounded-lg">
                                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                                </div>
                                Field Input
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Notes, photos, or voice transcripts from the job site
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 flex-1 flex flex-col gap-4">
                            <Tabs value={inputMode} onValueChange={(v: any) => setInputMode(v)} className="w-full">
                                <TabsList className="w-full grid grid-cols-2">
                                    <TabsTrigger
                                        value="text"
                                        className="gap-2"
                                        onClick={() => setInputMode('text')}
                                    >
                                        <FileText className="w-4 h-4" /> Text
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="voice"
                                        className="gap-2"
                                        onClick={() => setInputMode('voice')}
                                    >
                                        <Mic className="w-4 h-4" /> Voice
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="relative flex-1 min-h-[240px]">
                                {inputMode === 'text' ? (
                                    <Textarea
                                        className="h-full resize-none p-4 text-base leading-relaxed bg-background border focus:border-primary transition-all"
                                        placeholder="e.g. 'Walked the site today. Room 302 has moisture issues. We're waiting on adhesive delivery for carpet tiles. The transition strip near the elevator is loose and needs fixing.'"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                    />
                                ) : (
                                    <div className="h-full bg-muted/30 border-2 border-dashed rounded-lg flex items-center justify-center flex-col gap-4">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-lg animate-pulse">
                                                <Mic className="w-10 h-10 text-white" />
                                            </div>
                                            <div className="absolute -inset-2 rounded-full border-4 border-red-300 animate-ping opacity-75"></div>
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="font-semibold text-lg">Recording...</p>
                                            <p className="text-sm text-muted-foreground">Click "Text" tab to stop</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setInputMode('text')}
                                        >
                                            Stop Recording
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 gap-2" onClick={() => { }}>
                                    <ImageIcon className="w-4 h-4" />
                                    Photos
                                </Button>
                                <Button
                                    className={cn(
                                        "flex-1 gap-2 bg-primary hover:bg-primary/90 transition-all",
                                        isAnalyzing && "opacity-80 cursor-not-allowed"
                                    )}
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing || !inputValue.trim()}
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Analyze
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Strategic Queries Shortcuts */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground px-2 uppercase tracking-wider">Quick Insights</p>
                        <div className="grid gap-2">
                            <Button
                                variant="outline"
                                className="justify-start h-auto py-3 px-4 text-left hover:bg-accent transition-all group"
                                onClick={() => handleQuickQuery("What needs to happen to finish by Friday?")}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <TrendingUp className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-sm">Critical Path</div>
                                        <div className="text-xs text-muted-foreground">Friday deadline analysis</div>
                                    </div>
                                </div>
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start h-auto py-3 px-4 text-left hover:bg-accent transition-all group"
                                onClick={() => handleQuickQuery("Show me the biggest risks for the next 7 days.")}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                        <AlertOctagon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-sm">Risk Radar</div>
                                        <div className="text-xs text-muted-foreground">7-day forecast</div>
                                    </div>
                                </div>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Output / Dashboard */}
                <div className="lg:col-span-2 flex flex-col overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-4 mb-6">
                            <TabsTrigger
                                value="insights"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-4 py-3 bg-transparent font-semibold transition-all"
                            >
                                Dashboard
                            </TabsTrigger>
                            <TabsTrigger
                                value="action-plan"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-4 py-3 bg-transparent font-semibold w-fit flex gap-2 transition-all"
                            >
                                Action Plan
                                {analysisComplete && <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] px-1.5 h-4 animate-pulse">New</Badge>}
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-auto space-y-6">
                            <TabsContent value="insights" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Dashboard View */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="col-span-1 border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                                Critical Risk
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-red-600 flex items-center gap-2 mb-2">
                                                Moisture High
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">Lobby Slab @ 85% RH. Stops removal of temporary protection.</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="col-span-1 border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                On Track
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-green-600 flex items-center gap-2 mb-2">
                                                Rough-in Complete
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">Lobby electrical floor boxes verified.</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className="shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-primary" />
                                            Weekly Progress Pulse
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                                            <div className="absolute inset-y-0 left-0 bg-green-500 w-[65%]" />
                                            <div className="absolute inset-y-0 left-[65%] bg-yellow-400 w-[15%]" />
                                            <div className="absolute inset-y-0 left-[80%] bg-muted-foreground/20 w-[20%]" />
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-green-600 font-medium">Completed (65%)</span>
                                            <span className="text-yellow-600 font-medium">At Risk (15%)</span>
                                            <span className="text-muted-foreground">Remaining (20%)</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="action-plan" className="mt-0 h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
                                {!analysisComplete ? (
                                    <div className="h-96 flex flex-col items-center justify-center text-muted-foreground space-y-4">
                                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Brain className="w-10 h-10 text-primary opacity-50" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="font-semibold text-lg">Ready to Analyze</p>
                                            <p className="text-sm max-w-md">Enter field notes and click <span className="font-semibold text-primary">Analyze</span> to generate an intelligent action plan.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* 1. Daily Plan Section */}
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                Suggested Daily Plan
                                            </h3>
                                            <div className="grid gap-3">{MOCK_DAILY_PLAN.map((item, i) => (
                                                <div key={i} className={cn(
                                                    "group flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-all",
                                                    item.status === 'blocked' ? 'border-red-200 bg-red-50/30' : 'border-border hover:border-primary/50'
                                                )}>
                                                    <div className="w-16 font-mono font-bold text-sm text-primary bg-primary/10 px-2 py-1 rounded">{item.time}</div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-foreground">{item.task}</span>
                                                            {item.status === 'blocked' && <Badge variant="destructive" className="h-5 text-[10px]">Blocked</Badge>}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                                                            <Truck className="w-3 h-3" /> {item.location}
                                                            <span className="text-border">|</span>
                                                            {item.details}
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ChevronDown className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}</div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* 2. Punch Items */}
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                    <Hammer className="w-4 h-4" />
                                                    Extracted Punch Items
                                                </h3>
                                                <ScrollArea className="h-[300px] w-full rounded-xl border bg-muted/20 p-4">
                                                    <div className="space-y-3">
                                                        {MOCK_PUNCH_ITEMS.map((item) => (
                                                            <Card key={item.id} className="shadow-sm bg-background">
                                                                <CardContent className="p-3">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'} className="text-[10px] h-5 capitalize">
                                                                            {item.priority}
                                                                        </Badge>
                                                                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{item.trade}</span>
                                                                    </div>
                                                                    <div className="font-medium text-sm leading-tight mb-1">{item.task}</div>
                                                                    <div className="text-xs text-muted-foreground">{item.location}</div>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </div>

                                            {/* 3. Blockers / Risks */}
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                    <AlertOctagon className="w-4 h-4" />
                                                    Critical Blockers
                                                </h3>
                                                <div className="space-y-3">
                                                    {MOCK_BLOCKERS.map((blocker) => (
                                                        <div key={blocker.id} className="p-4 rounded-xl border-l-4 border-l-red-500 bg-red-50/30 border border-t-border border-r-border border-b-border">
                                                            <div className="flex items-start gap-3">
                                                                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                                                                <div>
                                                                    <div className="font-bold text-sm text-red-900 dark:text-red-200">{blocker.issue}</div>
                                                                    <div className="text-xs text-red-700/80 dark:text-red-300/80 mt-1">
                                                                        Impact: {blocker.impact}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mt-2">
                                                                        <Badge variant="outline" className="text-[10px] border-red-200 bg-red-100 text-red-700">
                                                                            {blocker.responsible}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <Button variant="outline" className="w-full text-xs text-muted-foreground border-dashed">
                                                        + Add Manually
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
