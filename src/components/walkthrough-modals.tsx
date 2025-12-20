'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    PunchItem,
    WalkthroughSession,
    WalkthroughAttendee,
    WalkthroughType,
    CompletionCertificate,
    SignatureData,
    TeamMember,
    Project
} from '@/lib/data';
import {
    Camera,
    Plus,
    X,
    Check,
    MapPin,
    User,
    Calendar,
    Clock,
    Star,
    ClipboardCheck,
    FileSignature,
    Download,
    Send,
    ChevronRight,
    AlertTriangle,
    CheckCircle2,
    Circle,
    Image as ImageIcon,
    Trash2,
    Edit3,
    Loader2
} from 'lucide-react';
import { useCameraCapture } from '@/hooks/useCameraCapture';

// ============================================================================
// ENHANCED PUNCH ITEM MODAL
// ============================================================================

interface EnhancedPunchModalProps {
    open: boolean;
    onClose: () => void;
    onCreate: (item: Omit<PunchItem, 'id'>) => void;
    teamMembers: TeamMember[];
    projectAreas?: string[];
    walkthroughSessionId?: string;
}

const PUNCH_CATEGORIES = [
    { id: 'flooring', label: 'Flooring', icon: '🔲' },
    { id: 'transition', label: 'Transitions', icon: '↔️' },
    { id: 'grout', label: 'Grout/Sealant', icon: '💧' },
    { id: 'baseboard', label: 'Baseboard', icon: '📏' },
    { id: 'damage', label: 'Damage', icon: '⚠️' },
    { id: 'installation', label: 'Installation', icon: '🔧' },
    { id: 'other', label: 'Other', icon: '📝' }
];

