'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from './data-provider';
import { startOfWeek, addDays, format, isSameDay, subWeeks, addWeeks } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ScheduleEntryModal } from './schedule-entry-modal';
import { usePermissions } from '@/components/permission-context';

export function CrewAssignmentDashboard() {
    const { data } = useData();
    const { can, isLoaded } = usePermissions();
    const [startDate, setStartDate] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 })); // Start on Monday
    const [selectedCell, setSelectedCell] = useState<{ crewId: string; date: Date } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Generate 7 days - must be before conditional returns (React hooks rules)
    const days = useMemo(() =>
        Array.from({ length: 7 }, (_, i) => addDays(startDate, i)),
        [startDate]);

    // Check permissions - wait for isLoaded first
    if (!isLoaded) {
        return null; // Loading state - parent component should handle
    }

    if (!can('VIEW_CREW_DETAILS')) {
        return (
            <Card className="p-8 text-center">
                <p className="text-muted-foreground">You do not have permission to view crew details.</p>
            </Card>
        );
    }

    // Calculate utilization for each crew
    const getUtilizationForCell = (crewId: string, date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        // Get crew's schedule entries for this date
        const entries = data.scheduleEntries.filter(
            e => e.crewId === crewId && e.date === dateStr && e.status !== 'cancelled'
        );
        const crew = data.crews.find(c => c.id === crewId);
        if (!crew) return { percentage: 0, hours: 0, status: 'available' as const };

        // Calculate hours booked
        const hoursBooked = entries.reduce((sum, entry) => {
            const [startH, startM] = entry.startTime.split(':').map(Number);
            const [endH, endM] = entry.endTime.split(':').map(Number);
            return sum + (endH + endM / 60) - (startH + startM / 60);
        }, 0);

        const capacity = crew.maxDailyCapacity || 8;
        const percentage = (hoursBooked / capacity) * 100;
        const status = percentage > 100 ? 'overbooked' : percentage >= 80 ? 'full' : 'available';

        return { percentage, hours: hoursBooked, status: status as 'available' | 'full' | 'overbooked' };
    };

    const handleCellClick = (crewId: string, date: Date) => {
        if (!can('EDIT_SCHEDULE')) return; // Require edit permission to assign
        setSelectedCell({ crewId, date });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Crew Capacity & Assignment</h2>
                    <p className="text-muted-foreground">Monitor crew utilization and prevent overbooking.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setStartDate(d => subWeeks(d, 1))}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="min-w-[150px] text-center font-medium">
                        {format(startDate, 'MMM d')} - {format(addDays(startDate, 6), 'MMM d, yyyy')}
                    </span>
                    <Button variant="outline" size="icon" onClick={() => setStartDate(d => addWeeks(d, 1))}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <Card className="overflow-hidden border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/30">
                                    <th className="p-4 text-left font-medium text-muted-foreground w-[200px]">Crew Team</th>
                                    {days.map(day => (
                                        <th key={day.toString()} className="p-4 text-center min-w-[100px]">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs uppercase text-muted-foreground">{format(day, 'EEE')}</span>
                                                <span className={cn(
                                                    "text-lg font-bold",
                                                    isSameDay(day, new Date()) && "text-primary"
                                                )}>
                                                    {format(day, 'd')}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                    <th className="p-4 text-center font-medium text-muted-foreground w-[100px]">Weekly<br />Avg</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.crews.map(crew => {
                                    // Calculate row stats
                                    const rowStats = days.map(d => getUtilizationForCell(crew.id, d));
                                    const avgUtil = rowStats.reduce((a, b) => a + b.percentage, 0) / 7;

                                    return (
                                        <tr key={crew.id} className="border-b transition-colors hover:bg-muted/10 group">
                                            {/* Crew Info Header */}
                                            <td className="p-4 border-r bg-muted/5">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm"
                                                        style={{ backgroundColor: crew.color }}
                                                    >
                                                        {crew.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">{crew.name}</div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Users className="w-3 h-3" />
                                                            {crew.members.length} members
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Daily Cells */}
                                            {days.map((day, idx) => {
                                                const stats = rowStats[idx];
                                                // Color Logic
                                                let bgClass = "bg-muted/10";
                                                let textClass = "text-muted-foreground";

                                                if (stats.percentage > 100) {
                                                    bgClass = "bg-destructive/20 text-destructive border-2 border-destructive/30";
                                                    textClass = "text-destructive font-bold";
                                                } else if (stats.percentage >= 80) {
                                                    bgClass = "bg-yellow-500/20 text-yellow-600 border border-yellow-500/30";
                                                    textClass = "text-yellow-700 font-medium";
                                                } else if (stats.percentage > 0) {
                                                    bgClass = "bg-green-500/20 text-green-600 border border-green-500/30";
                                                    textClass = "text-green-700 font-medium";
                                                }

                                                return (
                                                    <td key={idx} className="p-2 text-center h-[80px]">
                                                        <button
                                                            onClick={() => handleCellClick(crew.id, day)}
                                                            className={cn(
                                                                "w-full h-full rounded-lg flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 active:scale-95",
                                                                bgClass
                                                            )}
                                                        >
                                                            {stats.percentage > 0 ? (
                                                                <>
                                                                    <span className="text-lg font-bold">{Math.round(stats.percentage)}%</span>
                                                                    <span className={cn("text-[10px] uppercase", textClass)}>{stats.hours}h</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground/50">Free</span>
                                                            )}
                                                        </button>
                                                    </td>
                                                );
                                            })}

                                            {/* Weekly Summary */}
                                            <td className="p-4 text-center border-l bg-muted/5">
                                                <div className={cn(
                                                    "inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                    avgUtil > 90 ? "bg-destructive/10 text-destructive" :
                                                        avgUtil > 70 ? "bg-yellow-500/10 text-yellow-600" :
                                                            "bg-green-500/10 text-green-600"
                                                )}>
                                                    {Math.round(avgUtil)}%
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <ScheduleEntryModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                initialDate={selectedCell?.date}
                initialCrewId={selectedCell?.crewId}
            />
        </div>
    );
}
