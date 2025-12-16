'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/top-bar';
import { useData } from '@/components/data-provider';
import { usePermissions } from '@/components/permission-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Circle, AlertTriangle, Calendar, MapPin, ArrowUpRight, FolderKanban, ClipboardList, Truck, HardHat, Play, Clock } from 'lucide-react';

interface Assignment {
    id: string;
    type: 'project' | 'punch' | 'delivery' | 'task';
    title: string;
    description?: string;
    location?: string;
    status: 'not_started' | 'in_progress' | 'blocked' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    dueDate?: string;
    projectId?: number;
    projectName?: string;
}

export default function AssignmentsPage() {
    const router = useRouter();
    const { data } = useData();
    const { currentUser } = usePermissions();
    const [activeTab, setActiveTab] = useState('all');

    const userCanAccessProject = (projectId: number): boolean => {
        if (!currentUser) return false;
        if (['owner', 'project_manager', 'office_admin'].includes(currentUser.role)) return true;
        return currentUser.assignedProjectIds?.includes(projectId) || false;
    };

    const assignments = useMemo(() => {
        const items: Assignment[] = [];

        data.projects.forEach(project => {
            if (!userCanAccessProject(project.id)) return;

            // Active projects as assignments
            if (project.status !== 'completed') {
                items.push({
                    id: `project-${project.id}`,
                    type: 'project',
                    title: project.name,
                    description: `${project.progress}% complete - ${project.sqft.toLocaleString()} sqft`,
                    location: project.address,
                    status: project.status === 'active' ? 'in_progress' : 'not_started',
                    priority: project.progress < 30 ? 'high' : project.progress < 70 ? 'medium' : 'low',
                    dueDate: project.dueDate,
                    projectId: project.id,
                    projectName: project.name
                });
            }

            // Open punch items
            (project.punchList || []).filter(p => !p.completed).forEach(punch => {
                items.push({
                    id: `punch-${project.id}-${punch.id}`,
                    type: 'punch',
                    title: punch.text,
                    description: punch.location || 'No location specified',
                    location: project.address,
                    status: 'not_started',
                    priority: punch.priority,
                    dueDate: punch.due,
                    projectId: project.id,
                    projectName: project.name
                });
            });
        });

        // Deliveries
        (data.deliveries || []).filter(d => d.status === 'scheduled' || d.status === 'in-transit').forEach(delivery => {
            const project = data.projects.find(p => p.id === delivery.projectId);
            if (project && userCanAccessProject(project.id)) {
                items.push({
                    id: `delivery-${delivery.id}`,
                    type: 'delivery',
                    title: `Delivery from ${delivery.vendorId || 'Vendor'}`,
                    description: delivery.notes || 'Material delivery',
                    location: project.address,
                    status: delivery.status === 'in-transit' ? 'in_progress' : 'not_started',
                    priority: 'medium',
                    dueDate: delivery.scheduledDate,
                    projectId: project.id,
                    projectName: project.name
                });
            }
        });

        // Schedule items
        (data.globalSchedule || []).forEach(item => {
            const project = data.projects.find(p => p.id === item.projectId);
            if (project && userCanAccessProject(project.id)) {
                items.push({
                    id: `schedule-${item.id}`,
                    type: 'task',
                    title: item.title,
                    description: item.subtitle,
                    location: project.address,
                    status: 'not_started',
                    priority: 'medium',
                    dueDate: 'Today',
                    projectId: project.id,
                    projectName: project.name
                });
            }
        });

        return items;
    }, [data, currentUser]);

    const filtered = useMemo(() => {
        if (activeTab === 'all') return assignments;
        return assignments.filter(a => a.type === activeTab);
    }, [assignments, activeTab]);

    const stats = useMemo(() => ({
        total: assignments.length,
        notStarted: assignments.filter(a => a.status === 'not_started').length,
        inProgress: assignments.filter(a => a.status === 'in_progress').length,
        projects: assignments.filter(a => a.type === 'project').length,
        punch: assignments.filter(a => a.type === 'punch').length,
        deliveries: assignments.filter(a => a.type === 'delivery').length,
        tasks: assignments.filter(a => a.type === 'task').length
    }), [assignments]);

    const getTypeIcon = (type: string) => {
        if (type === 'project') return <FolderKanban className="w-4 h-4" />;
        if (type === 'punch') return <ClipboardList className="w-4 h-4" />;
        if (type === 'delivery') return <Truck className="w-4 h-4" />;
        return <HardHat className="w-4 h-4" />;
    };

    const getStatusIcon = (status: string) => {
        if (status === 'completed') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
        if (status === 'in_progress') return <Play className="w-5 h-5 text-primary" />;
        if (status === 'blocked') return <AlertTriangle className="w-5 h-5 text-red-500" />;
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    };

    const getPriorityStyle = (p: string) => {
        if (p === 'critical') return 'bg-rose-500/20 text-rose-700 border-rose-500/30 animate-pulse';
        if (p === 'high') return 'bg-red-500/10 text-red-600 border-red-500/20';
        if (p === 'medium') return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    };

    const getTypeStyle = (type: string) => {
        if (type === 'project') return 'bg-primary/10 text-primary';
        if (type === 'punch') return 'bg-orange-500/10 text-orange-600';
        if (type === 'delivery') return 'bg-blue-500/10 text-blue-600';
        return 'bg-purple-500/10 text-purple-600';
    };

    return (
        <>
            <TopBar title="My Assignments" breadcrumb={`${currentUser?.name || 'User'}'s work queue`} />
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card><CardContent className="p-4 flex items-center justify-between"><div><div className="text-3xl font-bold">{stats.total}</div><p className="text-sm text-muted-foreground">Total</p></div><ClipboardList className="w-8 h-8 text-muted-foreground/30" /></CardContent></Card>
                    <Card className="bg-gradient-to-br from-card to-amber-500/10"><CardContent className="p-4 flex items-center justify-between"><div><div className="text-3xl font-bold text-amber-600">{stats.notStarted}</div><p className="text-sm text-muted-foreground">Not Started</p></div><Circle className="w-8 h-8 text-amber-500/30" /></CardContent></Card>
                    <Card className="bg-gradient-to-br from-card to-primary/10"><CardContent className="p-4 flex items-center justify-between"><div><div className="text-3xl font-bold text-primary">{stats.inProgress}</div><p className="text-sm text-muted-foreground">In Progress</p></div><Play className="w-8 h-8 text-primary/30" /></CardContent></Card>
                    <Card><CardContent className="p-4"><div className="grid grid-cols-4 gap-2 text-center"><div><div className="text-lg font-semibold">{stats.projects}</div><div className="text-xs text-muted-foreground">Projects</div></div><div><div className="text-lg font-semibold">{stats.punch}</div><div className="text-xs text-muted-foreground">Punch</div></div><div><div className="text-lg font-semibold">{stats.deliveries}</div><div className="text-xs text-muted-foreground">Deliveries</div></div><div><div className="text-lg font-semibold">{stats.tasks}</div><div className="text-xs text-muted-foreground">Tasks</div></div></div></CardContent></Card>
                </div>

                {/* Tabs & List */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                        <TabsTrigger value="project">Projects</TabsTrigger>
                        <TabsTrigger value="punch">Punch</TabsTrigger>
                        <TabsTrigger value="delivery">Deliveries</TabsTrigger>
                        <TabsTrigger value="task">Tasks</TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-4">
                        <Card>
                            <CardHeader className="pb-2"><CardTitle className="text-lg">Assignments ({filtered.length})</CardTitle></CardHeader>
                            <CardContent>
                                {filtered.length === 0 ? (
                                    <div className="text-center py-16"><CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><p className="text-lg font-medium">All caught up!</p><p className="text-sm text-muted-foreground">No assignments in this category</p></div>
                                ) : (
                                    <div className="space-y-3">
                                        {filtered.map((item) => (
                                            <div key={item.id} onClick={() => item.projectId && router.push(item.type === 'punch' ? `/projects/${item.projectId}?tab=punch` : `/projects/${item.projectId}`)}
                                                className="group flex items-start gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer">
                                                <div className="pt-0.5">{getStatusIcon(item.status)}</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <Badge variant="outline" className={getTypeStyle(item.type)}>{getTypeIcon(item.type)}<span className="ml-1 capitalize">{item.type}</span></Badge>
                                                        <Badge variant="outline" className={getPriorityStyle(item.priority)}>{item.priority}</Badge>
                                                    </div>
                                                    <p className="font-medium mt-2">{item.title}</p>
                                                    {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                                                        {item.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{item.location}</span>}
                                                        {item.dueDate && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{item.dueDate}</span>}
                                                    </div>
                                                    {item.projectName && (
                                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                                                            <Badge variant="secondary">{item.projectName}</Badge>
                                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">View <ArrowUpRight className="w-4 h-4 ml-1" /></Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
