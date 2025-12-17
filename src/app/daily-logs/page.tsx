'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/components/data-provider';
import { DailyLogQuickAddModal } from '@/components/daily-log-quick-add-modal';
import { cn } from '@/lib/utils';
import { can } from '@/lib/permissions';
import {
    Plus, Search, Calendar, Clock, Users, FileText,
    Sun, Cloud, CloudRain, Snowflake, Wind, Thermometer,
    AlertTriangle, Camera, Filter, Download, ChevronRight,
    TrendingUp, ArrowUpRight, Building2
} from 'lucide-react';
import { DailyLog, WeatherCondition } from '@/lib/data';

const WEATHER_ICONS: Record<WeatherCondition, React.ReactNode> = {
    'sunny': <Sun className="h-4 w-4 text-yellow-500" />,
    'cloudy': <Cloud className="h-4 w-4 text-gray-400" />,
    'rain': <CloudRain className="h-4 w-4 text-blue-500" />,
    'snow': <Snowflake className="h-4 w-4 text-cyan-300" />,
    'windy': <Wind className="h-4 w-4 text-gray-500" />,
    'extreme-heat': <Thermometer className="h-4 w-4 text-red-500" />,
    'extreme-cold': <Thermometer className="h-4 w-4 text-blue-300" />,
};

