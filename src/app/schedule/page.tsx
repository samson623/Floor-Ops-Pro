'use client';

import { useState } from 'react';
import { useSmartBack } from '@/hooks/use-smart-back';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useData } from '@/components/data-provider';
import { CalendarView } from '@/components/calendar-view';
import { DailyPlanning } from '@/components/daily-planning';
import { CrewManagement } from '@/components/crew-management';
import { CrewAssignmentDashboard } from '@/components/crew-assignment-dashboard';
import { PhaseTimeline } from '@/components/phase-timeline';
import {
    Calendar,
    Target,
    Users,
    LayoutGrid,
    Clock,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Zap
} from 'lucide-react';

export default function SchedulePage() {
    const { data } = useData();
    const [activeTab, setActiveTab] = useState('daily');

    // Record this page in navigation history for smart back navigation
    useSmartBack({ title: 'Schedule' });

    // Quick stats
    const activeProjects = data.projects.filter(p => p.status === 'active' || p.status === 'scheduled');
    const todayEntries = data.scheduleEntries.filter(
        e => e.date === new Date().toISOString().split('T')[0] && e.status !== 'cancelled'
    );
    const activeBlockers = data.blockers.filter(b => !b.resolvedAt);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            {/* Hero Header */}
            <div className="border-b bg-gradient-to-r from-primary/10 via-transparent to-chart-2/10">
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
                        <div className="pl-12 lg:pl-0">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary via-primary to-chart-1 text-primary-foreground shadow-lg shadow-primary/30">
                                    <Calendar className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                                        Master Schedule
                                    </h1>
                                    <p className="text-muted-foreground">
                                        Crew scheduling, job dependencies, and intelligent daily planning
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats - Scrollable on mobile */}
                        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap">
                            <QuickStat
                                icon={<Clock className="w-5 h-5 text-primary" />}
                                value={todayEntries.length}
                                label="Today's Jobs"
                                trend="+2 from yesterday"
                            />
                            <QuickStat
                                icon={<Users className="w-5 h-5 text-chart-2" />}
                                value={data.crews.length}
                                label="Active Crews"
                            />
                            <QuickStat
                                icon={<AlertTriangle className="w-5 h-5 text-warning" />}
                                value={activeBlockers.length}
                                label="Blockers"
                                variant="warning"
                            />
                            <QuickStat
                                icon={<CheckCircle2 className="w-5 h-5 text-success" />}
                                value={activeProjects.length}
                                label="Active Projects"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
                    <TabsList className="bg-muted/50 p-1.5 h-auto overflow-x-auto flex-nowrap gap-1 w-full sm:w-auto mobile-tabs">
                        <TabsTrigger
                            value="daily"
                            className="gap-2 px-4 min-h-[44px] flex-shrink-0 data-[state=active]:shadow-lg data-[state=active]:bg-background"
                        >
                            <Target className="w-4 h-4" />
                            <span className="hidden xs:inline">Daily Plan</span>
                            <Badge variant="secondary" className="ml-1 text-[10px] h-5 hidden sm:inline-flex">
                                Smart
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="calendar"
                            className="gap-2 px-4 min-h-[44px] flex-shrink-0 data-[state=active]:shadow-lg data-[state=active]:bg-background"
                        >
                            <Calendar className="w-4 h-4" />
                            <span className="hidden xs:inline">Calendar</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="crews"
                            className="gap-2 px-4 min-h-[44px] flex-shrink-0 data-[state=active]:shadow-lg data-[state=active]:bg-background"
                        >
                            <Users className="w-4 h-4" />
                            <span className="hidden xs:inline">Crews</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="gantt"
                            className="gap-2 px-4 min-h-[44px] flex-shrink-0 data-[state=active]:shadow-lg data-[state=active]:bg-background"
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span className="hidden xs:inline">Timelines</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Daily Planning Tab */}
                    <TabsContent value="daily" className="m-0">
                        <DailyPlanning />
                    </TabsContent>

                    {/* Calendar Tab */}
                    <TabsContent value="calendar" className="m-0">
                        <CalendarView />
                    </TabsContent>

                    {/* Crews Tab */}
                    <TabsContent value="crews" className="m-0 space-y-6">
                        <CrewAssignmentDashboard />
                        <CrewManagement />
                    </TabsContent>

                    {/* Gantt / Timeline Tab */}
                    <TabsContent value="gantt" className="m-0">
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-gradient-to-br from-chart-3 to-chart-3/80 text-white shadow-lg shadow-chart-3/30">
                                        <LayoutGrid className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Project Timelines</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Phase dependencies and progress for all active projects
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Project Timelines */}
                            <div className="space-y-6">
                                {activeProjects.map((project) => (
                                    <PhaseTimeline
                                        key={project.id}
                                        project={project}
                                        blockers={data.blockers}
                                    />
                                ))}

                                {activeProjects.length === 0 && (
                                    <Card className="border-dashed">
                                        <CardContent className="p-12 text-center">
                                            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                                                <LayoutGrid className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-lg font-semibold">No Active Projects</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Start by creating a new project or converting an estimate.
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

// Quick Stat Component
function QuickStat({
    icon,
    value,
    label,
    trend,
    variant = 'default'
}: {
    icon: React.ReactNode;
    value: number | string;
    label: string;
    trend?: string;
    variant?: 'default' | 'warning' | 'success';
}) {
    return (
        <div className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl border bg-background/80 backdrop-blur',
            variant === 'warning' && 'border-warning/30',
            variant === 'success' && 'border-success/30'
        )}>
            <div className={cn(
                'p-2 rounded-lg',
                variant === 'warning' && 'bg-warning/10',
                variant === 'success' && 'bg-success/10',
                variant === 'default' && 'bg-primary/10'
            )}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
                {trend && (
                    <p className="text-[10px] text-success flex items-center gap-1 mt-0.5">
                        <TrendingUp className="w-3 h-3" />
                        {trend}
                    </p>
                )}
            </div>
        </div>
    );
}
