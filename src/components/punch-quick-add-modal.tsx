'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
    Camera, MapPin, User, Calendar, Flame, AlertTriangle, Circle,
    Mic, MicOff, X, Plus, Sparkles, Loader2, RefreshCw
} from 'lucide-react';
import { PunchItem, PunchItemPriority, PunchItemCategory, PunchItemHistoryEntry } from '@/lib/data';
import { useCameraCapture, CapturedPhoto } from '@/hooks/useCameraCapture';

interface QuickAddPunchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId?: number;
    projectName?: string;
    projects?: { id: number; name: string }[];
    onAdd: (item: Omit<PunchItem, 'id'>, projectId: number) => void;
    teamMembers: { id: number; name: string; role: string }[];
    currentUserName: string;
    defaultLocation?: string;
}

const PRIORITY_QUICK_OPTIONS: { value: PunchItemPriority; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'critical', label: 'Critical', icon: <Flame className="w-4 h-4" />, color: 'border-rose-500 bg-rose-500/10 text-rose-700' },
    { value: 'high', label: 'High', icon: <AlertTriangle className="w-4 h-4" />, color: 'border-red-500 bg-red-500/10 text-red-600' },
    { value: 'medium', label: 'Medium', icon: <Circle className="w-4 h-4" />, color: 'border-amber-500 bg-amber-500/10 text-amber-600' },
    { value: 'low', label: 'Low', icon: <Circle className="w-4 h-4" />, color: 'border-emerald-500 bg-emerald-500/10 text-emerald-600' }
];

const CATEGORY_SUGGESTIONS: { value: PunchItemCategory; label: string }[] = [
    { value: 'flooring', label: 'Flooring' },
    { value: 'transition', label: 'Transition' },
    { value: 'grout', label: 'Grout' },
    { value: 'baseboard', label: 'Baseboard' },
    { value: 'damage', label: 'Damage' },
    { value: 'cleanup', label: 'Cleanup' }
];

// AI-powered text analysis for smart suggestions (mock - ready for OpenAI integration)
function analyzeTextForSuggestions(text: string): { category?: PunchItemCategory; priority?: PunchItemPriority; tags?: string[] } {
    const lower = text.toLowerCase();
    let category: PunchItemCategory | undefined;
    let priority: PunchItemPriority = 'medium';
    const tags: string[] = [];

    // Category detection
    if (lower.includes('grout') || lower.includes('sealer')) category = 'grout';
    else if (lower.includes('transition') || lower.includes('strip')) category = 'transition';
    else if (lower.includes('baseboard') || lower.includes('base board') || lower.includes('trim')) category = 'baseboard';
    else if (lower.includes('chip') || lower.includes('crack') || lower.includes('damage') || lower.includes('broken')) category = 'damage';
    else if (lower.includes('clean') || lower.includes('scuff') || lower.includes('mark')) category = 'cleanup';
    else if (lower.includes('floor') || lower.includes('tile') || lower.includes('plank') || lower.includes('lvp')) category = 'flooring';

    // Priority detection
    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('safety') || lower.includes('trip') || lower.includes('hazard')) priority = 'critical';
    else if (lower.includes('client') || lower.includes('walkthrough') || lower.includes('visible')) priority = 'high';
    else if (lower.includes('minor') || lower.includes('small') || lower.includes('touch')) priority = 'low';

    // Tag extraction
    if (lower.includes('safety')) tags.push('safety');
    if (lower.includes('client')) tags.push('client-visible');
    if (lower.includes('photo')) tags.push('needs-photo');

    return { category, priority, tags };
}

