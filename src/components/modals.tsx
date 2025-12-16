'use client';

import { useState, ReactNode } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ChangeOrder, Project, PunchItem, DailyLog, PhotoCapture, PhotoLabel, QAChecklist, QAChecklistItem, QAChecklistType } from '@/lib/data';

// ============================================================================
// CHANGE ORDER DETAIL MODAL
// ============================================================================
interface CODetailModalProps {
    open: boolean;
    onClose: () => void;
    project: Project;
    changeOrder: ChangeOrder;
    onSubmit: (coId: string) => void;
    onApprove: (coId: string) => void;
    onReject: (coId: string) => void;
    onExecute: (coId: string) => void;
    onDelete: (coId: string) => void;
}

const coStatusConfig = {
    draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
    submitted: { label: 'Submitted', className: 'bg-warning/10 text-warning' },
    approved: { label: 'Approved', className: 'bg-success/10 text-success' },
    rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive' },
    executed: { label: 'Executed', className: 'bg-primary/10 text-primary' },
};

const workflowSteps = [
    { id: 'draft', label: 'Draft', icon: '📝' },
    { id: 'submitted', label: 'Submitted', icon: '📤' },
    { id: 'approved', label: 'Approved', icon: '✅' },
    { id: 'executed', label: 'Executed', icon: '🚀' },
];

