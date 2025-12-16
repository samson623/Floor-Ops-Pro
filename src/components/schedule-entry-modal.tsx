'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/components/data-provider';
import { ScheduleEntry, JobPhase, PHASE_CONFIGS, Crew } from '@/lib/data';
import { toast } from 'sonner';
import { format, addMinutes, parseISO, differenceInMinutes, isValid } from 'date-fns';
import { AlertTriangle, Clock, MapPin, Users, Calendar as CalendarIcon, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { can } from '@/lib/permissions';

interface ScheduleEntryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialDate?: Date;
    initialCrewId?: string;
    existingEntry?: ScheduleEntry;
    onSave?: () => void;
}

export function ScheduleEntryModal({
    open,
    onOpenChange,
    initialDate,
    initialCrewId,
    existingEntry,
    onSave
}: ScheduleEntryModalProps) {
    const {
        data,
        addScheduleEntry,
        updateScheduleEntry
    } = useData();

    // Form State
    const [projectId, setProjectId] = useState<string>('');
    const [phase, setPhase] = useState<JobPhase | ''>('');
    const [crewId, setCrewId] = useState<string>(initialCrewId || '');
    const [date, setDate] = useState<string>(
        initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    );
    const [startTime, setStartTime] = useState<string>('08:00');
    const [endTime, setEndTime] = useState<string>('17:00'); // Default 9h day? catch later
    const [travelMinutes, setTravelMinutes] = useState<number>(30);
    const [notes, setNotes] = useState<string>('');
    const [conflict, setConflict] = useState<string | null>(null);

    // Initialize from existing entry
    useEffect(() => {
        if (existingEntry) {
            setProjectId(existingEntry.projectId.toString());
            setPhase(existingEntry.phase);
            setCrewId(existingEntry.crewId);
            setDate(existingEntry.date);
            setStartTime(existingEntry.startTime);
            setEndTime(existingEntry.endTime);
            setTravelMinutes(existingEntry.travelMinutes);
            setNotes(existingEntry.notes || '');
        } else {
            // Reset for new entry
            if (!open) return; // Don't reset if closing
            setProjectId('');
            setPhase('');
            setCrewId(initialCrewId || '');
            setDate(initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
            setStartTime('08:00');
            // Auto-set end time based on phase default if possible, else 16:00
            setEndTime('16:00');
            setTravelMinutes(30);
            setNotes('');
        }
    }, [existingEntry, initialDate, initialCrewId, open]);

    // Update End Time when Phase changes (based on estimated hours)
    useEffect(() => {
        if (!phase || existingEntry) return;
        const config = PHASE_CONFIGS[phase as JobPhase];
        if (config && startTime) {
            // Simple default: 8 hours or config estimate (capped at 10h for single day)
            const hours = Math.min(config.estimatedHours, 8);
            const [h, m] = startTime.split(':').map(Number);
            const endH = h + hours;
            setEndTime(`${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        }
    }, [phase, startTime, existingEntry]);

    // Validation & Conflicts
    useEffect(() => {
        if (!date || !startTime || !endTime || !crewId) return;

        // Check availability
        const currentCrew = data.crews.find(c => c.id === crewId);
        if (!currentCrew) return;

        // Check conflicts with other entries for this crew
        const conflicts = data.scheduleEntries.filter(e =>
            e.crewId === crewId &&
            e.date === date &&
            e.id !== existingEntry?.id &&
            e.status !== 'cancelled'
        );

        const newStart = parseInt(startTime.replace(':', ''));
        const newEnd = parseInt(endTime.replace(':', ''));

        const hasOverlap = conflicts.some(e => {
            const eStart = parseInt(e.startTime.replace(':', ''));
            const eEnd = parseInt(e.endTime.replace(':', ''));
            return (newStart < eEnd && newEnd > eStart);
        });

        if (hasOverlap) {
            setConflict('This crew is already scheduled for this time slot.');
        } else {
            setConflict(null);
        }

    }, [date, startTime, endTime, crewId, data.scheduleEntries, existingEntry]);

    // Derived
    const durationHours = useMemo(() => {
        if (!startTime || !endTime) return 0;
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        return (eh + em / 60) - (sh + sm / 60);
    }, [startTime, endTime]);

    const activeProjects = useMemo(() =>
        data.projects.filter(p => p.status === 'active' || p.status === 'scheduled'),
        [data.projects]);

    const handleSubmit = () => {
        if (!projectId || !phase || !crewId || !date || !startTime || !endTime) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (conflict) {
            toast.error('Please resolve schedule conflicts before saving');
            return;
        }

        const entryData = {
            projectId: parseInt(projectId),
            phase: phase as JobPhase,
            crewId,
            date,
            startTime,
            endTime,
            travelMinutes,
            status: 'scheduled' as const,
            notes
        };

        if (existingEntry) {
            // @ts-ignore - updateScheduleEntry added to context via patch
            updateScheduleEntry(existingEntry.id, entryData);
            toast.success('Schedule updated');
        } else {
            // @ts-ignore - addScheduleEntry added to context via patch
            addScheduleEntry(entryData);
            toast.success('Crew assigned');
        }

        onSave?.();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{existingEntry ? 'Edit Schedule Assignment' : 'New Crew Assignment'}</DialogTitle>
                    <DialogDescription>
                        Assign a crew to a project phase. AI checks for conflicts automatically.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Project & Phase */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="project">Project</Label>
                            <Select value={projectId} onValueChange={setProjectId} disabled={!!existingEntry}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeProjects.map(p => (
                                        <SelectItem key={p.id} value={p.id.toString()}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phase">Phase</Label>
                            <Select value={phase} onValueChange={(v) => setPhase(v as JobPhase)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Phase" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(PHASE_CONFIGS).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>
                                            <span className="flex items-center gap-2">
                                                <span>{config.icon}</span>
                                                {config.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Crew Selection */}
                    <div className="grid gap-2">
                        <Label htmlFor="crew">Assign Crew</Label>
                        <Select value={crewId} onValueChange={setCrewId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Crew" />
                            </SelectTrigger>
                            <SelectContent>
                                {data.crews.map(crew => (
                                    <SelectItem key={crew.id} value={crew.id}>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: crew.color }}
                                            />
                                            {crew.name}
                                            <span className="text-muted-foreground text-xs ml-2">
                                                ({crew.members.length} members)
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="start">Start Time</Label>
                            <Input
                                id="start"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="end">End Time</Label>
                            <Input
                                id="end"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Duration & Travel Info (Read-onlyish or helper) */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Duration: {durationHours.toFixed(1)} hrs</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>Travel:</span>
                            <Input
                                type="number"
                                value={travelMinutes}
                                onChange={(e) => setTravelMinutes(parseInt(e.target.value))}
                                className="w-16 h-6 text-xs"
                            />
                            <span>min</span>
                        </div>
                    </div>

                    {/* Conflict Alert */}
                    {conflict && (
                        <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium">{conflict}</span>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes & Instructions</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Gate code, parking info, specific tools needed..."
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!!conflict}>
                        {existingEntry ? 'Update Schedule' : 'Assign Crew'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