export default function DailyLogsPage() {
    const { data, getAllDailyLogs, getDailyLogAnalytics } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterProject, setFilterProject] = useState<string>('all');
    const [filterHasDelays, setFilterHasDelays] = useState<string>('all');
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [selectedProjectForAdd, setSelectedProjectForAdd] = useState<{ id: number; name: string } | null>(null);
    const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);

    const allLogs = getAllDailyLogs();
    const analytics = getDailyLogAnalytics();

    // Get project lookup
    const projectLookup = useMemo(() => {
        const lookup: Record<number, string> = {};
        data.projects.forEach(p => {
            lookup[p.id] = p.name;
        });
        return lookup;
    }, [data.projects]);

    // Filter logs
    const filteredLogs = useMemo(() => {
        return allLogs.filter(log => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const projectName = projectLookup[log.projectId] || '';
                if (
                    !projectName.toLowerCase().includes(query) &&
                    !(log.workCompleted || log.notes || '').toLowerCase().includes(query) &&
                    !log.areasWorked?.some(a => a.toLowerCase().includes(query))
                ) {
                    return false;
                }
            }

            // Project filter
            if (filterProject !== 'all' && log.projectId !== Number(filterProject)) {
                return false;
            }

            // Delay filter
            if (filterHasDelays === 'with-delays' && !log.hasDelays) {
                return false;
            }
            if (filterHasDelays === 'no-delays' && log.hasDelays) {
                return false;
            }

            return true;
        });
    }, [allLogs, searchQuery, filterProject, filterHasDelays, projectLookup]);

    // Group by date
    const groupedLogs = useMemo(() => {
        const groups: Record<string, DailyLog[]> = {};
        filteredLogs.forEach(log => {
            const dateKey = log.date;
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(log);
        });
        return Object.entries(groups).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
    }, [filteredLogs]);

    const handleAddLog = (projectId: number, projectName: string) => {
        setSelectedLog(null);
        setSelectedProjectForAdd({ id: projectId, name: projectName });
        setShowQuickAdd(true);
    };

    const handleViewLog = (log: DailyLog) => {
        setSelectedProjectForAdd(null);
        setSelectedLog(log);
        setShowQuickAdd(true);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    };

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="pl-12 sm:pl-0">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Daily Logs</h1>
                    <p className="text-sm text-muted-foreground">Field documentation and daily reports</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                        <Download className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                    <Select
                        value="select-project"
                        onValueChange={(v) => {
                            if (v !== 'select-project') {
                                const project = data.projects.find(p => p.id === Number(v));
                                if (project) {
                                    handleAddLog(project.id, project.name);
                                }
                            }
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <div className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                <span>New Daily Log</span>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="select-project" disabled>Select Project</SelectItem>
                            {data.projects.filter(p => p.status === 'active').map(project => (
                                <SelectItem key={project.id} value={String(project.id)}>
                                    {project.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalLogs}</div>
                        <p className="text-xs text-muted-foreground">
                            {analytics.logsWithPhotos} with photos
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalHours.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {analytics.averageCrewSize} avg crew size
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sq Ft</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.totalSqft.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Documented progress
                        </p>
                    </CardContent>
                </Card>
                <Card className={cn(analytics.logsWithDelays > 0 && "border-amber-500/50")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Delays Logged</CardTitle>
                        <AlertTriangle className={cn("h-4 w-4", analytics.logsWithDelays > 0 ? "text-amber-500" : "text-muted-foreground")} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.logsWithDelays}</div>
                        <p className="text-xs text-muted-foreground">
                            {Math.round(analytics.totalDelayMinutes / 60)} hrs total delay
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Delay Pattern Summary */}
            {Object.keys(analytics.delaysByType).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Delay Patterns
                        </CardTitle>
                        <CardDescription>
                            Documented delays by type - use this for change order justification
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(analytics.delaysByType)
                                .sort(([, a], [, b]) => b - a)
                                .map(([type, count]) => (
                                    <Badge key={type} variant="outline" className="text-sm">
                                        {type.replace('-', ' ')}: {count}
                                    </Badge>
                                ))
                            }
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={filterProject} onValueChange={setFilterProject}>
                    <SelectTrigger className="w-[200px]">
                        <Building2 className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {data.projects.map(project => (
                            <SelectItem key={project.id} value={String(project.id)}>
                                {project.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filterHasDelays} onValueChange={setFilterHasDelays}>
                    <SelectTrigger className="w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Logs" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Logs</SelectItem>
                        <SelectItem value="with-delays">With Delays</SelectItem>
                        <SelectItem value="no-delays">No Delays</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Logs List */}
            <div className="space-y-6">
                {groupedLogs.length === 0 ? (
                    <Card className="p-12 text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No daily logs found</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchQuery || filterProject !== 'all' || filterHasDelays !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Start documenting your field work'}
                        </p>
                        {data.projects.filter(p => p.status === 'active').length > 0 && (
                            <Button onClick={() => {
                                const firstActive = data.projects.find(p => p.status === 'active');
                                if (firstActive) handleAddLog(firstActive.id, firstActive.name);
                            }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Log
                            </Button>
                        )}
                    </Card>
                ) : (
                    groupedLogs.map(([date, logs]) => (
                        <div key={date}>
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <h3 className="font-medium">{formatDate(date)}</h3>
                                <Badge variant="secondary">{logs.length} log{logs.length !== 1 ? 's' : ''}</Badge>
                            </div>
                            <div className="space-y-3">
                                {logs.map(log => (
                                    <Card key={log.id}
                                        onClick={() => handleViewLog(log)}
                                        className={cn(
                                            "hover:shadow-md transition-shadow cursor-pointer",
                                            log.hasDelays && "border-l-4 border-l-amber-500"
                                        )}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium">{projectLookup[log.projectId]}</span>
                                                        {log.phase && (
                                                            <Badge variant="outline" className="text-xs">{log.phase}</Badge>
                                                        )}
                                                        <div className="flex items-center gap-1">
                                                            {WEATHER_ICONS[log.weather]}
                                                            {log.temperature && (
                                                                <span className="text-xs text-muted-foreground">{log.temperature}°F</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                        {log.workCompleted || log.notes || 'No description'}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            {log.totalCrewCount || log.crew || 0} crew
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {log.totalHours || log.hours || 0} hrs
                                                        </span>
                                                        {(log.sqftCompleted || 0) > 0 && (
                                                            <span>{log.sqftCompleted} sf</span>
                                                        )}
                                                        {log.photos && log.photos.length > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                <Camera className="h-3 w-3" />
                                                                {log.photos.length}
                                                            </span>
                                                        )}
                                                        {log.hasDelays && (
                                                            <span className="flex items-center gap-1 text-amber-600">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                {log.delays?.length || 0} delay{(log.delays?.length || 0) !== 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                        {log.signedBy && (
                                                            <span className="text-green-600">✓ Signed</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Quick Add Modal */}
            {/* Quick Add / View Modal */}
            {(selectedProjectForAdd || selectedLog) && (
                <DailyLogQuickAddModal
                    open={showQuickAdd}
                    onClose={() => {
                        setShowQuickAdd(false);
                        setSelectedProjectForAdd(null);
                        setSelectedLog(null);
                    }}
                    projectId={selectedLog ? selectedLog.projectId : selectedProjectForAdd!.id}
                    projectName={selectedLog ? projectLookup[selectedLog.projectId] : selectedProjectForAdd!.name}
                    initialData={selectedLog || undefined}
                />
            )}
        </div>
    );
}
