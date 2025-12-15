'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Project, JobPhase, PHASE_CONFIGS, ProjectBlocker } from '@/lib/data';
import {
    isPhaseComplete,
    getCurrentProjectPhase,
    getPhaseBlockers
} from '@/lib/scheduling-engine';
import {
    CheckCircle2,
    Circle,
    AlertTriangle,
    Play,
    Lock,
    ArrowRight,
    Clock,
    Package,
    Users
} from 'lucide-react';

interface PhaseTimelineProps {
    project: Project;
    blockers?: ProjectBlocker[];
    onSelectPhase?: (phase: JobPhase) => void;
}

const PHASE_ORDER: JobPhase[] = ['demo', 'prep', 'acclimation', 'install', 'cure', 'punch', 'closeout'];

export function PhaseTimeline({ project, blockers = [], onSelectPhase }: PhaseTimelineProps) {
    const currentPhase = getCurrentProjectPhase(project);

    const phases = useMemo(() => {
        return PHASE_ORDER.map((phase, idx) => {
            const config = PHASE_CONFIGS[phase];
            const isComplete = isPhaseComplete(project, phase);
            const isCurrent = phase === currentPhase;
            const phaseBlockers = getPhaseBlockers(project, phase, blockers);
            const isBlocked = phaseBlockers.length > 0;
            const canStart = !isBlocked && (idx === 0 || isPhaseComplete(project, PHASE_ORDER[idx - 1]));

            let status: 'completed' | 'current' | 'blocked' | 'upcoming' = 'upcoming';
            if (isComplete) status = 'completed';
            else if (isCurrent && isBlocked) status = 'blocked';
            else if (isCurrent) status = 'current';
            else if (isBlocked) status = 'blocked';

            return {
                phase,
                config,
                status,
                blockers: phaseBlockers,
                canStart,
            };
        });
    }, [project, currentPhase, blockers]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-5 h-5 text-success" />;
            case 'current':
                return <Play className="w-5 h-5 text-primary" />;
            case 'blocked':
                return <AlertTriangle className="w-5 h-5 text-warning" />;
            default:
                return <Circle className="w-5 h-5 text-muted-foreground/30" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'border-success bg-success/5';
            case 'current':
                return 'border-primary bg-primary/5 shadow-lg shadow-primary/10';
            case 'blocked':
                return 'border-warning bg-warning/5';
            default:
                return 'border-muted bg-muted/30';
        }
    };

    const getConnectorColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-success';
            default:
                return 'bg-muted';
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                            <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Project Timeline</CardTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Phase dependencies for {project.name}
                            </p>
                        </div>
                    </div>
                    <Badge
                        className={cn(
                            'text-xs',
                            project.progress >= 100
                                ? 'bg-success text-success-foreground'
                                : 'bg-primary text-primary-foreground'
                        )}
                    >
                        {project.progress}% Complete
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                {/* Horizontal Timeline */}
                <div className="relative">
                    {/* Progress Bar Background */}
                    <div className="absolute top-6 left-0 right-0 h-1 bg-muted rounded-full" />

                    {/* Progress Bar Fill */}
                    <div
                        className="absolute top-6 left-0 h-1 bg-gradient-to-r from-success via-success to-primary rounded-full transition-all duration-500"
                        style={{
                            width: `${Math.max(0, (phases.findIndex(p => p.status === 'current') / (phases.length - 1)) * 100)}%`
                        }}
                    />

                    {/* Phase Nodes */}
                    <div className="relative flex justify-between">
                        {phases.map(({ phase, config, status, blockers: phaseBlockers }, idx) => (
                            <div
                                key={phase}
                                className="flex flex-col items-center"
                                style={{ width: `${100 / phases.length}%` }}
                            >
                                {/* Node */}
                                <div
                                    onClick={() => onSelectPhase?.(phase)}
                                    className={cn(
                                        'relative w-12 h-12 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all hover:scale-110 z-10 bg-background',
                                        getStatusColor(status)
                                    )}
                                >
                                    {status === 'completed' ? (
                                        <CheckCircle2 className="w-6 h-6 text-success" />
                                    ) : (
                                        <span className="text-xl">{config.icon}</span>
                                    )}

                                    {/* Current indicator pulse */}
                                    {status === 'current' && (
                                        <div className="absolute inset-0 rounded-xl border-2 border-primary animate-ping opacity-50" />
                                    )}

                                    {/* Blocker indicator */}
                                    {phaseBlockers.length > 0 && status !== 'completed' && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-warning text-warning-foreground text-[10px] font-bold flex items-center justify-center shadow">
                                            {phaseBlockers.length}
                                        </div>
                                    )}
                                </div>

                                {/* Label */}
                                <div className="mt-3 text-center">
                                    <p className={cn(
                                        'text-xs font-semibold',
                                        status === 'completed' && 'text-success',
                                        status === 'current' && 'text-primary',
                                        status === 'blocked' && 'text-warning',
                                        status === 'upcoming' && 'text-muted-foreground'
                                    )}>
                                        {config.label}
                                    </p>

                                    {/* Duration/Timer info */}
                                    {config.estimatedHours > 0 && (
                                        <p className="text-[10px] text-muted-foreground mt-0.5">
                                            ~{config.estimatedHours}h
                                        </p>
                                    )}
                                    {config.acclimationTime && (
                                        <p className="text-[10px] text-muted-foreground mt-0.5">
                                            {config.acclimationTime}h wait
                                        </p>
                                    )}
                                    {config.cureTime && (
                                        <p className="text-[10px] text-muted-foreground mt-0.5">
                                            {config.cureTime}h cure
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dependency Legend */}
                <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-4 h-4 rounded border-2 border-success bg-success/10 flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 text-success" />
                        </div>
                        Completed
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-4 h-4 rounded border-2 border-primary bg-primary/10 flex items-center justify-center">
                            <Play className="w-3 h-3 text-primary" />
                        </div>
                        In Progress
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-4 h-4 rounded border-2 border-warning bg-warning/10 flex items-center justify-center">
                            <AlertTriangle className="w-3 h-3 text-warning" />
                        </div>
                        Blocked
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-4 h-4 rounded border-2 border-muted bg-muted/30 flex items-center justify-center">
                            <Lock className="w-3 h-3 text-muted-foreground" />
                        </div>
                        Upcoming
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Compact vertical timeline for sidebars
export function PhaseTimelineCompact({ project, blockers = [] }: PhaseTimelineProps) {
    const currentPhase = getCurrentProjectPhase(project);

    return (
        <div className="space-y-2">
            {PHASE_ORDER.map((phase, idx) => {
                const config = PHASE_CONFIGS[phase];
                const isComplete = isPhaseComplete(project, phase);
                const isCurrent = phase === currentPhase;
                const phaseBlockers = getPhaseBlockers(project, phase, blockers);

                let status: 'completed' | 'current' | 'blocked' | 'upcoming' = 'upcoming';
                if (isComplete) status = 'completed';
                else if (isCurrent && phaseBlockers.length > 0) status = 'blocked';
                else if (isCurrent) status = 'current';

                return (
                    <div key={phase} className="flex items-center gap-3">
                        <div className="relative">
                            {/* Connector line */}
                            {idx < PHASE_ORDER.length - 1 && (
                                <div
                                    className={cn(
                                        'absolute top-7 left-1/2 -translate-x-1/2 w-0.5 h-6',
                                        isComplete ? 'bg-success' : 'bg-muted'
                                    )}
                                />
                            )}

                            {/* Node */}
                            <div className={cn(
                                'w-7 h-7 rounded-lg flex items-center justify-center text-sm z-10 relative',
                                status === 'completed' && 'bg-success text-success-foreground',
                                status === 'current' && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
                                status === 'blocked' && 'bg-warning text-warning-foreground',
                                status === 'upcoming' && 'bg-muted text-muted-foreground'
                            )}>
                                {status === 'completed' ? '✓' : config.icon}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className={cn(
                                'text-sm font-medium truncate',
                                status === 'upcoming' && 'text-muted-foreground'
                            )}>
                                {config.label}
                            </p>
                        </div>

                        {phaseBlockers.length > 0 && status !== 'completed' && (
                            <Badge variant="outline" className="text-[10px] h-5 border-warning text-warning shrink-0">
                                {phaseBlockers.length} blocker{phaseBlockers.length !== 1 ? 's' : ''}
                            </Badge>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
