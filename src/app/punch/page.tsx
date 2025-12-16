'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/top-bar';
import { useData } from '@/components/data-provider';
import { usePermissions, PermissionGate } from '@/components/permission-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Circle, Clock, AlertTriangle, Search, MapPin, User, Calendar, Camera, Target, ClipboardList, ChevronRight, Zap } from 'lucide-react';
import { PunchItem } from '@/lib/data';

interface PunchItemWithProject extends PunchItem {
    projectId: number;
    projectName: string;
    projectAddress: string;
}

export default function PunchPage() {
    const router = useRouter();
    const { data } = useData();
    const { currentUser } = usePermissions();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'completed'>('all');
    const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
    const [projectFilter, setProjectFilter] = useState<string>('all');

    const userCanAccessProject = (projectId: number): boolean => {
        if (!currentUser) return false;
        if (['owner', 'project_manager', 'office_admin'].includes(currentUser.role)) return true;
        return currentUser.assignedProjectIds?.includes(projectId) || false;
    };

    const allPunchItems = useMemo(() => {
        const items: PunchItemWithProject[] = [];
        data.projects.forEach(project => {
            if (!userCanAccessProject(project.id)) return;
            (project.punchList || []).forEach(punch => {
                items.push({ ...punch, projectId: project.id, projectName: project.name, projectAddress: project.address });
            });
        });
        return items.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            const order = { high: 0, medium: 1, low: 2 };
            return order[a.priority] - order[b.priority];
        });
    }, [data.projects, currentUser]);

    const filteredItems = useMemo(() => {
        return allPunchItems.filter(item => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!item.text.toLowerCase().includes(q) && !item.projectName.toLowerCase().includes(q) && !(item.assignedTo?.toLowerCase().includes(q))) return false;
            }
            if (statusFilter === 'open' && item.completed) return false;
            if (statusFilter === 'completed' && !item.completed) return false;
            if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
            if (projectFilter !== 'all' && item.projectId.toString() !== projectFilter) return false;
            return true;
        });
    }, [allPunchItems, searchQuery, statusFilter, priorityFilter, projectFilter]);

    const stats = useMemo(() => {
        const total = allPunchItems.length;
        const open = allPunchItems.filter(i => !i.completed).length;
        const completed = allPunchItems.filter(i => i.completed).length;
        const high = allPunchItems.filter(i => !i.completed && i.priority === 'high').length;
        return { total, open, completed, high, rate: total > 0 ? Math.round((completed / total) * 100) : 0 };
    }, [allPunchItems]);

    const getPriorityStyle = (p: string) => {
        if (p === 'high') return 'bg-red-500/10 text-red-600 border-red-500/20';
        if (p === 'medium') return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    };

    const projects = [...new Map(allPunchItems.map(i => [i.projectId, i.projectName])).entries()];

    return (
        <>
            <TopBar title="Punch List" breadcrumb="Operations → Punch List" />
            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card><CardContent className="p-4 text-center"><div className="text-3xl font-bold">{stats.total}</div><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
                    <Card className="bg-gradient-to-br from-card to-amber-500/10"><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-amber-600">{stats.open}</div><p className="text-xs text-muted-foreground">Open</p></CardContent></Card>
                    <Card className="bg-gradient-to-br from-card to-emerald-500/10"><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-emerald-600">{stats.completed}</div><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
                    <Card className="bg-gradient-to-br from-card to-red-500/10"><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-red-600">{stats.high}</div><p className="text-xs text-muted-foreground">High Priority</p></CardContent></Card>
                    <Card className="bg-gradient-to-br from-card to-primary/10"><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-primary">{stats.rate}%</div><Progress value={stats.rate} className="h-1.5 mt-2" /></CardContent></Card>
                </div>

                {/* Filters */}
                <Card><CardContent className="p-4"><div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
                    <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="open">Open</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent></Select>
                    <Select value={priorityFilter} onValueChange={(v: any) => setPriorityFilter(v)}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Priority</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent></Select>
                    <Select value={projectFilter} onValueChange={setProjectFilter}><SelectTrigger className="w-44"><SelectValue placeholder="Project" /></SelectTrigger><SelectContent><SelectItem value="all">All Projects</SelectItem>{projects.map(([id, name]) => <SelectItem key={id} value={id.toString()}>{name}</SelectItem>)}</SelectContent></Select>
                </div></CardContent></Card>

                {/* List */}
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-lg">Punch Items ({filteredItems.length})</CardTitle></CardHeader>
                    <CardContent>
                        {filteredItems.length === 0 ? (
                            <div className="text-center py-16"><CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><p className="text-muted-foreground">No punch items found</p></div>
                        ) : (
                            <div className="space-y-3">
                                {filteredItems.map((item) => (
                                    <div key={`${item.projectId}-${item.id}`} onClick={() => router.push(`/projects/${item.projectId}?tab=punch`)}
                                        className={`group flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${item.completed ? 'bg-muted/30 opacity-75' : 'hover:bg-muted/50 hover:border-primary/30'}`}>
                                        <div className="pt-0.5">{item.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : item.priority === 'high' ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <Circle className="w-5 h-5 text-muted-foreground" />}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <p className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>{item.text}</p>
                                                <Badge variant="outline" className={getPriorityStyle(item.priority)}>{item.priority}</Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                                                {item.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{item.location}</span>}
                                                {item.assignedTo && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{item.assignedTo}</span>}
                                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{item.due}</span>
                                            </div>
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                                                <Badge variant="secondary">{item.projectName}</Badge>
                                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">View <ChevronRight className="w-4 h-4 ml-0.5" /></Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
