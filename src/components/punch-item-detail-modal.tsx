'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    X, Camera, MapPin, User, Calendar, Clock, CheckCircle2, AlertTriangle,
    Flame, Image, MessageSquare, History, ChevronLeft, ChevronRight, Edit2,
    Save, Trash2, UserPlus, Send, Eye, EyeOff
} from 'lucide-react';
import { PunchItem, PunchItemPhoto, PunchItemHistoryEntry, PunchItemPriority, PunchItemCategory, PunchItemStatus } from '@/lib/data';

interface PunchItemDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: PunchItem & { projectId: number; projectName: string };
    onUpdate: (updates: Partial<PunchItem>) => void;
    onComplete: () => void;
    onDelete?: () => void;
    canEdit: boolean;
    canComplete: boolean;
    canVerify: boolean;
    canDelete: boolean;
    teamMembers: { id: number; name: string; role: string }[];
    currentUserName: string;
}

const PRIORITY_OPTIONS: { value: PunchItemPriority; label: string; color: string }[] = [
    { value: 'critical', label: 'Critical', color: 'bg-rose-500' },
    { value: 'high', label: 'High', color: 'bg-red-500' },
    { value: 'medium', label: 'Medium', color: 'bg-amber-500' },
    { value: 'low', label: 'Low', color: 'bg-emerald-500' }
];

const CATEGORY_OPTIONS: { value: PunchItemCategory; label: string }[] = [
    { value: 'flooring', label: 'Flooring' },
    { value: 'transition', label: 'Transition' },
    { value: 'grout', label: 'Grout' },
    { value: 'baseboard', label: 'Baseboard' },
    { value: 'damage', label: 'Damage' },
    { value: 'installation', label: 'Installation' },
    { value: 'cleanup', label: 'Cleanup' },
    { value: 'touch-up', label: 'Touch-up' },
    { value: 'other', label: 'Other' }
];

