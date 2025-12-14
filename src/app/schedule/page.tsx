'use client';

import { TopBar } from '@/components/top-bar';
import { ScheduleItemCard } from '@/components/schedule-item';
import { useData } from '@/components/data-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SchedulePage() {
    const router = useRouter();
    const { data } = useData();

    // Get current date info
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Group schedule by project
    const scheduleByProject = data.globalSchedule.reduce((acc, item) => {
        const project = data.projects.find(p => p.id === item.projectId);
        const projectName = project?.name || 'Unassigned';
        if (!acc[projectName]) acc[projectName] = [];
        acc[projectName].push(item);
        return acc;
    }, {} as Record<string, typeof data.globalSchedule>);

    return (
        <>
            <TopBar
                title="Master Schedule"
                breadcrumb="All Crews"
                showNewProject={false}
            >
                <Button onClick={() => toast.info('Add schedule entry coming soon')} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Entry
                </Button>
            </TopBar>

            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                {/* Date Navigation */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <Button variant="ghost" size="icon" onClick={() => toast.info('Previous day')}>
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    {dateString}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {data.globalSchedule.length} scheduled items • 2 crews active
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => toast.info('Next day')}>
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Timeline View */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* All Schedule Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Today&apos;s Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {data.globalSchedule.length > 0 ? (
                                data.globalSchedule.map(item => (
                                    <ScheduleItemCard
                                        key={item.id}
                                        item={item}
                                        onClick={() => {
                                            if (item.projectId) router.push(`/projects/${item.projectId}?tab=schedule`);
                                        }}
                                    />
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No scheduled items today.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* By Project */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">By Project</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {Object.entries(scheduleByProject).map(([projectName, items]) => (
                                <div key={projectName}>
                                    <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                                        {projectName}
                                    </h4>
                                    <div className="space-y-2">
                                        {items.map(item => (
                                            <ScheduleItemCard
                                                key={item.id}
                                                item={item}
                                                onClick={() => {
                                                    if (item.projectId) router.push(`/projects/${item.projectId}?tab=schedule`);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Crew Assignments */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Crew Assignments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {['Team A', 'Team B', 'Team C'].map((team, i) => {
                                const teamProjects = data.projects.filter(p => p.crew === team && p.status === 'active');
                                return (
                                    <div
                                        key={team}
                                        className={`p-4 rounded-xl border-2 ${i === 2 ? 'border-dashed border-muted' : 'border-primary/20 bg-primary/5'}`}
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={`w-3 h-3 rounded-full ${i === 2 ? 'bg-muted' : 'bg-success'}`} />
                                            <span className="font-semibold">{team}</span>
                                            <span className="text-xs text-muted-foreground ml-auto">
                                                {i === 2 ? 'Available' : 'Active'}
                                            </span>
                                        </div>
                                        {teamProjects.length > 0 ? (
                                            teamProjects.map(p => (
                                                <div
                                                    key={p.id}
                                                    className="text-sm py-1 cursor-pointer hover:text-primary transition-colors"
                                                    onClick={() => router.push(`/projects/${p.id}`)}
                                                >
                                                    📍 {p.name}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No active projects</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