export function EnhancedPunchModal({
    open,
    onClose,
    onCreate,
    teamMembers,
    projectAreas = ['Main Lobby', 'Hallway', 'Reception', 'Break Room', 'Office Area', 'Restroom', 'Elevator Area'],
    walkthroughSessionId
}: EnhancedPunchModalProps) {
    const [text, setText] = useState('');
    const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
    const [category, setCategory] = useState<PunchItem['category']>('other');
    const [assignedTo, setAssignedTo] = useState('');
    const [location, setLocation] = useState('');
    const [due, setDue] = useState('');
    const [notes, setNotes] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);

    // Enterprise camera capture
    const {
        photos: capturedPhotos,
        isCapturing,
        capturePhoto,
        removePhoto: removeCameraPhoto,
        clearPhotos
    } = useCameraCapture({ maxPhotos: 10 });

    // Sync captured photos to local state
    useEffect(() => {
        setPhotos(capturedPhotos.map(p => p.url));
    }, [capturedPhotos]);
    const removePhoto = (index: number) => {
        const photoToRemove = capturedPhotos[index];
        if (photoToRemove) {
            removeCameraPhoto(photoToRemove.id);
        }
    };

    const handleCreate = () => {
        if (!text.trim()) {
            toast.error('Please enter a description');
            return;
        }

        const dueDate = due || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        onCreate({
            text: text.trim(),
            priority,
            reporter: 'Derek Morrison',
            due: dueDate,
            completed: false,
            assignedTo: assignedTo || undefined,
            assignedDate: assignedTo ? new Date().toISOString().split('T')[0] : undefined,
            location: location || undefined,
            photos: photos.length > 0 ? photos : undefined,
            notes: notes.trim() || undefined,
            category,
            walkthroughSessionId: walkthroughSessionId || undefined
        });

        // Reset form
        setText('');
        setPriority('medium');
        setCategory('other');
        setAssignedTo('');
        setLocation('');
        setDue('');
        setNotes('');
        clearPhotos();
        onClose();
        toast.success('Punch item added!');
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="text-2xl">🔧</span>
                        Add Punch Item
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Description */}
                    <div>
                        <label className="text-sm font-medium">Description *</label>
                        <Textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Describe the issue in detail..."
                            className="mt-1"
                            rows={3}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-sm font-medium">Category</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {PUNCH_CATEGORIES.map(cat => (
                                <Button
                                    key={cat.id}
                                    variant={category === cat.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setCategory(cat.id as PunchItem['category'])}
                                    className="gap-1"
                                >
                                    <span>{cat.icon}</span>
                                    {cat.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Priority */}
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
                                        'flex-1',
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

                    {/* Location & Assignment Row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Location
                            </label>
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full mt-1 h-9 px-3 rounded-md border bg-background text-sm"
                            >
                                <option value="">Select area...</option>
                                {projectAreas.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium flex items-center gap-1">
                                <User className="w-3 h-3" /> Assign To
                            </label>
                            <select
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                className="w-full mt-1 h-9 px-3 rounded-md border bg-background text-sm"
                            >
                                <option value="">Unassigned</option>
                                {teamMembers.map(member => (
                                    <option key={member.id} value={member.name}>
                                        {member.name} ({member.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="text-sm font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Due Date
                        </label>
                        <Input
                            type="date"
                            value={due}
                            onChange={(e) => setDue(e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    {/* Photos */}
                    <div>
                        <label className="text-sm font-medium flex items-center gap-1">
                            <Camera className="w-3 h-3" /> Photos
                        </label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {capturedPhotos.map((photo, idx) => (
                                <div key={photo.id} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                                    <img src={photo.url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removePhoto(idx)}
                                        className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl-lg p-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={capturePhoto}
                                disabled={isCapturing}
                                className="w-16 h-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                            >
                                {isCapturing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                                <span className="text-[10px]">{isCapturing ? '...' : 'Take'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-sm font-medium">Additional Notes</label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional context or instructions..."
                            className="mt-1"
                            rows={2}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleCreate}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Punch Item
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// CLIENT WALKTHROUGH MODE
// ============================================================================

interface ClientWalkthroughModeProps {
    open: boolean;
    onClose: () => void;
    project: Project;
    session: WalkthroughSession;
    onAddPunchItem: (item: Omit<PunchItem, 'id'>) => void;
    onComplete: (rating: number, feedback: string) => void;
    onUpdateSession: (updates: Partial<WalkthroughSession>) => void;
    teamMembers: TeamMember[];
}

export function ClientWalkthroughMode({
    open,
    onClose,
    project,
    session,
    onAddPunchItem,
    onComplete,
    onUpdateSession,
    teamMembers
}: ClientWalkthroughModeProps) {
    const [currentArea, setCurrentArea] = useState('');
    const [showAddPunch, setShowAddPunch] = useState(false);
    const [showComplete, setShowComplete] = useState(false);
    const [rating, setRating] = useState(4);
    const [feedback, setFeedback] = useState('');
    const [quickText, setQuickText] = useState('');
    const [quickPriority, setQuickPriority] = useState<'high' | 'medium' | 'low'>('medium');
    const [photos, setPhotos] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const projectAreas = ['Main Lobby', 'Hallway', 'Reception', 'Break Room', 'Office Area', 'Restroom', 'Elevator Area', 'Entrance', 'Storage'];

    const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setPhotos(prev => [...prev, event.target!.result as string]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleQuickAdd = () => {
        if (!quickText.trim()) {
            toast.error('Please describe the issue');
            return;
        }

        onAddPunchItem({
            text: quickText.trim(),
            priority: quickPriority,
            reporter: 'Client',
            due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            completed: false,
            location: currentArea || undefined,
            photos: photos.length > 0 ? photos : undefined,
            walkthroughSessionId: session.id,
            category: 'other'
        });

        // Update session
        onUpdateSession({
            areasReviewed: [...new Set([...session.areasReviewed, currentArea].filter(Boolean))],
            punchItemsCreated: [...session.punchItemsCreated, session.punchItemsCreated.length + 1]
        });

        setQuickText('');
        setPhotos([]);
        toast.success('Issue noted!');
    };

    const handleComplete = () => {
        onComplete(rating, feedback);
        setShowComplete(false);
        onClose();
        toast.success('Walkthrough completed!');
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-full h-[100vh] p-0 gap-0 rounded-none sm:rounded-none">
                {/* Mobile Header */}
                <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 safe-top">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm opacity-80">Client Walkthrough</div>
                            <div className="text-xl font-bold">{project.name}</div>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowComplete(true)}
                            className="bg-white/20 hover:bg-white/30 text-white border-0"
                        >
                            <Check className="w-4 h-4 mr-1" />
                            Finish
                        </Button>
                    </div>

                    {/* Progress */}
                    <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                            <span>Areas Reviewed</span>
                            <span>{session.areasReviewed.length} / {projectAreas.length}</span>
                        </div>
                        <Progress value={(session.areasReviewed.length / projectAreas.length) * 100} className="h-2" />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Area Selection */}
                    <div>
                        <label className="text-sm font-medium flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4" />
                            Current Area
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {projectAreas.map(area => {
                                const isReviewed = session.areasReviewed.includes(area);
                                return (
                                    <button
                                        key={area}
                                        onClick={() => setCurrentArea(area)}
                                        className={cn(
                                            'p-3 rounded-lg border-2 text-sm font-medium transition-all text-left',
                                            currentArea === area && 'border-primary bg-primary/10',
                                            isReviewed && currentArea !== area && 'border-success/50 bg-success/5',
                                            !isReviewed && currentArea !== area && 'border-border hover:border-primary/50'
                                        )}
                                    >
                                        <div className="flex items-center gap-1">
                                            {isReviewed ? (
                                                <CheckCircle2 className="w-3 h-3 text-success" />
                                            ) : (
                                                <Circle className="w-3 h-3 text-muted-foreground" />
                                            )}
                                            {area}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Issue Entry */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-warning" />
                            Note an Issue
                        </label>

                        <Textarea
                            value={quickText}
                            onChange={(e) => setQuickText(e.target.value)}
                            placeholder="Describe the issue..."
                            rows={2}
                            className="text-base"
                        />

                        {/* Priority - Large Touch Targets */}
                        <div className="flex gap-2">
                            {(['high', 'medium', 'low'] as const).map(p => (
                                <Button
                                    key={p}
                                    variant={quickPriority === p ? 'default' : 'outline'}
                                    size="lg"
                                    onClick={() => setQuickPriority(p)}
                                    className={cn(
                                        'flex-1 h-12',
                                        quickPriority === p && p === 'high' && 'bg-destructive hover:bg-destructive/90',
                                        quickPriority === p && p === 'medium' && 'bg-warning hover:bg-warning/90',
                                        quickPriority === p && p === 'low' && 'bg-muted-foreground hover:bg-muted-foreground/90'
                                    )}
                                >
                                    {p === 'high' ? '🔴' : p === 'medium' ? '🟡' : '🟢'} {p.charAt(0).toUpperCase() + p.slice(1)}
                                </Button>
                            ))}
                        </div>

                        {/* Photo Capture */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 h-12"
                            >
                                <Camera className="w-5 h-5 mr-2" />
                                Add Photo {photos.length > 0 && `(${photos.length})`}
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={handlePhotoCapture}
                            />
                        </div>

                        {/* Photo Preview */}
                        {photos.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {photos.map((photo, idx) => (
                                    <div key={idx} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border">
                                        <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                                            className="absolute top-0 right-0 bg-destructive text-white rounded-bl-lg p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Button
                            size="lg"
                            className="w-full h-14 text-lg"
                            onClick={handleQuickAdd}
                            disabled={!quickText.trim()}
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Issue to Punch List
                        </Button>
                    </div>

                    {/* Session Summary */}
                    <div className="bg-card rounded-lg border p-4">
                        <div className="text-sm font-medium mb-2">Session Summary</div>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                                <div className="text-2xl font-bold text-primary">{session.punchItemsCreated.length}</div>
                                <div className="text-xs text-muted-foreground">Issues Found</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-success">{session.areasReviewed.length}</div>
                                <div className="text-xs text-muted-foreground">Areas Done</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{session.attendees.length}</div>
                                <div className="text-xs text-muted-foreground">Attendees</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Complete Walkthrough Modal */}
                {showComplete && (
                    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex flex-col p-4 z-50">
                        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                            <div className="text-6xl">✅</div>
                            <div className="text-2xl font-bold text-center">Complete Walkthrough?</div>

                            {/* Rating */}
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground mb-2">Overall Rating</div>
                                <div className="flex gap-2 justify-center">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button
                                            key={n}
                                            onClick={() => setRating(n)}
                                            className="p-2"
                                        >
                                            <Star
                                                className={cn(
                                                    'w-10 h-10 transition-colors',
                                                    n <= rating ? 'fill-warning text-warning' : 'text-muted-foreground'
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Feedback */}
                            <div className="w-full max-w-md">
                                <label className="text-sm font-medium">Client Feedback</label>
                                <Textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Any comments from the client..."
                                    rows={3}
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex gap-3 w-full max-w-md">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="flex-1 h-14"
                                    onClick={() => setShowComplete(false)}
                                >
                                    Back
                                </Button>
                                <Button
                                    size="lg"
                                    className="flex-1 h-14"
                                    onClick={handleComplete}
                                >
                                    <Check className="w-5 h-5 mr-2" />
                                    Complete
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// SIGNATURE PAD COMPONENT
// ============================================================================

interface SignaturePadProps {
    onSave: (signature: string) => void;
    signerName: string;
    onNameChange: (name: string) => void;
    signerTitle?: string;
    onTitleChange?: (title: string) => void;
}

function SignaturePad({ onSave, signerName, onNameChange, signerTitle, onTitleChange }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);

        // Configure line style
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, []);

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        if ('touches' in e) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        setHasSignature(true);
        const { x, y } = getPos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        const { x, y } = getPos(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    };

    const save = () => {
        if (!hasSignature || !signerName.trim()) {
            toast.error('Please sign and enter your name');
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const signature = canvas.toDataURL('image/png');
        onSave(signature);
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sm font-medium">Print Name *</label>
                    <Input
                        value={signerName}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="Full name"
                        className="mt-1"
                    />
                </div>
                {onTitleChange && (
                    <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input
                            value={signerTitle || ''}
                            onChange={(e) => onTitleChange(e.target.value)}
                            placeholder="e.g., Property Manager"
                            className="mt-1"
                        />
                    </div>
                )}
            </div>

            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium">Signature *</label>
                    <Button variant="ghost" size="sm" onClick={clear}>
                        <Trash2 className="w-3 h-3 mr-1" /> Clear
                    </Button>
                </div>
                <div className="relative border-2 rounded-lg bg-white overflow-hidden" style={{ height: '120px' }}>
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                    {!hasSignature && (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
                            <Edit3 className="w-5 h-5 mr-2" />
                            Sign here
                        </div>
                    )}
                </div>
            </div>

            <Button onClick={save} className="w-full" disabled={!hasSignature || !signerName.trim()}>
                <Check className="w-4 h-4 mr-1" />
                Apply Signature
            </Button>
        </div>
    );
}

// ============================================================================
// COMPLETION CERTIFICATE MODAL
// ============================================================================

interface CompletionCertificateModalProps {
    open: boolean;
    onClose: () => void;
    project: Project;
    certificate?: CompletionCertificate;
    onGenerate: (cert: Omit<CompletionCertificate, 'id'>) => void;
    onAddSignature: (type: 'client' | 'contractor', signature: SignatureData) => void;
}

export function CompletionCertificateModal({
    open,
    onClose,
    project,
    certificate,
    onGenerate,
    onAddSignature
}: CompletionCertificateModalProps) {
    const [step, setStep] = useState<'checklist' | 'preview' | 'client-sign' | 'contractor-sign'>('checklist');
    const [checklist, setChecklist] = useState({
        allPunchItemsClosed: project.punchList.every(p => p.completed),
        finalWalkthroughComplete: true,
        qaChecklistsComplete: true,
        photosDocumented: project.photos.length > 0
    });
    const [outstandingItems, setOutstandingItems] = useState<string[]>([]);
    const [warrantyTerms, setWarrantyTerms] = useState('1 year parts and labor warranty on all installed flooring materials.');
    const [notes, setNotes] = useState('');

    // Signature states
    const [clientName, setClientName] = useState(project.client);
    const [clientTitle, setClientTitle] = useState('');
    const [contractorName, setContractorName] = useState('Derek Morrison');
    const [contractorTitle, setContractorTitle] = useState('Project Manager');

    const openPunchItems = project.punchList.filter(p => !p.completed);
    const changeOrdersTotal = project.changeOrders
        .filter(co => co.status === 'executed')
        .reduce((sum, co) => sum + co.costImpact, 0);

    const handleGenerate = () => {
        const today = new Date().toISOString().split('T')[0];
        const warrantyEnd = new Date();
        warrantyEnd.setFullYear(warrantyEnd.getFullYear() + 1);

        onGenerate({
            projectId: project.id,
            projectName: project.name,
            clientName: project.client,
            clientAddress: project.address,
            contractValue: project.value,
            changeOrdersTotal,
            finalValue: project.value + changeOrdersTotal,
            completionDate: today,
            generatedDate: today,
            allPunchItemsClosed: checklist.allPunchItemsClosed,
            finalWalkthroughComplete: checklist.finalWalkthroughComplete,
            qaChecklistsComplete: checklist.qaChecklistsComplete,
            photosDocumented: checklist.photosDocumented,
            outstandingItems: openPunchItems.map(p => p.text),
            warrantyStartDate: today,
            warrantyEndDate: warrantyEnd.toISOString().split('T')[0],
            warrantyTerms,
            notes,
            status: 'draft'
        });

        setStep('preview');
        toast.success('Certificate generated!');
    };

    const handleClientSign = (signature: string) => {
        onAddSignature('client', {
            signature,
            signedBy: clientName,
            signedAt: new Date().toISOString(),
            title: clientTitle
        });
        setStep('contractor-sign');
        toast.success('Client signature captured!');
    };

    const handleContractorSign = (signature: string) => {
        onAddSignature('contractor', {
            signature,
            signedBy: contractorName,
            signedAt: new Date().toISOString(),
            title: contractorTitle
        });
        toast.success('Certificate fully executed!');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSignature className="w-6 h-6" />
                        Completion Certificate
                    </DialogTitle>
                </DialogHeader>

                {step === 'checklist' && (
                    <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                            Review and confirm the following before generating the completion certificate.
                        </div>

                        {/* Checklist */}
                        <div className="space-y-3">
                            {[
                                { key: 'allPunchItemsClosed', label: 'All punch items closed', warning: openPunchItems.length > 0 ? `${openPunchItems.length} items still open` : undefined },
                                { key: 'finalWalkthroughComplete', label: 'Final walkthrough completed' },
                                { key: 'qaChecklistsComplete', label: 'QA checklists completed' },
                                { key: 'photosDocumented', label: 'Project photos documented' }
                            ].map(item => (
                                <label
                                    key={item.key}
                                    className={cn(
                                        'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                                        (checklist as Record<string, boolean>)[item.key] ? 'bg-success/5 border-success/30' : 'hover:bg-muted/50'
                                    )}
                                >
                                    <input
                                        type="checkbox"
                                        checked={(checklist as Record<string, boolean>)[item.key]}
                                        onChange={(e) => setChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                                        className="w-5 h-5"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium">{item.label}</div>
                                        {item.warning && (
                                            <div className="text-sm text-warning flex items-center gap-1 mt-0.5">
                                                <AlertTriangle className="w-3 h-3" />
                                                {item.warning}
                                            </div>
                                        )}
                                    </div>
                                    {(checklist as Record<string, boolean>)[item.key] && (
                                        <CheckCircle2 className="w-5 h-5 text-success" />
                                    )}
                                </label>
                            ))}
                        </div>

                        {/* Project Summary */}
                        <div className="bg-muted/50 rounded-lg p-4">
                            <div className="text-sm font-medium mb-3">Project Summary</div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <div className="text-muted-foreground">Contract Value</div>
                                    <div className="font-bold">${project.value.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Change Orders</div>
                                    <div className="font-bold text-success">+${changeOrdersTotal.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Final Value</div>
                                    <div className="font-bold text-lg">${(project.value + changeOrdersTotal).toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Square Footage</div>
                                    <div className="font-bold">{project.sqft.toLocaleString()} sf</div>
                                </div>
                            </div>
                        </div>

                        {/* Warranty Terms */}
                        <div>
                            <label className="text-sm font-medium">Warranty Terms</label>
                            <Textarea
                                value={warrantyTerms}
                                onChange={(e) => setWarrantyTerms(e.target.value)}
                                rows={2}
                                className="mt-1"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="text-sm font-medium">Additional Notes</label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any additional notes for the certificate..."
                                rows={2}
                                className="mt-1"
                            />
                        </div>

                        <DialogFooter>
                            <Button variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button onClick={handleGenerate}>
                                Generate Certificate
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === 'preview' && certificate && (
                    <div className="space-y-4">
                        {/* Certificate Preview */}
                        <div className="border-2 border-primary/20 rounded-lg p-6 bg-gradient-to-br from-background to-muted/30">
                            <div className="text-center mb-6">
                                <div className="text-3xl mb-2">🏆</div>
                                <div className="text-2xl font-bold">Certificate of Completion</div>
                                <div className="text-muted-foreground">FloorOps Pro</div>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-muted-foreground">Project</div>
                                        <div className="font-bold">{project.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Client</div>
                                        <div className="font-bold">{project.client}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Address</div>
                                        <div>{project.address}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Completion Date</div>
                                        <div>{new Date().toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <hr className="border-primary/20" />

                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-xl font-bold">${project.value.toLocaleString()}</div>
                                        <div className="text-xs text-muted-foreground">Contract</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-success">+${changeOrdersTotal.toLocaleString()}</div>
                                        <div className="text-xs text-muted-foreground">Change Orders</div>
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-primary">${(project.value + changeOrdersTotal).toLocaleString()}</div>
                                        <div className="text-xs text-muted-foreground">Final Value</div>
                                    </div>
                                </div>

                                <hr className="border-primary/20" />

                                <div className="grid grid-cols-2 gap-8 mt-6">
                                    <div className="text-center">
                                        <div className="h-16 border-b-2 border-muted-foreground/30 mb-1 flex items-end justify-center">
                                            {certificate.clientSignature ? (
                                                <img src={certificate.clientSignature.signature} alt="Client signature" className="max-h-14" />
                                            ) : (
                                                <span className="text-muted-foreground italic text-xs pb-1">Pending signature</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Client Signature</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="h-16 border-b-2 border-muted-foreground/30 mb-1 flex items-end justify-center">
                                            {certificate.contractorSignature ? (
                                                <img src={certificate.contractorSignature.signature} alt="Contractor signature" className="max-h-14" />
                                            ) : (
                                                <span className="text-muted-foreground italic text-xs pb-1">Pending signature</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Contractor Signature</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="flex-wrap gap-2">
                            <Button variant="outline" onClick={() => setStep('checklist')}>
                                Back
                            </Button>
                            <Button variant="secondary">
                                <Download className="w-4 h-4 mr-1" />
                                Download PDF
                            </Button>
                            <Button onClick={() => setStep('client-sign')}>
                                Collect Signatures
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === 'client-sign' && (
                    <div className="space-y-4">
                        <div className="text-center py-4">
                            <div className="text-4xl mb-2">✍️</div>
                            <div className="text-xl font-bold">Client Signature</div>
                            <div className="text-muted-foreground">Please have the client sign below</div>
                        </div>

                        <SignaturePad
                            onSave={handleClientSign}
                            signerName={clientName}
                            onNameChange={setClientName}
                            signerTitle={clientTitle}
                            onTitleChange={setClientTitle}
                        />

                        <Button variant="outline" onClick={() => setStep('preview')} className="w-full">
                            Back to Preview
                        </Button>
                    </div>
                )}

                {step === 'contractor-sign' && (
                    <div className="space-y-4">
                        <div className="text-center py-4">
                            <div className="text-4xl mb-2">✍️</div>
                            <div className="text-xl font-bold">Contractor Signature</div>
                            <div className="text-muted-foreground">Sign to finalize the certificate</div>
                        </div>

                        <div className="bg-success/10 border border-success/30 rounded-lg p-3 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-success" />
                            <span className="text-sm">Client signature captured successfully</span>
                        </div>

                        <SignaturePad
                            onSave={handleContractorSign}
                            signerName={contractorName}
                            onNameChange={setContractorName}
                            signerTitle={contractorTitle}
                            onTitleChange={setContractorTitle}
                        />

                        <Button variant="outline" onClick={() => setStep('client-sign')} className="w-full">
                            Back
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// WALKTHROUGH SESSION MANAGER
// ============================================================================

interface WalkthroughManagerProps {
    open: boolean;
    onClose: () => void;
    project: Project;
    sessions: WalkthroughSession[];
    onCreateSession: (session: Omit<WalkthroughSession, 'id'>) => void;
    onStartSession: (id: string) => void;
}

export function WalkthroughManager({
    open,
    onClose,
    project,
    sessions,
    onCreateSession,
    onStartSession
}: WalkthroughManagerProps) {
    const [showNew, setShowNew] = useState(false);
    const [newType, setNewType] = useState<WalkthroughType>('final');
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
    const [newTime, setNewTime] = useState('10:00');
    const [attendees, setAttendees] = useState<WalkthroughAttendee[]>([
        { name: project.client, role: 'client' }
    ]);
    const [newAttendeeName, setNewAttendeeName] = useState('');
    const [newAttendeeRole, setNewAttendeeRole] = useState<WalkthroughAttendee['role']>('other');

    const typeLabels: Record<WalkthroughType, { label: string; icon: string; desc: string }> = {
        'pre-install': { label: 'Pre-Install', icon: '📋', desc: 'Before work begins' },
        'mid-project': { label: 'Mid-Project', icon: '🔄', desc: 'Progress check' },
        'final': { label: 'Final', icon: '✅', desc: 'Project completion' },
        'punch': { label: 'Punch Walk', icon: '🔧', desc: 'Issue resolution' }
    };

    const handleCreate = () => {
        onCreateSession({
            projectId: project.id,
            type: newType,
            status: 'scheduled',
            scheduledDate: newDate,
            scheduledTime: newTime,
            attendees,
            punchItemsCreated: [],
            areasReviewed: [],
            createdBy: 'Derek Morrison',
            photos: []
        });
        setShowNew(false);
        toast.success('Walkthrough scheduled!');
    };

    const addAttendee = () => {
        if (!newAttendeeName.trim()) return;
        setAttendees(prev => [...prev, { name: newAttendeeName.trim(), role: newAttendeeRole }]);
        setNewAttendeeName('');
    };

    const removeAttendee = (index: number) => {
        setAttendees(prev => prev.filter((_, i) => i !== index));
    };

    const projectSessions = sessions.filter(s => s.projectId === project.id);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ClipboardCheck className="w-6 h-6" />
                        Walkthrough Sessions
                    </DialogTitle>
                </DialogHeader>

                {!showNew ? (
                    <div className="space-y-4">
                        {/* Existing Sessions */}
                        {projectSessions.length > 0 ? (
                            <div className="space-y-2">
                                {projectSessions.map(session => (
                                    <div
                                        key={session.id}
                                        className="p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{typeLabels[session.type].icon}</span>
                                                    <span className="font-medium">{typeLabels[session.type].label}</span>
                                                    <Badge variant={
                                                        session.status === 'completed' ? 'default' :
                                                            session.status === 'in-progress' ? 'secondary' :
                                                                'outline'
                                                    }>
                                                        {session.status}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {session.scheduledDate} {session.scheduledTime && `at ${session.scheduledTime}`}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {session.attendees.length} attendees • {session.punchItemsCreated.length} issues
                                                </div>
                                            </div>
                                            {session.status === 'scheduled' && (
                                                <Button size="sm" onClick={() => onStartSession(session.id)}>
                                                    Start
                                                </Button>
                                            )}
                                            {session.status === 'completed' && session.overallRating && (
                                                <div className="flex items-center gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(n => (
                                                        <Star
                                                            key={n}
                                                            className={cn(
                                                                'w-4 h-4',
                                                                n <= session.overallRating! ? 'fill-warning text-warning' : 'text-muted-foreground/30'
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <ClipboardCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <div>No walkthrough sessions yet</div>
                                <div className="text-sm">Schedule your first walkthrough</div>
                            </div>
                        )}

                        <Button onClick={() => setShowNew(true)} className="w-full">
                            <Plus className="w-4 h-4 mr-1" />
                            Schedule Walkthrough
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Walkthrough Type */}
                        <div>
                            <label className="text-sm font-medium">Walkthrough Type</label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                {(Object.entries(typeLabels) as [WalkthroughType, typeof typeLabels[WalkthroughType]][]).map(([type, config]) => (
                                    <button
                                        key={type}
                                        onClick={() => setNewType(type)}
                                        className={cn(
                                            'p-3 rounded-lg border text-left transition-all',
                                            newType === type ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{config.icon}</span>
                                            <div>
                                                <div className="font-medium text-sm">{config.label}</div>
                                                <div className="text-xs text-muted-foreground">{config.desc}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium">Date</label>
                                <Input
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Time</label>
                                <Input
                                    type="time"
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Attendees */}
                        <div>
                            <label className="text-sm font-medium">Attendees</label>
                            <div className="space-y-2 mt-1">
                                {attendees.map((att, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <span className="flex-1">{att.name}</span>
                                        <Badge variant="outline" className="text-xs">{att.role}</Badge>
                                        <Button variant="ghost" size="sm" onClick={() => removeAttendee(idx)}>
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <Input
                                        value={newAttendeeName}
                                        onChange={(e) => setNewAttendeeName(e.target.value)}
                                        placeholder="Name"
                                        className="flex-1"
                                    />
                                    <select
                                        value={newAttendeeRole}
                                        onChange={(e) => setNewAttendeeRole(e.target.value as WalkthroughAttendee['role'])}
                                        className="h-9 px-2 rounded-md border bg-background text-sm"
                                    >
                                        <option value="client">Client</option>
                                        <option value="pm">PM</option>
                                        <option value="installer">Installer</option>
                                        <option value="gc">GC</option>
                                        <option value="architect">Architect</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <Button variant="outline" size="icon" onClick={addAttendee}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setShowNew(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>
                                <Calendar className="w-4 h-4 mr-1" />
                                Schedule
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
