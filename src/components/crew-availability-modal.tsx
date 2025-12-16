'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useData } from './data-provider';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { Calendar, Clock, ChevronLeft, ChevronRight, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CrewAvailabilityModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    crewId: string;
    crewName: string;
}

export function CrewAvailabilityModal({
    open,
    onOpenChange,
    crewId,
    crewName
}: CrewAvailabilityModalProps) {
    const { data, updateCrewAvailability, getCrewCapacity } = useData();
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [localAvailability, setLocalAvailability] = useState<Record<string, { available: boolean; notes: string }>>({});

    // Generate days for the week
    const days = useMemo(() =>
        Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
        [weekStart]
    );

    // Initialize local availability from data
    useEffect(() => {
        if (open) {
            const availability: Record<string, { available: boolean; notes: string }> = {};
            days.forEach(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const capacity = getCrewCapacity(crewId, dateStr);
                availability[dateStr] = {
                    available: capacity.available,
                    notes: capacity.notes || ''
                };
            });
            setLocalAvailability(availability);
        }
    }, [open, days, crewId, getCrewCapacity]);

    const handleToggleAvailability = (dateStr: string) => {
        setLocalAvailability(prev => ({
            ...prev,
            [dateStr]: {
                ...prev[dateStr],
                available: !prev[dateStr]?.available
            }
        }));
    };

    const handleNotesChange = (dateStr: string, notes: string) => {
        setLocalAvailability(prev => ({
            ...prev,
            [dateStr]: {
                ...prev[dateStr],
                notes
            }
        }));
    };

    const handleSave = () => {
        Object.entries(localAvailability).forEach(([dateStr, { available, notes }]) => {
            updateCrewAvailability(crewId, dateStr, available, notes);
        });
        toast.success('Availability updated');
        onOpenChange(false);
    };

    const navigateWeek = (direction: 'prev' | 'next') => {
        setWeekStart(prev => addDays(prev, direction === 'next' ? 7 : -7));
    };

    const isToday = (date: Date) => isSameDay(date, new Date());

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Set Availability - {crewName}
                    </DialogTitle>
                    <DialogDescription>
                        Toggle availability for each day and add notes (e.g., vacation, training)
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {/* Week Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                        </Button>
                        <h3 className="font-semibold">
                            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                        </h3>
                        <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>

                    {/* Days Grid */}
                    <div className="grid gap-3">
                        {days.map(day => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const avail = localAvailability[dateStr] || { available: true, notes: '' };
                            const crew = data.crews.find(c => c.id === crewId);

                            // Get scheduled hours for this day
                            const scheduledEntries = data.scheduleEntries.filter(
                                e => e.crewId === crewId && e.date === dateStr && e.status !== 'cancelled'
                            );
                            const hoursBooked = scheduledEntries.reduce((sum, entry) => {
                                const [startH, startM] = entry.startTime.split(':').map(Number);
                                const [endH, endM] = entry.endTime.split(':').map(Number);
                                return sum + (endH + endM / 60) - (startH + startM / 60);
                            }, 0);

                            return (
                                <div
                                    key={dateStr}
                                    className={cn(
                                        'p-4 rounded-xl border transition-all',
                                        avail.available ? 'bg-background' : 'bg-muted/50',
                                        isToday(day) && 'ring-2 ring-primary'
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="font-medium">
                                                    {format(day, 'EEEE')}
                                                    {isToday(day) && (
                                                        <Badge variant="secondary" className="ml-2 text-xs">Today</Badge>
                                                    )}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(day, 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {/* Booked hours indicator */}
                                            {hoursBooked > 0 && (
                                                <Badge variant="outline" className="gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {hoursBooked.toFixed(1)}h booked
                                                </Badge>
                                            )}

                                            {/* Availability toggle */}
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor={`avail-${dateStr}`} className="text-sm">
                                                    {avail.available ? (
                                                        <span className="flex items-center gap-1 text-success">
                                                            <Check className="w-4 h-4" />
                                                            Available
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-muted-foreground">
                                                            <AlertCircle className="w-4 h-4" />
                                                            Unavailable
                                                        </span>
                                                    )}
                                                </Label>
                                                <Switch
                                                    id={`avail-${dateStr}`}
                                                    checked={avail.available}
                                                    onCheckedChange={() => handleToggleAvailability(dateStr)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Notes field */}
                                    <Input
                                        placeholder="Add notes (e.g., Holiday, Training, Half day)..."
                                        value={avail.notes}
                                        onChange={(e) => handleNotesChange(dateStr, e.target.value)}
                                        className="text-sm"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save Availability
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
