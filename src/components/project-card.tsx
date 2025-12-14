'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Project } from '@/lib/data';
import { MapPin, Calendar, Users } from 'lucide-react';

interface ProjectCardProps {
    project: Project;
    compact?: boolean;
    className?: string;
}

const statusConfig = {
    active: { label: 'Active', variant: 'default' as const, className: 'bg-success/10 text-success border-success/20' },
    scheduled: { label: 'Scheduled', variant: 'secondary' as const, className: 'bg-primary/10 text-primary border-primary/20' },
    pending: { label: 'Pending', variant: 'outline' as const, className: 'bg-warning/10 text-warning border-warning/20' },
    completed: { label: 'Completed', variant: 'secondary' as const, className: 'bg-muted text-muted-foreground' },
};

export function ProjectCard({ project, compact = false, className }: ProjectCardProps) {
    const status = statusConfig[project.status];

    return (
        <Link href={`/projects/${project.id}`}>
            <Card className={cn(
                'group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 overflow-hidden',
                className
            )}>
                {/* Progress indicator bar at top */}
                <div className="h-1 bg-muted">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                    />
                </div>

                <CardContent className={cn('p-4', compact ? 'lg:p-4' : 'lg:p-6')}>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-base lg:text-lg truncate group-hover:text-primary transition-colors">
                                {project.name}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">{project.client}</p>
                        </div>
                        <Badge className={cn('shrink-0', status.className)}>
                            {status.label}
                        </Badge>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs lg:text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[150px]">{project.address}</span>
                        </span>
                        {!compact && (
                            <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {project.crew}
                            </span>
                        )}
                    </div>

                    {/* Stats Row */}
                    {!compact && (
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-2 rounded-lg bg-muted/50">
                                <div className="text-lg font-bold">{project.sqft.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">Sq Ft</div>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-muted/50">
                                <div className="text-lg font-bold text-success">${(project.value / 1000).toFixed(0)}K</div>
                                <div className="text-xs text-muted-foreground">Value</div>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-muted/50">
                                <div className="text-lg font-bold flex items-center justify-center gap-1">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    {project.dueDate.split('-').slice(1).join('/')}
                                </div>
                                <div className="text-xs text-muted-foreground">Due</div>
                            </div>
                        </div>
                    )}

                    {/* Progress */}
                    <div className="space-y-2">
                        <Progress value={project.progress} className="h-2" />
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground truncate">{project.type}</span>
                            <span className="font-semibold text-primary">{project.progress}%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
