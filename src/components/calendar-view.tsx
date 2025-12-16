'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useData } from './data-provider';
import {
    ScheduleEntry,
    Crew,
    PHASE_CONFIGS,
    JobPhase
} from '@/lib/data';
import {
    getCrewAvailability,
    getScheduleForRange
} from '@/lib/scheduling-engine';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Users,
    Truck,
    Plus
} from 'lucide-react';
import { ScheduleEntryModal } from './schedule-entry-modal';
import { usePermissions } from '@/components/permission-context';

interface CalendarViewProps {
    onSelectEntry?: (entry: ScheduleEntry) => void;
    onSelectDate?: (date: string) => void;
}

type ViewMode = 'month' | 'week' | 'day';

export function CalendarView({ onSelectEntry, onSelectDate }: CalendarViewProps) {
    const { data, addScheduleEntry, updateScheduleEntry, deleteScheduleEntry, getScheduleConflicts } = useData();
    const { can } = usePermissions();
    // Use a static date for SSR to avoid hydration mismatch
    const [currentDate, setCurrentDate] = useState(() => new Date('2024-12-16'));
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [selectedCrewId, setSelectedCrewId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<ScheduleEntry | undefined>(undefined);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    const handleNewEntry = () => {
        if (!can('EDIT_SCHEDULE')) return;
        setSelectedEntry(undefined);
        setSelectedDate(currentDate);
        setIsModalOpen(true);
    };

    const handleSelectDate = (dateStr: string) => {
        if (!can('EDIT_SCHEDULE')) return;
        const date = new Date(dateStr + 'T12:00:00'); // Midday to avoid timezone issues
        setSelectedDate(date);
        setSelectedEntry(undefined);
        setIsModalOpen(true);
        onSelectDate?.(dateStr);
    };

    const handleSelectEntry = (entry: ScheduleEntry) => {
        setSelectedEntry(entry);
        setIsModalOpen(true);
        onSelectEntry?.(entry);
    };

    // Update to real date on client mount
    useEffect(() => {
        setCurrentDate(new Date());
        setMounted(true);
    }, []);

    // Generate dates for the current view
    const viewDates = useMemo(() => {
        const dates: Date[] = [];
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        if (viewMode === 'month') {
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);

            // Start from Sunday of the first week
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - startDate.getDay());

            // End on Saturday of the last week
            const endDate = new Date(lastDay);
            endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                dates.push(new Date(d));
            }
        } else if (viewMode === 'week') {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

            for (let i = 0; i < 7; i++) {
                const d = new Date(startOfWeek);
                d.setDate(d.getDate() + i);
                dates.push(d);
            }
        } else {
            dates.push(new Date(currentDate));
        }

        return dates;
    }, [currentDate, viewMode]);

    // Get date range for fetching schedule entries
    const dateRange = useMemo(() => {
        if (viewDates.length === 0) return { start: '', end: '' };
        const start = viewDates[0].toISOString().split('T')[0];
        const end = viewDates[viewDates.length - 1].toISOString().split('T')[0];
        return { start, end };
    }, [viewDates]);

    // Get schedule entries for the current view
    const scheduleEntries = useMemo(() => {
        return getScheduleForRange(
            dateRange.start,
            dateRange.end,
            data.scheduleEntries,
            selectedCrewId || undefined
        );
    }, [dateRange, data.scheduleEntries, selectedCrewId]);

    // Group entries by date
    const entriesByDate = useMemo(() => {
        const grouped: Record<string, ScheduleEntry[]> = {};
        for (const entry of scheduleEntries) {
            if (!grouped[entry.date]) grouped[entry.date] = [];
            grouped[entry.date].push(entry);
        }
        // Sort entries by start time
        for (const date of Object.keys(grouped)) {
            grouped[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
        }
        return grouped;
    }, [scheduleEntries]);

    const navigatePrev = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
        else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
        else newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const navigateNext = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
        else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
        else newDate.setDate(newDate.getDate() + 1);
        setCurrentDate(newDate);
    };

    const goToToday = () => setCurrentDate(new Date());

    const formatDateHeader = () => {
        if (viewMode === 'month') {
            return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } else if (viewMode === 'week') {
            const start = viewDates[0];
            const end = viewDates[6];
            if (start.getMonth() === end.getMonth()) {
                return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()} - ${end.getDate()}, ${end.getFullYear()}`;
            }
            return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
        return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === currentDate.getMonth();
    };

    const getCrew = (crewId: string): Crew | undefined => {
        return data.crews.find(c => c.id === crewId);
    };

    const getProject = (projectId: number) => {
        return data.projects.find(p => p.id === projectId);
    };

    const getPhaseIcon = (phase: JobPhase): string => {
        return PHASE_CONFIGS[phase].icon;
    };

    return (
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/95">
            {/* Header */}
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl font-bold">{formatDateHeader()}</CardTitle>
                    </div>

                    <div className="flex items-center gap-2">
                        {can('EDIT_SCHEDULE') && (
                            <Button onClick={handleNewEntry} className="gap-2 mr-2">
                                <Plus className="w-4 h-4" />
                                New Entry
                            </Button>
                        )}

                        {/* View Mode Toggle */}
                        <div className="flex bg-muted rounded-lg p-1">
                            {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
                                <Button
                                    key={mode}
                                    variant={viewMode === mode ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode(mode)}
                                    className={cn(
                                        'capitalize px-3 py-1.5 h-8 text-xs font-medium transition-all',
                                        viewMode === mode && 'shadow-md'
                                    )}
                                >
                                    {mode}
                                </Button>
                            ))}
                        </div>

                        {/* Crew Filter */}
                        <select
                            value={selectedCrewId || ''}
                            onChange={(e) => setSelectedCrewId(e.target.value || null)}
                            className="h-8 px-3 rounded-lg border bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">All Crews</option>
                            {data.crews.map((crew) => (
                                <option key={crew.id} value={crew.id}>
                                    {crew.name}
                                </option>
                            ))}
                        </select>

                        {/* Navigation */}
                        <div className="flex items-center gap-1 ml-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={navigatePrev}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-medium" onClick={goToToday}>
                                Today
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={navigateNext}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {/* Day Headers */}
                {viewMode !== 'day' && (
                    <div className={cn(
                        'grid border-b bg-muted/30',
                        viewMode === 'month' ? 'grid-cols-7' : 'grid-cols-7'
                    )}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div
                                key={day}
                                className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                            >
                                {day}
                            </div>
                        ))}
                    </div>
                )}

                {/* Calendar Grid */}
                {viewMode === 'month' && (
                    <div className="grid grid-cols-7">
                        {viewDates.map((date, idx) => {
                            const dateStr = date.toISOString().split('T')[0];
                            const dayEntries = entriesByDate[dateStr] || [];
                            const isOtherMonth = !isCurrentMonth(date);

                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleSelectDate(dateStr)}
                                    className={cn(
                                        'min-h-[100px] p-2 border-b border-r cursor-pointer transition-all hover:bg-accent/30',
                                        isToday(date) && 'bg-primary/5',
                                        isOtherMonth && 'bg-muted/20 text-muted-foreground'
                                    )}
                                >
                                    <div className={cn(
                                        'flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium mb-1',
                                        isToday(date) && 'bg-primary text-primary-foreground'
                                    )}>
                                        {date.getDate()}
                                    </div>
                                    <div className="space-y-1">
                                        {dayEntries.slice(0, 3).map((entry) => {
                                            const crew = getCrew(entry.crewId);
                                            const project = getProject(entry.projectId);
                                            return (
                                                <div
                                                    key={entry.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectEntry(entry);
                                                    }}
                                                    className="px-1.5 py-0.5 text-[10px] font-medium rounded truncate cursor-pointer transition-transform hover:scale-105"
                                                    style={{
                                                        backgroundColor: `${crew?.color}20`,
                                                        borderLeft: `3px solid ${crew?.color}`,
                                                        color: crew?.color
                                                    }}
                                                >
                                                    {getPhaseIcon(entry.phase)} {project?.name.split(' ')[0]}
                                                </div>
                                            );
                                        })}
                                        {dayEntries.length > 3 && (
                                            <div className="text-[10px] text-muted-foreground pl-1">
                                                +{dayEntries.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Week View */}
                {viewMode === 'week' && (
                    <div className="grid grid-cols-7 min-h-[400px]">
                        {viewDates.map((date, idx) => {
                            const dateStr = date.toISOString().split('T')[0];
                            const dayEntries = entriesByDate[dateStr] || [];

                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleSelectDate(dateStr)}
                                    className={cn(
                                        'p-2 border-r border-b cursor-pointer transition-all hover:bg-accent/20',
                                        isToday(date) && 'bg-primary/5 border-primary/30',
                                        idx === 0 && 'border-l'
                                    )}
                                >
                                    <div className={cn(
                                        'flex flex-col items-center mb-3 pb-2 border-b border-dashed',
                                        isToday(date) && 'border-primary/30'
                                    )}>
                                        <span className="text-xs text-muted-foreground uppercase">
                                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                        </span>
                                        <span className={cn(
                                            'flex items-center justify-center w-10 h-10 rounded-xl text-lg font-bold mt-1',
                                            isToday(date) && 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                                        )}>
                                            {date.getDate()}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {dayEntries.map((entry) => {
                                            const crew = getCrew(entry.crewId);
                                            const project = getProject(entry.projectId);
                                            const config = PHASE_CONFIGS[entry.phase];

                                            return (
                                                <div
                                                    key={entry.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectEntry(entry);
                                                    }}
                                                    className="group p-2.5 rounded-xl bg-gradient-to-br from-card to-muted/30 border shadow-sm cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
                                                    style={{ borderLeftColor: crew?.color, borderLeftWidth: '4px' }}
                                                >
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <span className="text-sm">{config.icon}</span>
                                                        <span className="text-xs font-bold truncate">{config.label}</span>
                                                    </div>
                                                    <p className="text-[11px] font-medium text-muted-foreground truncate">
                                                        {project?.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{entry.startTime} - {entry.endTime}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                                                        <Users className="w-3 h-3" />
                                                        <span style={{ color: crew?.color }}>{crew?.name}</span>
                                                    </div>
                                                    {entry.travelMinutes > 0 && (
                                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                                                            <Truck className="w-3 h-3" />
                                                            <span>{entry.travelMinutes} min travel</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {dayEntries.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/50">
                                                <CalendarIcon className="w-6 h-6 mb-1" />
                                                <span className="text-[10px]">No work scheduled</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Day View */}
                {viewMode === 'day' && (
                    <DayDetailView
                        date={currentDate}
                        entries={entriesByDate[currentDate.toISOString().split('T')[0]] || []}
                        crews={data.crews}
                        projects={data.projects}
                        onSelectEntry={handleSelectEntry}
                    />
                )}
            </CardContent>

            <ScheduleEntryModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                initialDate={selectedDate}
                existingEntry={selectedEntry}
                initialCrewId={selectedCrewId || undefined}
            />

            {/* Crew Legend */}
            <div className="flex items-center gap-4 p-4 border-t bg-muted/20">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Crews:</span>
                {data.crews.map((crew) => (
                    <div key={crew.id} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{ backgroundColor: crew.color }}
                        />
                        <span className="text-xs font-medium">{crew.name}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

// Day Detail View Component
function DayDetailView({
    date,
    entries,
    crews,
    projects,
    onSelectEntry
}: {
    date: Date;
    entries: ScheduleEntry[];
    crews: Crew[];
    projects: { id: number; name: string; address: string }[];
    onSelectEntry?: (entry: ScheduleEntry) => void;
}) {
    const hours = Array.from({ length: 12 }, (_, i) => i + 6); // 6 AM to 6 PM

    const getEntryStyle = (entry: ScheduleEntry) => {
        const [startH, startM] = entry.startTime.split(':').map(Number);
        const [endH, endM] = entry.endTime.split(':').map(Number);

        const startOffset = (startH - 6) * 60 + startM;
        const duration = (endH * 60 + endM) - (startH * 60 + startM);

        const top = (startOffset / 60) * 80; // 80px per hour
        const height = (duration / 60) * 80;

        return { top: `${top}px`, height: `${Math.max(height, 40)}px` };
    };

    const getCrew = (crewId: string) => crews.find(c => c.id === crewId);
    const getProject = (projectId: number) => projects.find(p => p.id === projectId);

    return (
        <div className="relative">
            <div className="flex">
                {/* Time Labels */}
                <div className="w-20 flex-shrink-0 border-r bg-muted/20">
                    {hours.map((hour) => (
                        <div key={hour} className="h-20 pr-2 flex items-start justify-end">
                            <span className="text-xs font-medium text-muted-foreground -mt-2">
                                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Schedule Grid */}
                <div className="flex-1 relative">
                    {/* Hour Lines */}
                    {hours.map((hour) => (
                        <div key={hour} className="h-20 border-b border-dashed border-muted-foreground/10" />
                    ))}

                    {/* Entries grouped by crew */}
                    {crews.map((crew, crewIdx) => {
                        const crewEntries = entries.filter(e => e.crewId === crew.id);
                        const columnWidth = 100 / crews.length;
                        const left = crewIdx * columnWidth;

                        return crewEntries.map((entry) => {
                            const style = getEntryStyle(entry);
                            const project = getProject(entry.projectId);
                            const config = PHASE_CONFIGS[entry.phase];

                            return (
                                <div
                                    key={entry.id}
                                    onClick={() => onSelectEntry?.(entry)}
                                    className="absolute px-1 cursor-pointer transition-all hover:z-10"
                                    style={{
                                        ...style,
                                        left: `${left + 1}%`,
                                        width: `${columnWidth - 2}%`,
                                    }}
                                >
                                    <div
                                        className="h-full p-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                                        style={{
                                            backgroundColor: crew.color,
                                            opacity: 0.9
                                        }}
                                    >
                                        <div className="text-white font-bold text-sm flex items-center gap-2">
                                            <span>{config.icon}</span>
                                            {config.label}
                                        </div>
                                        <p className="text-white/90 text-xs mt-1 truncate">{project?.name}</p>
                                        <div className="flex items-center gap-1 mt-2 text-white/80 text-[10px]">
                                            <MapPin className="w-3 h-3" />
                                            <span className="truncate">{project?.address}</span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1 text-white/80 text-[10px]">
                                            <Clock className="w-3 h-3" />
                                            <span>{entry.startTime} - {entry.endTime}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        });
                    })}
                </div>
            </div>

            {/* Crew Headers */}
            <div
                className="absolute top-0 left-20 right-0 flex border-b bg-gradient-to-b from-muted/50 to-transparent"
                style={{ zIndex: 5 }}
            >
                {crews.map((crew) => (
                    <div
                        key={crew.id}
                        className="flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider"
                        style={{ color: crew.color }}
                    >
                        {crew.name}
                    </div>
                ))}
            </div>
        </div>
    );
}
