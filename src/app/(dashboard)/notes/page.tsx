'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    FileText, 
    Download, 
    Trash2, 
    Clock, 
    Archive, 
    FileJson, 
    FileType,
    Eye,
    Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
    SavedNote, 
    loadSavedNotes, 
    deleteNote as deleteNoteUtil,
    exportNotesAsJSON,
    exportNotesAsTXT,
    exportNoteAsJSON,
    exportNoteAsTXT
} from '@/lib/ai-notes';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function NotesPage() {
    const router = useRouter();
    const [notes, setNotes] = useState<SavedNote[]>([]);
    const [selectedNote, setSelectedNote] = useState<SavedNote | null>(null);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadedNotes = loadSavedNotes();
        setNotes(loadedNotes);
        setIsLoading(false);
    }, []);

    const handleDelete = (noteId: string) => {
        if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
            const updated = deleteNoteUtil(noteId);
            setNotes(updated);
            if (selectedNote?.id === noteId) {
                setSelectedNote(null);
                setShowViewDialog(false);
            }
        }
    };

    const handleView = (note: SavedNote) => {
        setSelectedNote(note);
        setShowViewDialog(true);
    };

    const handleExportAll = (format: 'json' | 'txt') => {
        if (format === 'json') {
            exportNotesAsJSON(notes);
        } else {
            exportNotesAsTXT(notes);
        }
    };

    const handleExportNote = (note: SavedNote, format: 'json' | 'txt') => {
        if (format === 'json') {
            exportNoteAsJSON(note);
        } else {
            exportNoteAsTXT(note);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading notes...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                            <Bot className="w-5 h-5" />
                        </div>
                        AI Notes
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        View, manage, and export your saved AI conversations
                    </p>
                </div>
                
                {notes.length > 0 && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportAll('json')}
                            className="gap-2"
                        >
                            <FileJson className="w-4 h-4" />
                            Export All JSON
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportAll('txt')}
                            className="gap-2"
                        >
                            <FileType className="w-4 h-4" />
                            Export All TXT
                        </Button>
                    </div>
                )}
            </div>

            {/* Notes Grid */}
            {notes.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Archive className="w-16 h-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            Your saved AI conversations will appear here.
                            <br />
                            Use &quot;Summarize &amp; File&quot; in the AI panel to save conversations.
                        </p>
                        <Button onClick={() => router.push('/dashboard')} variant="outline">
                            Open AI Panel
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.map((note) => (
                        <Card 
                            key={note.id} 
                            className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                            onClick={() => handleView(note)}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg line-clamp-2 mb-1">
                                            {note.title}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2 mt-2">
                                            {note.summary}
                                        </CardDescription>
                                    </div>
                                    <div className="ml-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleExportNote(note, 'json');
                                            }}
                                            title="Export as JSON"
                                        >
                                            <FileJson className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleExportNote(note, 'txt');
                                            }}
                                            title="Export as TXT"
                                        >
                                            <FileType className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(note.id);
                                            }}
                                            title="Delete note"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        {formatRelativeTime(note.createdAt)}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <FileText className="w-4 h-4" />
                                        {note.messageCount} messages
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* View Note Dialog */}
            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                    <DialogHeader className="shrink-0">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <DialogTitle className="text-2xl mb-2">{selectedNote?.title}</DialogTitle>
                                <DialogDescription className="text-base">
                                    {selectedNote?.summary}
                                </DialogDescription>
                            </div>
                            {selectedNote && (
                                <div className="flex gap-2 ml-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleExportNote(selectedNote, 'json')}
                                        className="gap-2"
                                    >
                                        <FileJson className="w-4 h-4" />
                                        JSON
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleExportNote(selectedNote, 'txt')}
                                        className="gap-2"
                                    >
                                        <FileType className="w-4 h-4" />
                                        TXT
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            if (selectedNote) {
                                                handleDelete(selectedNote.id);
                                            }
                                        }}
                                        className="gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </div>
                        {selectedNote && (
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    {new Date(selectedNote.createdAt).toLocaleString()}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <FileText className="w-4 h-4" />
                                    {selectedNote.messageCount} messages
                                </div>
                            </div>
                        )}
                    </DialogHeader>
                    
                    <div className="flex-1 min-h-0 mt-4 overflow-y-auto pr-2">
                        <div className="space-y-4 pb-4">
                            {selectedNote?.messages.map((message, index) => (
                                <div
                                    key={message.id || index}
                                    className={cn(
                                        'flex',
                                        message.role === 'user' ? 'justify-end' : 'justify-start'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap shadow-sm',
                                            message.role === 'user'
                                                ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md'
                                                : 'bg-muted/80 backdrop-blur-sm rounded-bl-md border border-border/50'
                                        )}
                                    >
                                        <div className="text-xs opacity-70 mb-1">
                                            {message.role === 'user' ? 'You' : 'AI'}
                                            {message.timestamp && (
                                                <span className="ml-2">
                                                    {new Date(message.timestamp).toLocaleTimeString()}
                                                </span>
                                            )}
                                        </div>
                                        {message.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

