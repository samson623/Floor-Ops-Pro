'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useData } from './data-provider';
import { toast } from 'sonner';
import {
    PHASE_CONFIGS,
    DailyPlanItem,
    ProjectBlocker
} from '@/lib/data';
import {
    getAvailableWork,
    getCrewAvailability,
    autoScheduleDate
} from '@/lib/scheduling-engine';
import {
    Sparkles,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Users,
    Truck,
    Package,
    CloudSun,
    Calendar,
    Play,
    ChevronRight,
    Zap,
    Target,
    AlertCircle,
    ArrowRight
} from 'lucide-react';

interface DailyPlanningProps {
    onScheduleWork?: (item: DailyPlanItem) => void;
}

export function DailyPlanning({ onScheduleWork }: DailyPlanningProps) {
    const { data, isLoaded } = useData();
    // Use a static initial value for SSR, then update on client
    const [selectedDate, setSelectedDate] = useState('2024-12-16');
    const [filter, setFilter] = useState<'all' | 'ready' | 'blocked'>('all');
    const [mounted, setMounted] = useState(false);

    // Update date on client mount to avoid hydration mismatch
    useEffect(() => {
        setSelectedDate(new Date().toISOString().split('T')[0]);
        setMounted(true);
    }, []);

    // Get available work for selected date
    const availableWork = useMemo(() => {
        return getAvailableWork(selectedDate, data);
    }, [selectedDate, data]);

    // Filter work items
    const filteredWork = useMemo(() => {
        if (filter === 'ready') return availableWork.filter(w => w.readyToStart);
        if (filter === 'blocked') return availableWork.filter(w => !w.readyToStart);
        return availableWork;
    }, [availableWork, filter]);

    // Stats
    const stats = useMemo(() => {
        const ready = availableWork.filter(w => w.readyToStart).length;
        const blocked = availableWork.filter(w => !w.readyToStart).length;
        const totalHours = availableWork
            .filter(w => w.readyToStart)
            .reduce((sum, w) => sum + (w.estimatedHours / 3), 0); // 1/3 per day

        return { ready, blocked, totalHours: Math.round(totalHours) };
    }, [availableWork]);

    // Crew availability for the day
    const crewStats = useMemo(() => {
        return data.crews.map(crew => {
            const avail = getCrewAvailability(
                crew,
                selectedDate,
                data.crewAvailability,
                data.scheduleEntries
            );
            return {
                crew,
                ...avail
            };
        });
    }, [selectedDate, data.crews, data.crewAvailability, data.scheduleEntries]);

    // Date navigation helpers
    const goToDate = (days: number) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(dateStr);
        selected.setHours(0, 0, 0, 0);

        const diff = (selected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

        if (diff === 0) return 'Today';
        if (diff === 1) return 'Tomorrow';
        if (diff === -1) return 'Yesterday';

        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const getCrew = (crewId?: string) => data.crews.find(c => c.id === crewId);

    return (
        <div className="space-y-6">
            {/* Header with Date Selector */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 via-card to-primary/5 overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30">
                                <Target className="w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                                    What can we do {formatDate(selectedDate).toLowerCase()}?
                                </h1>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    Intelligent work planning based on dependencies, materials, and crew availability
                                </p>
                            </div>
                        </div>

                        {/* Date Picker */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToDate(-1)}
                                className="h-9"
                            >
                                ← Prev
                            </Button>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="h-9 px-3 rounded-lg border bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToDate(1)}
                                className="h-9"
                            >
                                Next →
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                                className="h-9 ml-2"
                            >
                                Today
                            </Button>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                        <StatCard
                            icon={<CheckCircle2 className="w-5 h-5 text-success" />}
                            label="Ready to Start"
                            value={stats.ready}
                            color="success"
                        />
                        <StatCard
                            icon={<AlertTriangle className="w-5 h-5 text-warning" />}
                            label="Blocked"
                            value={stats.blocked}
                            color="warning"
                        />
                        <StatCard
                            icon={<Clock className="w-5 h-5 text-primary" />}
                            label="Available Hours"
                            value={`${stats.totalHours}h`}
                            color="primary"
                        />
                        <StatCard
                            icon={<Users className="w-5 h-5 text-chart-2" />}
                            label="Crews Available"
                            value={crewStats.filter(c => c.available).length}
                            color="chart-2"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Crew Availability Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {crewStats.map(({ crew, available, hoursRemaining, notes }) => (
                    <Card key={crew.id} className={cn(
                        'border transition-all',
                        available ? 'border-success/30' : 'border-destructive/30 bg-destructive/5'
                    )}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                                        style={{ backgroundColor: crew.color }}
                                    >
                                        {crew.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{crew.name}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {crew.members.length} members • {crew.homeBase}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {available ? (
                                        <>
                                            <div className="text-2xl font-bold text-success">{hoursRemaining}h</div>
                                            <div className="text-xs text-muted-foreground">available</div>
                                        </>
                                    ) : (
                                        <>
                                            <Badge variant="destructive" className="text-xs">Unavailable</Badge>
                                            {notes && <p className="text-xs text-muted-foreground mt-1">{notes}</p>}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Crew capacity bar */}
                            {available && (
                                <div className="mt-3">
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all bg-gradient-to-r from-success to-success/70"
                                            style={{ width: `${(hoursRemaining / crew.maxDailyCapacity) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        {crew.maxDailyCapacity - hoursRemaining}h booked / {crew.maxDailyCapacity}h capacity
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filter Tabs + Auto Schedule */}
            <div className="flex items-center justify-between">
                <div className="flex bg-muted rounded-xl p-1">
                    {[
                        { key: 'all', label: 'All Work', count: availableWork.length },
                        { key: 'ready', label: 'Ready', count: stats.ready },
                        { key: 'blocked', label: 'Blocked', count: stats.blocked },
                    ].map((tab) => (
                        <Button
                            key={tab.key}
                            variant={filter === tab.key ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setFilter(tab.key as typeof filter)}
                            className={cn(
                                'gap-2 px-4 transition-all',
                                filter === tab.key && 'shadow-md'
                            )}
                        >
                            {tab.label}
                            <Badge variant={filter === tab.key ? 'secondary' : 'outline'} className="text-[10px] h-5">
                                {tab.count}
                            </Badge>
                        </Button>
                    ))}
                </div>

                <Button
                    className="gap-2 shadow-lg shadow-primary/20"
                    disabled={stats.ready === 0}
                    onClick={() => {
                        const result = autoScheduleDate(selectedDate, data);
                        if (result.length > 0) {
                            const projectNames = result.map(r => {
                                const project = data.projects.find(p => p.id === r.projectId);
                                return project?.name || `Project ${r.projectId}`;
                            });
                            toast.success(`Auto-scheduled ${result.length} work item${result.length > 1 ? 's' : ''}!`, {
                                description: projectNames.join(', ')
                            });
                        } else {
                            toast.info('No items could be auto-scheduled', {
                                description: 'All crews may be at capacity or work items have blockers.'
                            });
                        }
                    }}
                >
                    <Sparkles className="w-4 h-4" />
                    Auto-Schedule Ready Work
                </Button>
            </div>

            {/* Work Items */}
            <div className="grid gap-4">
                {filteredWork.map((item) => (
                    <WorkItemCard
                        key={`${item.projectId}-${item.phase}`}
                        item={item}
                        crew={getCrew(item.recommendedCrewId)}
                        onSchedule={() => onScheduleWork?.(item)}
                    />
                ))}

                {filteredWork.length === 0 && (
                    <Card className="border-dashed">
                        <CardContent className="p-12 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">No work found</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {filter === 'ready'
                                    ? 'No work is currently ready to start. Check blocked items for details.'
                                    : filter === 'blocked'
                                        ? 'No blocked work items. Great news!'
                                        : 'No active projects need work on this date.'}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({ icon, label, value, color }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
}) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-background/80 backdrop-blur border">
            <div className={cn('p-2 rounded-lg', `bg-${color}/10`)}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
            </div>
        </div>
    );
}

// Work Item Card
function WorkItemCard({
    item,
    crew,
    onSchedule
}: {
    item: DailyPlanItem;
    crew?: { id: string; name: string; color: string };
    onSchedule?: () => void;
}) {
    const config = PHASE_CONFIGS[item.phase];
    const [expanded, setExpanded] = useState(false);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-destructive text-destructive-foreground';
            case 'medium': return 'bg-warning text-warning-foreground';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const getBlockerIcon = (type: ProjectBlocker['type']) => {
        switch (type) {
            case 'dependency': return <ArrowRight className="w-3 h-3" />;
            case 'material': return <Package className="w-3 h-3" />;
            case 'weather': return <CloudSun className="w-3 h-3" />;
            case 'crew': return <Users className="w-3 h-3" />;
            case 'inspection': return <AlertCircle className="w-3 h-3" />;
            default: return <AlertTriangle className="w-3 h-3" />;
        }
    };

    return (
        <Card className={cn(
            'overflow-hidden transition-all hover:shadow-lg',
            item.readyToStart
                ? 'border-success/30 hover:border-success/50'
                : 'border-warning/30 hover:border-warning/50'
        )}>
            <CardContent className="p-0">
                <div className="flex items-stretch">
                    {/* Status Bar */}
                    <div
                        className={cn(
                            'w-1.5 flex-shrink-0',
                            item.readyToStart ? 'bg-success' : 'bg-warning'
                        )}
                    />

                    {/* Main Content */}
                    <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                {/* Phase Icon */}
                                <div className={cn(
                                    'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                                    item.readyToStart
                                        ? 'bg-success/10'
                                        : 'bg-warning/10'
                                )}>
                                    {config.icon}
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold">{item.projectName}</h3>
                                        <Badge className={cn('text-[10px] h-5', getPriorityColor(item.priority))}>
                                            {item.priority.toUpperCase()}
                                        </Badge>
                                        {item.readyToStart && (
                                            <Badge variant="outline" className="text-[10px] h-5 border-success text-success">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Ready
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        {config.label} • {item.projectAddress}
                                    </p>

                                    {/* Quick Stats */}
                                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            ~{Math.round(item.estimatedHours / 3)}h today
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5" />
                                            {item.requiredCrew} crew
                                        </span>
                                        {item.travelMinutes && (
                                            <span className="flex items-center gap-1">
                                                <Truck className="w-3.5 h-3.5" />
                                                {item.travelMinutes} min
                                            </span>
                                        )}
                                        <span className={cn(
                                            'flex items-center gap-1',
                                            item.materialReady ? 'text-success' : 'text-warning'
                                        )}>
                                            <Package className="w-3.5 h-3.5" />
                                            {item.materialReady ? 'Materials Ready' : 'Awaiting Materials'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {crew && (
                                    <div
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow"
                                        style={{ backgroundColor: crew.color }}
                                    >
                                        {crew.name}
                                    </div>
                                )}
                                {item.readyToStart ? (
                                    <Button
                                        onClick={onSchedule}
                                        className="gap-2 shadow-lg shadow-primary/20"
                                    >
                                        <Play className="w-4 h-4" />
                                        Schedule
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={() => setExpanded(!expanded)}
                                        className="gap-2"
                                    >
                                        <AlertTriangle className="w-4 h-4 text-warning" />
                                        {item.blockers.length} Blocker{item.blockers.length !== 1 ? 's' : ''}
                                        <ChevronRight className={cn(
                                            'w-4 h-4 transition-transform',
                                            expanded && 'rotate-90'
                                        )} />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Blockers Detail */}
                        {expanded && item.blockers.length > 0 && (
                            <div className="mt-4 p-4 rounded-xl bg-warning/5 border border-warning/20">
                                <h4 className="text-sm font-semibold text-warning flex items-center gap-2 mb-3">
                                    <AlertTriangle className="w-4 h-4" />
                                    Blocking Issues
                                </h4>
                                <div className="space-y-2">
                                    {item.blockers.map((blocker, idx) => (
                                        <div
                                            key={blocker.id || idx}
                                            className="flex items-start gap-2 p-2 rounded-lg bg-background border"
                                        >
                                            <div className={cn(
                                                'p-1.5 rounded-md mt-0.5',
                                                blocker.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                                                    blocker.priority === 'medium' ? 'bg-warning/10 text-warning' :
                                                        'bg-muted text-muted-foreground'
                                            )}>
                                                {getBlockerIcon(blocker.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium">{blocker.description}</p>
                                                <p className="text-xs text-muted-foreground capitalize mt-0.5">
                                                    {blocker.type} • {blocker.priority} priority
                                                </p>
                                            </div>
                                            <Button size="sm" variant="ghost" className="text-xs shrink-0">
                                                Resolve
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