const STATUS_OPTIONS: { value: PunchItemStatus; label: string; color: string }[] = [
    { value: 'open', label: 'Open', color: 'bg-gray-500' },
    { value: 'assigned', label: 'Assigned', color: 'bg-blue-500' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-amber-500' },
    { value: 'needs-verification', label: 'Needs Verification', color: 'bg-purple-500' },
    { value: 'completed', label: 'Completed', color: 'bg-emerald-500' },
    { value: 'on-hold', label: 'On Hold', color: 'bg-gray-400' }
];

export function PunchItemDetailModal({
    open, onOpenChange, item, onUpdate, onComplete, onDelete,
    canEdit, canComplete, canVerify, canDelete, teamMembers, currentUserName
}: PunchItemDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<PunchItem>>({});
    const [newNote, setNewNote] = useState('');
    const [activeTab, setActiveTab] = useState('details');
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

    useEffect(() => {
        if (open) {
            setEditData({
                text: item.text,
                priority: item.priority as PunchItemPriority,
                category: item.category,
                location: item.location,
                room: item.room,
                due: item.due,
                assignedTo: item.assignedTo,
                estimatedHours: item.estimatedHours,
                notes: item.notes,
                visibleToClient: item.visibleToClient
            });
        }
    }, [open, item]);

    const allPhotos: PunchItemPhoto[] = [
        ...(item.beforePhotos || []),
        ...((item.photos as PunchItemPhoto[]) || []),
        ...(item.afterPhotos || [])
    ].filter(p => typeof p === 'object');

    const handleSave = () => {
        const now = new Date().toISOString();
        const historyEntry: PunchItemHistoryEntry = {
            id: `h-${Date.now()}`,
            timestamp: now,
            userName: currentUserName,
            action: 'updated',
            notes: 'Updated punch item details'
        };
        onUpdate({
            ...editData,
            updatedAt: now,
            history: [...(item.history || []), historyEntry]
        });
        setIsEditing(false);
    };

    const handleAssign = (assignee: string) => {
        const now = new Date().toISOString();
        const historyEntry: PunchItemHistoryEntry = {
            id: `h-${Date.now()}`,
            timestamp: now,
            userName: currentUserName,
            action: 'assigned',
            newValue: assignee
        };
        onUpdate({
            assignedTo: assignee,
            assignedDate: now,
            assignedBy: currentUserName,
            status: 'assigned',
            updatedAt: now,
            history: [...(item.history || []), historyEntry]
        });
    };

    const handleMarkComplete = () => {
        const now = new Date().toISOString();
        const historyEntry: PunchItemHistoryEntry = {
            id: `h-${Date.now()}`,
            timestamp: now,
            userName: currentUserName,
            action: 'completed'
        };
        onUpdate({
            completed: true,
            completedBy: currentUserName,
            completedDate: now,
            status: item.verificationRequired ? 'needs-verification' : 'completed',
            updatedAt: now,
            history: [...(item.history || []), historyEntry]
        });
        onComplete();
    };

    const handleVerify = () => {
        const now = new Date().toISOString();
        const historyEntry: PunchItemHistoryEntry = {
            id: `h-${Date.now()}`,
            timestamp: now,
            userName: currentUserName,
            action: 'verified'
        };
        onUpdate({
            verifiedBy: currentUserName,
            verifiedDate: now,
            status: 'completed',
            updatedAt: now,
            history: [...(item.history || []), historyEntry]
        });
    };

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        const now = new Date().toISOString();
        const historyEntry: PunchItemHistoryEntry = {
            id: `h-${Date.now()}`,
            timestamp: now,
            userName: currentUserName,
            action: 'note-added',
            notes: newNote
        };
        onUpdate({
            notes: item.notes ? `${item.notes}\n\n[${currentUserName} - ${new Date().toLocaleDateString()}]\n${newNote}` : newNote,
            updatedAt: now,
            history: [...(item.history || []), historyEntry]
        });
        setNewNote('');
    };

    const getPriorityStyle = (p: string) => {
        if (p === 'critical') return 'bg-rose-500/20 text-rose-700 border-rose-500/30';
        if (p === 'high') return 'bg-red-500/10 text-red-600 border-red-500/20';
        if (p === 'medium') return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    };

    const isOverdue = item.due && new Date(item.due) < new Date() && !item.completed;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <DialogTitle className="text-xl">Punch Item #{item.id}</DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">{item.projectName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getPriorityStyle(item.priority)}>
                                {item.priority === 'critical' && <Flame className="w-3 h-3 mr-1" />}
                                {item.priority}
                            </Badge>
                            {item.status && (
                                <Badge variant="secondary">{item.status.replace('-', ' ')}</Badge>
                            )}
                            {isOverdue && <Badge variant="destructive">OVERDUE</Badge>}
                        </div>
                    </div>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="photos" className="gap-1">
                            <Camera className="w-4 h-4" />Photos ({allPhotos.length})
                        </TabsTrigger>
                        <TabsTrigger value="notes">Notes</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    {/* Details Tab */}
                    <TabsContent value="details" className="space-y-4 mt-4">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <Label>Description</Label>
                                    <Textarea value={editData.text} onChange={(e) => setEditData({ ...editData, text: e.target.value })} className="mt-1" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Priority</Label>
                                        <Select value={editData.priority} onValueChange={(v) => setEditData({ ...editData, priority: v as PunchItemPriority })}>
                                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {PRIORITY_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Category</Label>
                                        <Select value={editData.category} onValueChange={(v) => setEditData({ ...editData, category: v as PunchItemCategory })}>
                                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {CATEGORY_OPTIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Location</Label>
                                        <Input value={editData.location || ''} onChange={(e) => setEditData({ ...editData, location: e.target.value })} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label>Room/Area</Label>
                                        <Input value={editData.room || ''} onChange={(e) => setEditData({ ...editData, room: e.target.value })} className="mt-1" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Due Date</Label>
                                        <Input type="date" value={editData.due} onChange={(e) => setEditData({ ...editData, due: e.target.value })} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label>Estimated Hours</Label>
                                        <Input type="number" step="0.5" value={editData.estimatedHours || ''} onChange={(e) => setEditData({ ...editData, estimatedHours: parseFloat(e.target.value) })} className="mt-1" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox checked={editData.visibleToClient} onCheckedChange={(c) => setEditData({ ...editData, visibleToClient: !!c })} />
                                    <Label className="flex items-center gap-1">{editData.visibleToClient ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}Visible to Client</Label>
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" />Save Changes</Button>
                                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <p className="font-medium text-lg">{item.text}</p>
                                    {item.notes && <p className="text-muted-foreground mt-2 text-sm whitespace-pre-wrap">{item.notes}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Card><CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><MapPin className="w-4 h-4" />Location</div>
                                        <p className="font-medium">{item.location || 'Not specified'}{item.room && ` - ${item.room}`}</p>
                                    </CardContent></Card>
                                    <Card><CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><User className="w-4 h-4" />Assigned To</div>
                                        <p className="font-medium">{item.assignedTo || 'Unassigned'}</p>
                                    </CardContent></Card>
                                    <Card><CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><Calendar className="w-4 h-4" />Due Date</div>
                                        <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>{item.due}{isOverdue && ' (OVERDUE)'}</p>
                                    </CardContent></Card>
                                    <Card><CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><Clock className="w-4 h-4" />Time Estimate</div>
                                        <p className="font-medium">{item.estimatedHours ? `${item.estimatedHours}h` : 'Not estimated'}{item.actualHours && ` (Actual: ${item.actualHours}h)`}</p>
                                    </CardContent></Card>
                                </div>
                                {item.completed && (
                                    <Card className="bg-emerald-500/5 border-emerald-500/20"><CardContent className="p-4">
                                        <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /><span className="font-medium">Completed</span></div>
                                        <p className="text-sm text-muted-foreground mt-1">By {item.completedBy} on {item.completedDate}</p>
                                        {item.verifiedBy && <p className="text-sm text-muted-foreground">Verified by {item.verifiedBy} on {item.verifiedDate}</p>}
                                    </CardContent></Card>
                                )}
                                <div className="flex flex-wrap gap-2 pt-4">
                                    {canEdit && <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2"><Edit2 className="w-4 h-4" />Edit</Button>}
                                    {canEdit && !item.assignedTo && (
                                        <Select onValueChange={handleAssign}>
                                            <SelectTrigger className="w-44"><UserPlus className="w-4 h-4 mr-2" />Assign To...</SelectTrigger>
                                            <SelectContent>{(teamMembers || []).map(m => <SelectItem key={m.id} value={m.name}>{m.name} ({m.role})</SelectItem>)}</SelectContent>
                                        </Select>
                                    )}
                                    {canComplete && !item.completed && <Button onClick={handleMarkComplete} className="gap-2 bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="w-4 h-4" />Mark Complete</Button>}
                                    {canVerify && item.status === 'needs-verification' && <Button onClick={handleVerify} className="gap-2"><CheckCircle2 className="w-4 h-4" />Verify & Close</Button>}
                                    {canDelete && <Button variant="destructive" onClick={onDelete} className="gap-2"><Trash2 className="w-4 h-4" />Delete</Button>}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    {/* Photos Tab */}
                    <TabsContent value="photos" className="mt-4">
                        {allPhotos.length > 0 ? (
                            <div className="space-y-4">
                                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                        <Image className="w-16 h-16" />
                                    </div>
                                    {allPhotos.length > 1 && (
                                        <>
                                            <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2" onClick={() => setSelectedPhotoIndex(i => Math.max(0, i - 1))}><ChevronLeft /></Button>
                                            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setSelectedPhotoIndex(i => Math.min(allPhotos.length - 1, i + 1))}><ChevronRight /></Button>
                                        </>
                                    )}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                        {selectedPhotoIndex + 1} / {allPhotos.length}
                                    </div>
                                </div>
                                {allPhotos[selectedPhotoIndex] && (
                                    <div className="text-sm text-muted-foreground">
                                        <Badge variant="outline" className="mr-2">{allPhotos[selectedPhotoIndex].type}</Badge>
                                        {allPhotos[selectedPhotoIndex].caption && <span>{allPhotos[selectedPhotoIndex].caption}</span>}
                                        <span className="ml-2">by {allPhotos[selectedPhotoIndex].takenBy}</span>
                                    </div>
                                )}
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {allPhotos.map((photo, idx) => (
                                        <button key={photo.id} onClick={() => setSelectedPhotoIndex(idx)} className={`flex-shrink-0 w-16 h-16 rounded-lg bg-muted border-2 ${idx === selectedPhotoIndex ? 'border-primary' : 'border-transparent'}`}>
                                            <Image className="w-full h-full p-3 text-muted-foreground" />
                                        </button>
                                    ))}
                                </div>
                                <Button variant="outline" className="gap-2 w-full"><Camera className="w-4 h-4" />Add Photo</Button>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                                <p className="text-muted-foreground">No photos attached</p>
                                <Button variant="outline" className="mt-4 gap-2"><Camera className="w-4 h-4" />Add Photo</Button>
                            </div>
                        )}
                    </TabsContent>

                    {/* Notes Tab */}
                    <TabsContent value="notes" className="mt-4 space-y-4">
                        <div className="space-y-2">
                            <Textarea placeholder="Add a note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={3} />
                            <Button onClick={handleAddNote} disabled={!newNote.trim()} className="gap-2"><Send className="w-4 h-4" />Add Note</Button>
                        </div>
                        {item.notes && (
                            <Card><CardContent className="p-4">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2"><MessageSquare className="w-4 h-4" />Notes</div>
                                <p className="whitespace-pre-wrap text-sm">{item.notes}</p>
                            </CardContent></Card>
                        )}
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="mt-4">
                        {item.history && item.history.length > 0 ? (
                            <div className="space-y-3">
                                {[...item.history].reverse().map((entry) => (
                                    <div key={entry.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <History className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{entry.userName} <span className="text-muted-foreground font-normal">{entry.action}</span></p>
                                            {entry.newValue && <p className="text-sm text-muted-foreground">→ {entry.newValue}</p>}
                                            {entry.notes && <p className="text-sm mt-1">{entry.notes}</p>}
                                            <p className="text-xs text-muted-foreground mt-1">{new Date(entry.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                                <p className="text-muted-foreground">No history available</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