export function QuickAddPunchModal({
    open, onOpenChange, projectId, projectName, projects, onAdd, teamMembers, currentUserName, defaultLocation
}: QuickAddPunchModalProps) {
    const [selectedProjectId, setSelectedProjectId] = useState<number | ''>(projectId || '');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<PunchItemPriority>('medium');
    const [category, setCategory] = useState<PunchItemCategory | ''>('');
    const [location, setLocation] = useState(defaultLocation || '');
    const [assignee, setAssignee] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<ReturnType<typeof analyzeTextForSuggestions>>({});

    // Enterprise camera capture with permissions
    const {
        photos: capturedPhotos,
        isCapturing,
        hasPermission,
        capturePhoto,
        removePhoto: removeCameraPhoto,
        retake,
        clearPhotos
    } = useCameraCapture({ maxPhotos: 5 });

    // Convert captured photos to URL strings for backward compatibility
    const photos = capturedPhotos.map(p => p.url);

    const handleDescriptionChange = (value: string) => {
        setDescription(value);
        if (value.length > 10) {
            const newSuggestions = analyzeTextForSuggestions(value);
            setSuggestions(newSuggestions);
            setShowSuggestions(!!newSuggestions.category || !!newSuggestions.priority);
        } else {
            setShowSuggestions(false);
        }
    };

    const applySuggestions = () => {
        if (suggestions.category && !category) setCategory(suggestions.category);
        if (suggestions.priority) setPriority(suggestions.priority);
        setShowSuggestions(false);
    };

    const handlePhotoCapture = () => {
        capturePhoto();
    };

    const removePhoto = (index: number) => {
        const photoToRemove = capturedPhotos[index];
        if (photoToRemove) {
            removeCameraPhoto(photoToRemove.id);
        }
    };

    const getDefaultDueDate = (): string => {
        const date = new Date();
        // Critical = tomorrow, High = 2 days, Medium = 3 days, Low = 5 days
        const daysToAdd = priority === 'critical' ? 1 : priority === 'high' ? 2 : priority === 'medium' ? 3 : 5;
        date.setDate(date.getDate() + daysToAdd);
        return date.toISOString().split('T')[0];
    };

    const handleSubmit = () => {
        if (!description.trim()) return;
        const targetProjectId = projectId || (selectedProjectId as number);
        if (!targetProjectId) return;

        const now = new Date().toISOString();
        const historyEntry: PunchItemHistoryEntry = {
            id: `h-${Date.now()}`,
            timestamp: now,
            userName: currentUserName,
            action: 'created'
        };

        const newItem: Omit<PunchItem, 'id'> = {
            text: description,
            priority,
            category: category || 'other',
            reporter: currentUserName,
            reportedDate: now.split('T')[0],
            due: dueDate || getDefaultDueDate(),
            completed: false,
            status: assignee ? 'assigned' : 'open',
            location: location || undefined,
            assignedTo: assignee || undefined,
            assignedDate: assignee ? now : undefined,
            assignedBy: assignee ? currentUserName : undefined,
            photos: photos.length > 0 ? photos : undefined,
            visibleToClient: priority === 'critical' || priority === 'high',
            verificationRequired: priority === 'critical',
            createdAt: now,
            updatedAt: now,
            history: [historyEntry]
        };

        onAdd(newItem, targetProjectId);

        // Reset form
        setDescription('');
        setPriority('medium');
        setCategory('');
        setLocation(defaultLocation || '');
        setAssignee('');
        setDueDate('');
        clearPhotos();
        setSuggestions({});
        setShowSuggestions(false);
        onOpenChange(false);
    };

    const toggleVoiceRecording = () => {
        // Voice-to-text would integrate with Web Speech API or OpenAI Whisper
        // For now, just toggle the state
        setIsRecording(!isRecording);
        if (!isRecording) {
            // TODO: Start recording with Web Speech API
            setTimeout(() => setIsRecording(false), 3000); // Mock: stop after 3s
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />Quick Add Punch Item
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">{projectName}</p>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {/* Project Selection (if not pre-defined) */}
                    {!projectId && projects && (
                        <div>
                            <Label>Project</Label>
                            <Select
                                value={selectedProjectId.toString()}
                                onValueChange={(v) => setSelectedProjectId(parseInt(v))}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {/* Photo Capture Area - Mobile-First Camera Access */}
                    {hasPermission && (
                        <Card className="border-dashed">
                            <CardContent className="p-4">
                                {capturedPhotos.length > 0 ? (
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {capturedPhotos.map((photo, idx) => (
                                            <div key={photo.id} className="relative flex-shrink-0 w-20 h-20 rounded-lg bg-muted overflow-hidden group">
                                                <img src={photo.url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                                {/* Retake button */}
                                                <button
                                                    onClick={() => retake(photo.id)}
                                                    className="absolute bottom-1 left-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <RefreshCw className="w-3 h-3" />
                                                </button>
                                                {/* Remove button */}
                                                <button
                                                    onClick={() => removePhoto(idx)}
                                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {capturedPhotos.length < 5 && (
                                            <button
                                                onClick={handlePhotoCapture}
                                                disabled={isCapturing}
                                                className="flex-shrink-0 w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
                                            >
                                                {isCapturing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={handlePhotoCapture}
                                        disabled={isCapturing}
                                        className="w-full py-8 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors rounded-lg disabled:opacity-50"
                                    >
                                        {isCapturing ? (
                                            <Loader2 className="w-10 h-10 mb-2 animate-spin" />
                                        ) : (
                                            <Camera className="w-10 h-10 mb-2" />
                                        )}
                                        <span className="text-sm font-medium">Tap to take photo</span>
                                        <span className="text-xs text-muted-foreground/60 mt-1">Opens your camera</span>
                                    </button>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Description with Voice Input */}
                    <div className="relative">
                        <Label>Description</Label>
                        <div className="flex gap-2 mt-1">
                            <Textarea
                                placeholder="Describe the issue..."
                                value={description}
                                onChange={(e) => handleDescriptionChange(e.target.value)}
                                className="flex-1 min-h-[80px]"
                            />
                            <Button
                                type="button"
                                variant={isRecording ? "destructive" : "outline"}
                                size="icon"
                                className="flex-shrink-0 h-auto"
                                onClick={toggleVoiceRecording}
                            >
                                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>

                    {/* AI Suggestions */}
                    {showSuggestions && (
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2 text-sm mb-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="font-medium">Smart Suggestions</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.category && (
                                        <Badge variant="secondary">Category: {suggestions.category}</Badge>
                                    )}
                                    {suggestions.priority && (
                                        <Badge variant="secondary">Priority: {suggestions.priority}</Badge>
                                    )}
                                </div>
                                <Button size="sm" variant="ghost" className="mt-2" onClick={applySuggestions}>
                                    Apply Suggestions
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Priority Selection */}
                    <div>
                        <Label>Priority</Label>
                        <div className="grid grid-cols-4 gap-2 mt-1">
                            {PRIORITY_QUICK_OPTIONS.map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => setPriority(p.value)}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${priority === p.value ? p.color : 'border-muted bg-muted/30'
                                        }`}
                                >
                                    {p.icon}
                                    <span className="text-xs font-medium">{p.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Chips */}
                    <div>
                        <Label>Category</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {CATEGORY_SUGGESTIONS.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setCategory(category === c.value ? '' : c.value)}
                                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${category === c.value
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted hover:bg-muted/80'
                                        }`}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" />Location</Label>
                        <Input
                            placeholder="e.g., Main Lobby, Room 203..."
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    {/* Quick Assign */}
                    <div>
                        <Label className="flex items-center gap-2"><User className="w-4 h-4" />Assign To (Optional)</Label>
                        <Select value={assignee || 'unassigned'} onValueChange={(v) => setAssignee(v === 'unassigned' ? '' : v)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Leave unassigned" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {(teamMembers || []).map(m => (
                                    <SelectItem key={m.id} value={m.name}>{m.name} ({m.role})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Due Date */}
                    <div>
                        <Label className="flex items-center gap-2"><Calendar className="w-4 h-4" />Due Date</Label>
                        <Input
                            type="date"
                            value={dueDate || getDefaultDueDate()}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Auto-set based on priority</p>
                    </div>

                    {/* Submit */}
                    <Button
                        onClick={handleSubmit}
                        disabled={!description.trim()}
                        className="w-full gap-2"
                        size="lg"
                    >
                        <Plus className="w-5 h-5" />
                        Create Punch Item
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