export function CODetailModal({
    open,
    onClose,
    project,
    changeOrder: co,
    onSubmit,
    onApprove,
    onReject,
    onExecute,
    onDelete,
}: CODetailModalProps) {
    const getStepStatus = (stepId: string) => {
        const order = ['draft', 'submitted', 'approved', 'executed'];
        const currentIdx = order.indexOf(co.status);
        const stepIdx = order.indexOf(stepId);

        if (co.status === 'rejected') {
            if (stepIdx <= 1) return 'completed';
            if (stepIdx === 2) return 'rejected';
            return '';
        }

        if (stepIdx < currentIdx) return 'completed';
        if (stepIdx === currentIdx) return 'current';
        return '';
    };

    const getStepDate = (stepId: string) => {
        switch (stepId) {
            case 'draft': return co.createdDate;
            case 'submitted': return co.submittedDate;
            case 'approved': return co.approvedDate;
            case 'executed': return co.executedDate;
            default: return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Change Order: {co.id}</DialogTitle>
                </DialogHeader>

                {/* Header */}
                <div className={cn('p-4 rounded-lg bg-muted/50 border', co.status === 'approved' && 'border-success/30', co.status === 'rejected' && 'border-destructive/30')}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="text-lg font-bold">{co.desc}</div>
                            <div className="text-sm text-muted-foreground mt-1">{co.reason}</div>
                        </div>
                        <Badge className={cn('text-sm', coStatusConfig[co.status]?.className)}>
                            {co.status.toUpperCase()}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                        <div className="text-center">
                            <div className="text-xl font-bold text-success">+${co.costImpact.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Cost Impact</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-warning">+{co.timeImpact}d</div>
                            <div className="text-xs text-muted-foreground">Time Impact</div>
                        </div>
                        {co.approvedBy && (
                            <div className="text-center">
                                <div className="text-base font-medium">👤</div>
                                <div className="text-xs text-muted-foreground">{co.approvedBy}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Workflow Timeline */}
                <div className="flex items-center justify-between py-4">
                    {workflowSteps.map((step, i) => {
                        const status = getStepStatus(step.id);
                        const date = getStepDate(step.id);
                        return (
                            <div key={step.id} className="flex flex-col items-center flex-1 relative">
                                {i > 0 && (
                                    <div className={cn(
                                        'absolute left-0 top-4 w-1/2 h-0.5 -translate-x-1/2',
                                        status === 'completed' || status === 'current' ? 'bg-primary' : 'bg-border'
                                    )} />
                                )}
                                {i < workflowSteps.length - 1 && (
                                    <div className={cn(
                                        'absolute right-0 top-4 w-1/2 h-0.5 translate-x-1/2',
                                        status === 'completed' ? 'bg-primary' : 'bg-border'
                                    )} />
                                )}
                                <div className={cn(
                                    'w-8 h-8 rounded-full flex items-center justify-center text-lg z-10',
                                    status === 'completed' && 'bg-success text-success-foreground',
                                    status === 'current' && 'bg-primary text-primary-foreground',
                                    status === 'rejected' && 'bg-destructive text-destructive-foreground',
                                    !status && 'bg-muted border-2 border-border'
                                )}>
                                    {step.icon}
                                </div>
                                <div className="text-xs mt-2 font-medium">{step.label}</div>
                                {date && <div className="text-xs text-muted-foreground">{date}</div>}
                            </div>
                        );
                    })}
                </div>

                {/* Photos */}
                {co.photos && co.photos.length > 0 && (
                    <div className="space-y-2">
                        <div className="text-sm font-medium">📷 Photos ({co.photos.length})</div>
                        <div className="flex gap-2 flex-wrap">
                            {co.photos.map((photo, i) => (
                                <div key={i} className="w-16 h-16 bg-muted rounded-lg flex flex-col items-center justify-center text-2xl cursor-pointer hover:bg-muted/80">
                                    📷
                                    <div className="text-[10px] truncate max-w-full px-1">{photo}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Notes */}
                {co.notes && (
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Notes</div>
                        <div className="text-sm italic">&ldquo;{co.notes}&rdquo;</div>
                    </div>
                )}

                {/* History */}
                <div className="space-y-2">
                    <div className="text-sm font-medium">📜 History</div>
                    <div className="space-y-2">
                        {co.history.map((h, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm">
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                    {h.action.includes('Approved') ? '✅' : h.action.includes('Rejected') ? '❌' : h.action.includes('Executed') ? '🚀' : '📝'}
                                </div>
                                <div>
                                    <div className="font-medium">{h.action}</div>
                                    <div className="text-xs text-muted-foreground">{h.date} • {h.by}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <DialogFooter className="flex-wrap gap-2">
                    {co.status === 'draft' && (
                        <>
                            <Button onClick={() => { onSubmit(co.id); onClose(); }}>📤 Submit for Approval</Button>
                            <Button variant="secondary" onClick={() => toast.info('Edit functionality coming soon')}>✏️ Edit</Button>
                            <Button variant="destructive" onClick={() => { onDelete(co.id); onClose(); }}>🗑️ Delete</Button>
                        </>
                    )}
                    {co.status === 'submitted' && (
                        <>
                            <Button className="bg-success hover:bg-success/90" onClick={() => { onApprove(co.id); onClose(); }}>✅ Approve</Button>
                            <Button variant="destructive" onClick={() => { onReject(co.id); onClose(); }}>❌ Reject</Button>
                            <Button variant="secondary" onClick={() => toast.success('Reminder sent!')}>📧 Send Reminder</Button>
                        </>
                    )}
                    {co.status === 'approved' && (
                        <>
                            <Button className="bg-primary" onClick={() => { onExecute(co.id); onClose(); }}>🚀 Execute & Apply to Project</Button>
                            <Button variant="secondary" onClick={() => toast.success('Invoice update generated')}>🧾 Update Invoice</Button>
                        </>
                    )}
                    {co.status === 'executed' && (
                        <Button variant="secondary" onClick={() => toast.success('Impact report generated')}>📊 View Impact Report</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// NEW CHANGE ORDER MODAL
// ============================================================================
interface NewCOModalProps {
    open: boolean;
    onClose: () => void;
    projectId: number;
    nextNumber: number;
    onCreate: (co: Omit<ChangeOrder, 'id'>) => void;
}

export function NewCOModal({ open, onClose, projectId, nextNumber, onCreate }: NewCOModalProps) {
    const [desc, setDesc] = useState('');
    const [reason, setReason] = useState('');
    const [costImpact, setCostImpact] = useState('');
    const [timeImpact, setTimeImpact] = useState('');
    const [notes, setNotes] = useState('');

    const handleCreate = () => {
        if (!desc.trim() || !reason.trim()) {
            toast.error('Please fill in description and reason');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        onCreate({
            projectId,
            number: nextNumber,
            desc: desc.trim(),
            reason: reason.trim(),
            costImpact: parseFloat(costImpact) || 0,
            timeImpact: parseFloat(timeImpact) || 0,
            status: 'draft',
            createdDate: today,
            submittedDate: null,
            approvedDate: null,
            executedDate: null,
            approvedBy: null,
            photos: ['Documentation'],
            notes: notes.trim() || '',
            history: [{ action: 'Created', date: today, by: 'Derek Morrison' }],
        });

        // Reset form
        setDesc('');
        setReason('');
        setCostImpact('');
        setTimeImpact('');
        setNotes('');
        onClose();
        toast.success(`Change Order CO-${String(nextNumber).padStart(3, '0')} created!`);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>📝 Request Change Order</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">CO Number</label>
                        <Input value={`CO-${String(nextNumber).padStart(3, '0')}`} disabled className="mt-1 opacity-70" />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Description *</label>
                        <Input
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder="Brief description of the change order"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Reason / Justification *</label>
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Explain why this change is needed..."
                            className="mt-1"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">💰 Cost Impact ($) *</label>
                            <Input
                                type="number"
                                value={costImpact}
                                onChange={(e) => setCostImpact(e.target.value)}
                                placeholder="0"
                                min="0"
                                step="50"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">⏱️ Time Impact (days) *</label>
                            <Input
                                type="number"
                                value={timeImpact}
                                onChange={(e) => setTimeImpact(e.target.value)}
                                placeholder="0"
                                min="0"
                                step="0.5"
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">📷 Photos</label>
                        <div className="flex gap-2 mt-1">
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className="w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center text-2xl text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors"
                                    onClick={() => toast.success(`Photo ${i} added (simulated)`)}
                                >
                                    +
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Notes</label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional notes or context..."
                            className="mt-1"
                            rows={2}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleCreate}>Create Change Order</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// NEW PUNCH ITEM MODAL
// ============================================================================
interface NewPunchModalProps {
    open: boolean;
    onClose: () => void;
    onCreate: (item: Omit<PunchItem, 'id'>) => void;
}

export function NewPunchModal({ open, onClose, onCreate }: NewPunchModalProps) {
    const [text, setText] = useState('');
    const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
    const [due, setDue] = useState('');

    const handleCreate = () => {
        if (!text.trim()) {
            toast.error('Please enter a description');
            return;
        }

        onCreate({
            text: text.trim(),
            priority,
            reporter: 'Derek',
            due: due || 'TBD',
            completed: false,
        });

        setText('');
        setPriority('medium');
        setDue('');
        onClose();
        toast.success('Punch item added!');
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>🔧 Add Punch Item</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Description *</label>
                        <Textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Describe the issue..."
                            className="mt-1"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Priority</label>
                        <div className="flex gap-2 mt-1">
                            {(['high', 'medium', 'low'] as const).map(p => (
                                <Button
                                    key={p}
                                    variant={priority === p ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setPriority(p)}
                                    className={cn(
                                        priority === p && p === 'high' && 'bg-destructive hover:bg-destructive/90',
                                        priority === p && p === 'medium' && 'bg-warning hover:bg-warning/90',
                                        priority === p && p === 'low' && 'bg-muted-foreground hover:bg-muted-foreground/90'
                                    )}
                                >
                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Due Date</label>
                        <Input
                            type="date"
                            value={due}
                            onChange={(e) => setDue(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleCreate}>Add Punch Item</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// NEW DAILY LOG MODAL (Enhanced for Field Production)
// ============================================================================
interface NewLogModalProps {
    open: boolean;
    onClose: () => void;
    onCreate: (log: Omit<DailyLog, 'id'>) => void;
    projectId?: number;
}

export function NewLogModal({ open, onClose, onCreate, projectId = 0 }: NewLogModalProps) {
    const [crew, setCrew] = useState('3');
    const [hours, setHours] = useState('8');
    const [sqft, setSqft] = useState('');
    const [weather, setWeather] = useState<'sunny' | 'cloudy' | 'rain' | 'snow' | 'windy' | 'extreme-heat' | 'extreme-cold'>('sunny');
    const [temperature, setTemperature] = useState('72');
    const [siteConditions, setSiteConditions] = useState('');
    const [blockers, setBlockers] = useState('');
    const [notes, setNotes] = useState('');

    const handleCreate = () => {
        const today = new Date().toISOString().split('T')[0];
        const crewNum = parseInt(crew) || 3;
        const hoursNum = parseInt(hours) || 8;
        const totalHours = crewNum * hoursNum;
        const sqftCompleted = parseInt(sqft) || 0;

        onCreate({
            projectId,
            date: today,
            crewMembers: [],
            totalCrewCount: crewNum,
            totalHours: totalHours,
            weather,
            temperature: parseInt(temperature) || undefined,
            sqftCompleted,
            workCompleted: notes.trim() || 'Daily work completed',
            areasWorked: [],
            delays: blockers.trim() ? [{
                id: `delay-${Date.now()}`,
                type: 'other',
                description: blockers.trim(),
                duration: 0,
                responsibleParty: 'other',
                documentedAt: new Date().toISOString(),
            }] : [],
            hasDelays: !!blockers.trim(),
            totalDelayMinutes: 0,
            photos: [],
            materialsUsed: [],
            incidentReported: false,
            clientOnSite: false,
            siteConditions: siteConditions.trim() || undefined,
            createdBy: 'Current User',
            createdByUserId: 0,
            createdAt: new Date().toISOString(),
            submittedOffline: false,
            // Legacy compat
            crew: crewNum,
            hours: totalHours,
            notes: notes.trim() || 'No notes.',
            blockers: blockers.trim() || undefined,
        });

        // Reset form
        setCrew('3');
        setHours('8');
        setSqft('');
        setWeather('sunny');
        setTemperature('72');
        setSiteConditions('');
        setBlockers('');
        setNotes('');
        onClose();
        toast.success('Daily log created!');
    };

    const weatherOptions: { value: typeof weather; label: string; icon: string }[] = [
        { value: 'sunny', label: 'Sunny', icon: '☀️' },
        { value: 'cloudy', label: 'Cloudy', icon: '⛅' },
        { value: 'rain', label: 'Rain', icon: '🌧️' },
        { value: 'snow', label: 'Snow', icon: '❄️' },
        { value: 'extreme-heat', label: 'Hot', icon: '🌡️' },
    ];
    const conditionOptions = ['Clean & Ready', 'Debris Present', 'Wet/Damp', 'Dusty', 'Other'];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>📝 Daily Field Log</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Crew & Hours */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-sm font-medium">👷 Crew Size</label>
                            <Input
                                type="number"
                                value={crew}
                                onChange={(e) => setCrew(e.target.value)}
                                min="1"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">⏱️ Hours/Person</label>
                            <Input
                                type="number"
                                value={hours}
                                onChange={(e) => setHours(e.target.value)}
                                min="1"
                                max="24"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">📐 Sq Ft Done</label>
                            <Input
                                type="number"
                                value={sqft}
                                onChange={(e) => setSqft(e.target.value)}
                                placeholder="0"
                                min="0"
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {/* Weather & Temperature */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">🌤️ Weather</label>
                            <div className="flex gap-1 mt-1">
                                {weatherOptions.map(w => (
                                    <Button
                                        key={w.value}
                                        variant="outline"
                                        size="icon"
                                        className={cn('text-xl h-9 w-9', weather === w.value && 'border-primary bg-primary/10')}
                                        onClick={() => setWeather(w.value)}
                                        title={w.label}
                                    >
                                        {w.icon}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">🌡️ Temp (°F)</label>
                            <Input
                                type="number"
                                value={temperature}
                                onChange={(e) => setTemperature(e.target.value)}
                                placeholder="72"
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {/* Site Conditions */}
                    <div>
                        <label className="text-sm font-medium">🏗️ Site Conditions</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {conditionOptions.map(c => (
                                <Button
                                    key={c}
                                    variant="outline"
                                    size="sm"
                                    className={cn(siteConditions === c && 'border-primary bg-primary/10')}
                                    onClick={() => setSiteConditions(c)}
                                >
                                    {c}
                                </Button>
                            ))}
                        </div>
                        {siteConditions === 'Other' && (
                            <Input
                                value={siteConditions}
                                onChange={(e) => setSiteConditions(e.target.value)}
                                placeholder="Describe conditions..."
                                className="mt-2"
                            />
                        )}
                    </div>

                    {/* Blockers */}
                    <div>
                        <label className="text-sm font-medium text-warning">🚧 Blockers / Issues</label>
                        <Textarea
                            value={blockers}
                            onChange={(e) => setBlockers(e.target.value)}
                            placeholder="Material delays, access issues, equipment problems, waiting on GC..."
                            className="mt-1"
                            rows={2}
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-sm font-medium">📋 Notes</label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Work completed, areas covered, progress updates..."
                            className="mt-1"
                            rows={3}
                        />
                    </div>

                    {/* Summary Preview */}
                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                        <div className="font-medium text-muted-foreground mb-1">Quick Summary</div>
                        <div>
                            {crew} crew × {hours}hrs = <strong>{parseInt(crew) * parseInt(hours) || 0} total hours</strong>
                            {sqft && <>, {sqft} sq ft completed</>}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleCreate}>Save Daily Log</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


// ============================================================================
// CAPTURE UPDATE MODAL
// ============================================================================
interface CaptureModalProps {
    open: boolean;
    onClose: () => void;
    projectName: string;
    onProcess: (text: string) => void;
}

export function CaptureModal({ open, onClose, projectName, onProcess }: CaptureModalProps) {
    const [text, setText] = useState('');
    const [extractPunch, setExtractPunch] = useState(true);
    const [createLog, setCreateLog] = useState(true);
    const [generateSummary, setGenerateSummary] = useState(true);

    const handleProcess = () => {
        if (!text.trim()) {
            toast.error('Enter an update first');
            return;
        }
        onProcess(text.trim());
        setText('');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>⚡ Capture Update</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">What happened today?</label>
                        <Textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="e.g., 'Installed 300sf tile, found grout issue near door, crew of 3 worked 8 hours'"
                            className="mt-1"
                            rows={4}
                        />
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                            <input type="checkbox" checked={extractPunch} onChange={(e) => setExtractPunch(e.target.checked)} />
                            🔧 Extract punch items
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                            <input type="checkbox" checked={createLog} onChange={(e) => setCreateLog(e.target.checked)} />
                            📝 Create daily log
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                            <input type="checkbox" checked={generateSummary} onChange={(e) => setGenerateSummary(e.target.checked)} />
                            📤 Generate summary
                        </label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleProcess}>Process Update</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// EXECUTION SUCCESS MODAL
// ============================================================================
interface ExecutionSuccessModalProps {
    open: boolean;
    onClose: () => void;
    coId: string;
    costImpact: number;
    timeImpact: number;
    newDueDate: string;
    newContract: number;
    newMargin: number;
}

export function ExecutionSuccessModal({
    open,
    onClose,
    coId,
    costImpact,
    timeImpact,
    newDueDate,
    newContract,
    newMargin,
}: ExecutionSuccessModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <div className="text-center py-4">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-bold mb-2">{coId} Applied Successfully</h3>
                    <p className="text-muted-foreground">All project data has been automatically updated.</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Auto-Updates Applied</h4>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-background rounded-lg">
                            <div className="text-2xl mb-1">📅</div>
                            <div className="text-xs text-muted-foreground">Due Date</div>
                            <div className="font-bold text-warning">+{timeImpact}d</div>
                            <div className="text-xs">{newDueDate}</div>
                        </div>
                        <div className="text-center p-3 bg-background rounded-lg">
                            <div className="text-2xl mb-1">💰</div>
                            <div className="text-xs text-muted-foreground">Contract</div>
                            <div className="font-bold text-success">+${costImpact.toLocaleString()}</div>
                            <div className="text-xs">${newContract.toLocaleString()}</div>
                        </div>
                        <div className="text-center p-3 bg-background rounded-lg">
                            <div className="text-2xl mb-1">📊</div>
                            <div className="text-xs text-muted-foreound">Margin</div>
                            <div className="font-bold text-primary">{newMargin}%</div>
                            <div className="text-xs">Recalculated</div>
                        </div>
                    </div>
                </div>

                <div className="bg-primary/10 rounded-lg p-4 text-sm">
                    <strong>🧾 Invoice Update Required</strong><br />
                    <span className="text-muted-foreground">Don&apos;t forget to update the client invoice to reflect this change order.</span>
                </div>

                <DialogFooter>
                    <Button onClick={onClose}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// CAPTURE SUCCESS MODAL
// ============================================================================
interface CaptureSuccessModalProps {
    open: boolean;
    onClose: () => void;
    projectName: string;
    log: {
        date: string;
        crew: number;
        hours: number;
        sqft: number;
    };
    extractedPunch: string[];
}

export function CaptureSuccessModal({
    open,
    onClose,
    projectName,
    log,
    extractedPunch,
}: CaptureSuccessModalProps) {
    const summary = `${projectName}: ${log.sqft}sf installed today by crew of ${log.crew}. ${extractedPunch.length ? `${extractedPunch.length} issue(s) flagged.` : 'No issues.'}`;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <div className="text-center py-4">
                    <div className="text-5xl mb-4">✅</div>
                    <h3 className="text-xl font-bold">Update Processed</h3>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                    <strong>Daily Log Created:</strong><br />
                    {log.date} • {log.crew} crew • {log.hours} hrs • {log.sqft} sf
                </div>

                {extractedPunch.length > 0 && (
                    <div className="bg-warning/10 rounded-lg p-4">
                        <strong>Punch Items Extracted:</strong><br />
                        {extractedPunch.map((p, i) => <div key={i}>• {p}</div>)}
                    </div>
                )}

                <div className="bg-primary/10 rounded-lg p-4">
                    <strong>📤 Shareable Summary:</strong><br />
                    <em>&ldquo;{summary}&rdquo;</em>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                            navigator.clipboard.writeText(summary);
                            toast.success('Copied!');
                        }}
                    >
                        📋 Copy
                    </Button>
                </div>

                <DialogFooter>
                    <Button onClick={onClose}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// PHOTO CAPTURE MODAL
// ============================================================================
interface PhotoCaptureModalProps {
    open: boolean;
    onClose: () => void;
    onCapture: (photo: Omit<PhotoCapture, 'id'>) => void;
}

const photoLabels: { value: PhotoLabel; label: string; icon: string }[] = [
    { value: 'before', label: 'Before', icon: '📸' },
    { value: 'during', label: 'During', icon: '🔨' },
    { value: 'after', label: 'After', icon: '✅' },
    { value: 'issue', label: 'Issue', icon: '⚠️' },
    { value: 'subfloor', label: 'Subfloor', icon: '🏗️' },
    { value: 'moisture', label: 'Moisture', icon: '💧' },
];

export function PhotoCaptureModal({ open, onClose, onCapture }: PhotoCaptureModalProps) {
    const [label, setLabel] = useState<PhotoLabel>('during');
    const [caption, setCaption] = useState('');
    const [location, setLocation] = useState('');

    const handleCapture = () => {
        const now = new Date();
        onCapture({
            url: `photo_${now.getTime()}.jpg`, // Simulated - in production would be actual file
            label,
            caption: caption.trim() || undefined,
            timestamp: now.toISOString(),
            location: location.trim() || undefined,
        });

        setLabel('during');
        setCaption('');
        setLocation('');
        onClose();
        toast.success(`Photo captured with "${label}" label!`);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>📷 Capture Photo</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Photo Preview Area (Simulated) */}
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                        <div className="text-center text-muted-foreground">
                            <div className="text-4xl mb-2">📷</div>
                            <div className="text-sm">Tap to capture or select photo</div>
                        </div>
                    </div>

                    {/* Label Selection */}
                    <div>
                        <label className="text-sm font-medium">🏷️ Photo Label</label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {photoLabels.map(l => (
                                <Button
                                    key={l.value}
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        'flex flex-col h-auto py-2',
                                        label === l.value && 'border-primary bg-primary/10'
                                    )}
                                    onClick={() => setLabel(l.value)}
                                >
                                    <span className="text-lg">{l.icon}</span>
                                    <span className="text-xs">{l.label}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="text-sm font-medium">📍 Location/Area</label>
                        <Input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g., Main Lobby, Room 203, Kitchen..."
                            className="mt-1"
                        />
                    </div>

                    {/* Caption */}
                    <div>
                        <label className="text-sm font-medium">💬 Caption (optional)</label>
                        <Textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Add notes about this photo..."
                            className="mt-1"
                            rows={2}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleCapture}>Save Photo</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// QA CHECKLIST MODAL
// ============================================================================

// Default checklist items by type
const defaultChecklistItems: Record<QAChecklistType, string[]> = {
    prep: [
        'Subfloor is clean and free of debris',
        'Moisture test completed and documented',
        'Subfloor is level (within tolerance)',
        'All transitions and thresholds marked',
        'HVAC is operational for acclimation',
        'Material acclimated for 48+ hours',
        'Work area protected from other trades',
        'Client walkthrough completed',
    ],
    install: [
        'Layout pattern confirmed with client',
        'Starting point and direction established',
        'Expansion gaps maintained at walls',
        'Adhesive/underlayment applied correctly',
        'Seams are tight and aligned',
        'Pattern matching verified',
        'Transitions installed properly',
        'No visible damage or defects',
    ],
    closeout: [
        'All flooring installed per spec',
        'Transitions and trim complete',
        'Caulking and sealing complete',
        'Area cleaned thoroughly',
        'Punch list items addressed',
        'Final photos taken',
        'Client walkthrough completed',
        'Warranty documentation provided',
    ],
};

interface QAChecklistModalProps {
    open: boolean;
    onClose: () => void;
    projectId: number;
    type: QAChecklistType;
    existingChecklist?: QAChecklist;
    onSave: (checklist: Omit<QAChecklist, 'id'>) => void;
}

export function QAChecklistModal({
    open,
    onClose,
    projectId,
    type,
    existingChecklist,
    onSave,
}: QAChecklistModalProps) {
    const [items, setItems] = useState<QAChecklistItem[]>(() => {
        if (existingChecklist) {
            return existingChecklist.items;
        }
        return defaultChecklistItems[type].map((text, idx) => ({
            id: idx + 1,
            text,
            checked: false,
        }));
    });

    const toggleItem = (id: number) => {
        setItems(prev => prev.map(item =>
            item.id === id
                ? {
                    ...item,
                    checked: !item.checked,
                    checkedBy: !item.checked ? 'Derek' : undefined,
                    checkedAt: !item.checked ? new Date().toISOString() : undefined,
                }
                : item
        ));
    };

    const updateItemNotes = (id: number, notes: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, notes } : item
        ));
    };

    const handleSave = () => {
        const now = new Date().toISOString();
        const allChecked = items.every(item => item.checked);

        onSave({
            projectId,
            type,
            createdAt: existingChecklist?.createdAt || now,
            updatedAt: now,
            completedAt: allChecked ? now : undefined,
            items,
        });

        onClose();
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} checklist saved!`);
    };

    const completedCount = items.filter(i => i.checked).length;
    const progress = Math.round((completedCount / items.length) * 100);

    const typeConfig = {
        prep: { title: '🏗️ Prep Checklist', color: 'primary' },
        install: { title: '🔨 Install Checklist', color: 'warning' },
        closeout: { title: '✅ Closeout Checklist', color: 'success' },
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{typeConfig[type].title}</DialogTitle>
                </DialogHeader>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{completedCount} of {items.length} complete</span>
                        <span className={cn(
                            'font-medium',
                            progress === 100 ? 'text-success' : progress > 50 ? 'text-warning' : 'text-muted-foreground'
                        )}>
                            {progress}%
                        </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className={cn(
                                'h-full transition-all duration-300',
                                progress === 100 ? 'bg-success' : 'bg-primary'
                            )}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Checklist Items */}
                <div className="space-y-2">
                    {items.map(item => (
                        <div
                            key={item.id}
                            className={cn(
                                'p-3 rounded-lg border transition-colors',
                                item.checked ? 'bg-success/5 border-success/30' : 'bg-muted/30'
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <button
                                    onClick={() => toggleItem(item.id)}
                                    className={cn(
                                        'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors',
                                        item.checked
                                            ? 'bg-success border-success text-success-foreground'
                                            : 'border-muted-foreground/50 hover:border-primary'
                                    )}
                                >
                                    {item.checked && <span className="text-sm">✓</span>}
                                </button>
                                <div className="flex-1">
                                    <div className={cn(
                                        'text-sm',
                                        item.checked && 'text-muted-foreground line-through'
                                    )}>
                                        {item.text}
                                    </div>
                                    {item.checked && item.checkedBy && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                            ✓ {item.checkedBy} • {new Date(item.checkedAt!).toLocaleTimeString()}
                                        </div>
                                    )}
                                    <Input
                                        value={item.notes || ''}
                                        onChange={(e) => updateItemNotes(item.id, e.target.value)}
                                        placeholder="Add notes..."
                                        className="mt-2 h-8 text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>
                        {progress === 100 ? '✅ Complete Checklist' : 'Save Progress'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
