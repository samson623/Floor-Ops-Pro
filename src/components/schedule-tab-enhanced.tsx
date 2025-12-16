'use client';

import { useState, useMemo } from 'react';
import {
    Project,
    SchedulePhase,
    PhaseType
} from '@/lib/data';
import { usePermissions, PermissionGate } from '@/components/permission-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Calendar,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Circle,
    ArrowRight,
    GitBranch,
    TrendingUp,
    TrendingDown,
    Minus,
    ChevronDown,
    ChevronRight,
    Plus,
    Users,
    AlertCircle,
    Flag,
    Target
} from 'lucide-react';

interface ScheduleTabEnhancedProps {
    project: Project;
    onUpdate?: (updates: Partial<Project>) => void;
}

const PHASE_COLORS: Record<PhaseType, { bg: string; text: string; border: string }> = {
    demo: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500' },
    prep: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500' },
    acclimation: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500' },
    install: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500' },
    cure: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500' },
    punch: { bg: 'bg-pink-500/10', text: 'text-pink-600', border: 'border-pink-500' },
    closeout: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500' }
};

const STATUS_CONFIG = {
    'completed': { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500' },
    'in-progress': { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500' },
    'pending': { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-400' },
    'blocked': { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500' },
    'delayed': { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500' }
};

export function ScheduleTabEnhanced({ project, onUpdate }: ScheduleTabEnhancedProps) {
    const { can } = usePermissions();
    const [expandedPhases, setExpandedPhases] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'timeline' | 'list' | 'gantt'>('timeline');

    const schedulePhases = project.schedulePhases || [];

    // Calculate metrics
    const metrics = useMemo(() => {
        const completed = schedulePhases.filter(p => p.status === 'completed').length;
        const inProgress = schedulePhases.filter(p => p.status === 'in-progress').length;
        const delayed = schedulePhases.filter(p => (p.varianceDays || 0) > 0).length;
        const criticalPath = schedulePhases.filter(p => p.isCriticalPath);
        const totalVariance = schedulePhases.reduce((sum, p) => sum + (p.varianceDays || 0), 0);
        const overallProgress = schedulePhases.length > 0
            ? schedulePhases.reduce((sum, p) => sum + p.progress, 0) / schedulePhases.length
            : 0;

        return {
            completed,
            inProgress,
            delayed,
            criticalPathCount: criticalPath.length,
            totalVariance,
            overallProgress
        };
    }, [schedulePhases]);

    // Get phase dependencies as a map
    const dependencyMap = useMemo(() => {
        const map = new Map<string, SchedulePhase[]>();
        schedulePhases.forEach(phase => {
            phase.dependencies.forEach(depId => {
                const dep = schedulePhases.find(p => p.id === depId);
                if (dep) {
                    if (!map.has(phase.id)) map.set(phase.id, []);
                    map.get(phase.id)!.push(dep);
                }
            });
        });
        return map;
    }, [schedulePhases]);

    const togglePhase = (phaseId: string) => {
        setExpandedPhases(prev =>
            prev.includes(phaseId)
                ? prev.filter(id => id !== phaseId)
                : [...prev, phaseId]
        );
    };

    // Calculate bar position for Gantt-like view
    const getPhaseBarStyles = (phase: SchedulePhase) => {
        const allDates = schedulePhases.flatMap(p => [
            new Date(p.startDate).getTime(),
            new Date(p.endDate).getTime()
        ]);
        const minDate = Math.min(...allDates);
        const maxDate = Math.max(...allDates);
        const totalDuration = maxDate - minDate;

        const startOffset = ((new Date(phase.startDate).getTime() - minDate) / totalDuration) * 100;
        const width = ((new Date(phase.endDate).getTime() - new Date(phase.startDate).getTime()) / totalDuration) * 100;

        return {
            left: `${Math.max(0, startOffset)}%`,
            width: `${Math.min(100 - startOffset, Math.max(5, width))}%`
        };
    };

    // Render phase card for timeline view
    const renderPhaseCard = (phase: SchedulePhase) => {
        const StatusIcon = STATUS_CONFIG[phase.status]?.icon || Circle;
        const statusColor = STATUS_CONFIG[phase.status]?.color || 'text-gray-400';
        const phaseColor = PHASE_COLORS[phase.phase] || PHASE_COLORS.install;
        const dependencies = dependencyMap.get(phase.id) || [];
        const isExpanded = expandedPhases.includes(phase.id);

        return (
            <Card
                key={phase.id}
                className={`transition-all ${phase.isCriticalPath ? 'ring-2 ring-red-500/50' : ''}`}
            >
                <CardHeader
                    className="cursor-pointer hover:bg-muted/30 transition-colors pb-3"
                    onClick={() => togglePhase(phase.id)}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${phaseColor.bg}`}>
                                <StatusIcon className={`w-5 h-5 ${statusColor}`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-base">{phase.name}</CardTitle>
                                    <Badge variant="outline" className={`capitalize ${phaseColor.text}`}>
                                        {phase.phase}
                                    </Badge>
                                    {phase.isCriticalPath && (
                                        <Badge variant="destructive" className="text-xs">
                                            <Flag className="w-3 h-3 mr-1" />
                                            Critical Path
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                                    </span>
                                    {phase.assignedCrewId && (
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5" />
                                            {phase.assignedCrewId}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Variance indicator */}
                            <PermissionGate permission="VIEW_SCHEDULE_VARIANCE">
                                {(phase.varianceDays ?? 0) !== 0 && (
                                    <div className={`flex items-center gap-1 text-sm font-medium ${(phase.varianceDays ?? 0) > 0 ? 'text-red-500' : 'text-green-500'
                                        }`}>
                                        {(phase.varianceDays ?? 0) > 0 ? (
                                            <TrendingDown className="w-4 h-4" />
                                        ) : (
                                            <TrendingUp className="w-4 h-4" />
                                        )}
                                        {Math.abs(phase.varianceDays ?? 0)}d
                                    </div>
                                )}
                                {phase.varianceDays === 0 && phase.status === 'completed' && (
                                    <div className="flex items-center gap-1 text-sm font-medium text-green-500">
                                        <Minus className="w-4 h-4" />
                                        On time
                                    </div>
                                )}
                            </PermissionGate>

                            {/* Progress */}
                            <div className="text-right">
                                <span className="text-lg font-bold">{phase.progress}%</span>
                            </div>

                            {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            )}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <Progress value={phase.progress} className="mt-3 h-2" />
                </CardHeader>

                {isExpanded && (
                    <CardContent className="pt-0 space-y-4">
                        {/* Dependencies */}
                        <PermissionGate permission="VIEW_SCHEDULE_DEPENDENCIES">
                            {dependencies.length > 0 && (
                                <div className="p-3 bg-muted/30 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                                        <GitBranch className="w-4 h-4" />
                                        Dependencies
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {dependencies.map(dep => (
                                            <Badge
                                                key={dep.id}
                                                variant={dep.status === 'completed' ? 'default' : 'secondary'}
                                                className="flex items-center gap-1"
                                            >
                                                {dep.status === 'completed' ? (
                                                    <CheckCircle2 className="w-3 h-3" />
                                                ) : (
                                                    <Clock className="w-3 h-3" />
                                                )}
                                                {dep.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </PermissionGate>

                        {/* Baseline comparison */}
                        <PermissionGate permission="VIEW_SCHEDULE_VARIANCE">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-muted/30 rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">Baseline</p>
                                    <p className="text-sm font-medium">
                                        {phase.baselineStart ? new Date(phase.baselineStart).toLocaleDateString() : 'N/A'} - {phase.baselineEnd ? new Date(phase.baselineEnd).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div className="p-3 bg-muted/30 rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">Actual</p>
                                    <p className="text-sm font-medium">
                                        {phase.actualStartDate ? new Date(phase.actualStartDate).toLocaleDateString() : 'Not started'}
                                        {phase.actualEndDate && ` - ${new Date(phase.actualEndDate).toLocaleDateString()}`}
                                    </p>
                                </div>
                            </div>
                        </PermissionGate>

                        {/* Notes & Blocking */}
                        {(phase.notes || phase.blockingReason) && (
                            <div className="space-y-2">
                                {phase.blockingReason && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                        <div className="flex items-center gap-2 text-red-600 font-medium text-sm">
                                            <AlertTriangle className="w-4 h-4" />
                                            Blocked: {phase.blockingReason}
                                        </div>
                                    </div>
                                )}
                                {phase.notes && (
                                    <p className="text-sm text-muted-foreground">{phase.notes}</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>
        );
    };

    // Render Gantt-like row
    const renderGanttRow = (phase: SchedulePhase) => {
        const phaseColor = PHASE_COLORS[phase.phase] || PHASE_COLORS.install;
        const barStyles = getPhaseBarStyles(phase);

        return (
            <div key={phase.id} className="flex items-center gap-4 py-2 border-b last:border-b-0">
                <div className="w-48 shrink-0">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`capitalize text-xs ${phaseColor.text}`}>
                            {phase.phase}
                        </Badge>
                        <span className="text-sm font-medium truncate">{phase.name}</span>
                    </div>
                </div>
                <div className="flex-1 relative h-8 bg-muted/30 rounded">
                    <div
                        className={`absolute top-1 bottom-1 rounded ${STATUS_CONFIG[phase.status]?.bg || 'bg-gray-400'
                            } transition-all`}
                        style={barStyles}
                    >
                        <div
                            className="h-full bg-white/30 rounded"
                            style={{ width: `${phase.progress}%` }}
                        />
                    </div>
                    {phase.isCriticalPath && (
                        <Flag className="absolute -right-1 -top-1 w-3 h-3 text-red-500" />
                    )}
                </div>
                <div className="w-12 text-right text-sm font-medium">
                    {phase.progress}%
                </div>
            </div>
        );
    };

    // Empty state
    if (schedulePhases.length === 0) {
        return (
            <div className="space-y-6">
                <Card className="border-dashed">
                    <CardContent className="pt-12 pb-12 text-center">
                        <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Schedule Phases Defined</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Define schedule phases with dependencies to track project progress and identify the critical path.
                        </p>
                        <PermissionGate permission="EDIT_SCHEDULE_DEPENDENCIES">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Schedule Phase
                            </Button>
                        </PermissionGate>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Target className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Overall Progress</p>
                                <p className="text-2xl font-bold">{Math.round(metrics.overallProgress)}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold">{metrics.completed}/{schedulePhases.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Clock className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">In Progress</p>
                                <p className="text-2xl font-bold">{metrics.inProgress}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-500/10">
                                <Flag className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Critical Path</p>
                                <p className="text-2xl font-bold">{metrics.criticalPathCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <PermissionGate permission="VIEW_SCHEDULE_VARIANCE">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${metrics.totalVariance > 0 ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                                    {metrics.totalVariance > 0 ? (
                                        <TrendingDown className="w-5 h-5 text-red-500" />
                                    ) : (
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Variance</p>
                                    <p className={`text-2xl font-bold ${metrics.totalVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {metrics.totalVariance > 0 ? '+' : ''}{metrics.totalVariance}d
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </PermissionGate>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Schedule Phases</h3>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'timeline' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('timeline')}
                    >
                        Timeline
                    </Button>
                    <Button
                        variant={viewMode === 'gantt' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('gantt')}
                    >
                        Gantt
                    </Button>
                    <PermissionGate permission="EDIT_SCHEDULE_DEPENDENCIES">
                        <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Phase
                        </Button>
                    </PermissionGate>
                </div>
            </div>

            {/* Timeline View */}
            {viewMode === 'timeline' && (
                <div className="space-y-4">
                    {schedulePhases.map(phase => renderPhaseCard(phase))}
                </div>
            )}

            {/* Gantt View */}
            {viewMode === 'gantt' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Project Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {schedulePhases.map(phase => renderGanttRow(phase))}
                        </div>
                        {/* Legend */}
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-green-500" /> Completed
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-blue-500" /> In Progress
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded bg-gray-400" /> Pending
                            </div>
                            <div className="flex items-center gap-1">
                                <Flag className="w-3 h-3 text-red-500" /> Critical Path
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
