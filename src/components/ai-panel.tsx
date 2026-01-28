'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePermissions } from '@/components/permission-context';
import { useData } from '@/components/data-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Bot, Send, Mic, MicOff, Plus, FolderOpen, FileText, Sparkles, Trash2, Clock, ChevronDown, Check, X, Archive, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildAIContext } from '@/lib/ai-context';
import { 
    Message, 
    SavedNote, 
    loadSavedNotes, 
    saveNotes, 
    loadCurrentChat, 
    saveCurrentChat, 
    clearCurrentChat,
    deleteNote as deleteNoteUtil,
    addNote
} from '@/lib/ai-notes';
import { useRouter } from 'next/navigation';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

const initialMessages: Message[] = [
    {
        id: 1,
        role: 'assistant',
        content: 'Hey Derek! I can help with project status, scheduling, punch lists, and more. Try "Downtown status" or "open punch list".',
        timestamp: new Date().toISOString()
    }
];

// Helper to format relative time
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function AIPanel() {
    const { can } = usePermissions();
    const { data } = useData();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
    const [showNotes, setShowNotes] = useState(false);
    const [showSummarizeConfirm, setShowSummarizeConfirm] = useState(false);
    const [pendingSummary, setPendingSummary] = useState<{ title: string; summary: string } | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [showNewChatConfirm, setShowNewChatConfirm] = useState(false);
    
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const isStoppingRef = useRef(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Load saved notes and current chat from localStorage
    useEffect(() => {
        const notes = loadSavedNotes();
        setSavedNotes(notes);
        const currentChat = loadCurrentChat();
        if (currentChat && currentChat.length > 1) {
            setMessages(currentChat);
        }
    }, []);

    // Save current chat to localStorage
    useEffect(() => {
        if (messages.length > 1) {
            saveCurrentChat(messages);
        }
    }, [messages]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    // Refresh notes when panel opens
    useEffect(() => {
        if (isOpen) {
            setSavedNotes(loadSavedNotes());
        }
    }, [isOpen]);

    // Force stop any active recording
    const forceStopRecording = useCallback(() => {
        isStoppingRef.current = true;
        if (recognitionRef.current) {
            try {
                recognitionRef.current.abort();
            } catch (e) {
                // Ignore errors during abort
            }
            recognitionRef.current = null;
        }
        setIsListening(false);
        setTimeout(() => {
            isStoppingRef.current = false;
        }, 100);
    }, []);

    // Create a new speech recognition instance
    const createRecognitionInstance = useCallback(() => {
        if (typeof window === 'undefined') return null;

        const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionApi) return null;

        const recognition = new SpeechRecognitionApi();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            if (isStoppingRef.current) return;

            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                }
            }

            if (finalTranscript) {
                setInput(prev => prev + finalTranscript);
            }
        };

        recognition.onstart = () => {
            if (!isStoppingRef.current) {
                setIsListening(true);
            }
        };

        recognition.onend = () => {
            if (!isStoppingRef.current) {
                setIsListening(false);
            }
            recognitionRef.current = null;
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            const errorType = event.error || 'unknown';
            const errorMessage = event.message || 'Speech recognition failed';
            
            if (errorType !== 'no-speech') {
                console.error('Speech recognition error:', {
                    error: errorType,
                    message: errorMessage,
                    type: event.type
                });
            }
            
            setIsListening(false);
            recognitionRef.current = null;
        };

        return recognition;
    }, []);

    // Initialize speech recognition support check
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognitionApi) {
                setSpeechSupported(true);
            }
        }

        return () => {
            forceStopRecording();
        };
    }, [forceStopRecording]);

    // Toggle voice recording
    const toggleListening = useCallback(() => {
        if (isStoppingRef.current) return;

        if (isListening) {
            forceStopRecording();
        } else {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {
                    // Ignore
                }
                recognitionRef.current = null;
            }

            const recognition = createRecognitionInstance();
            if (!recognition) return;

            try {
                recognitionRef.current = recognition;
                recognition.start();
            } catch (error) {
                console.error('Speech recognition start error:', {
                    error: error instanceof Error ? error.message : String(error),
                    name: error instanceof Error ? error.name : 'Unknown'
                });
                setIsListening(false);
                recognitionRef.current = null;
            }
        }
    }, [isListening, createRecognitionInstance, forceStopRecording]);

    // Only show AI panel if user has permission
    if (!can('USE_AI_ASSISTANT')) {
        return null;
    }

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now(),
            role: 'user',
            content: input,
            timestamp: new Date().toISOString()
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    projectContext: buildAIContext(data)
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from AI');
            }

            const responseData = await response.json();

            const aiMessage: Message = {
                id: Date.now() + 1,
                role: 'assistant',
                content: responseData.content,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('AI Error:', error);
            const errorMessage: Message = {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Sorry, I encountered an error connecting to the AI service. Please check your API key and try again.',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Start a new chat
    const handleNewChat = (confirmed: boolean = false) => {
        if (messages.length > 2 && !confirmed) {
            setShowNewChatConfirm(true);
            return;
        }
        setMessages(initialMessages);
        clearCurrentChat();
        setShowNewChatConfirm(false);
    };

    // Summarize and file the current chat
    const handleSummarizeAndFile = async () => {
        if (messages.length < 3) return;
        
        setIsSummarizing(true);
        setShowSummarizeConfirm(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        ...messages.map(m => ({
                            role: m.role,
                            content: m.content
                        })),
                        {
                            role: 'user',
                            content: `Please create a brief summary of our conversation above. Format your response EXACTLY like this (use these exact labels):

TITLE: [A short 3-6 word title for this conversation]
SUMMARY: [2-3 sentences summarizing the key points, decisions, and action items from our conversation]

Be specific and actionable. Focus on what was discussed and any conclusions reached.`
                        }
                    ],
                    projectContext: null // Don't need full context for summary
                }),
            });

            if (!response.ok) throw new Error('Failed to summarize');

            const responseData = await response.json();
            const content = responseData.content || '';
            
            // Parse the title and summary
            const titleMatch = content.match(/TITLE:\s*(.+?)(?:\n|SUMMARY:)/i);
            const summaryMatch = content.match(/SUMMARY:\s*(.+)/is);
            
            const title = titleMatch ? titleMatch[1].trim() : 'Chat Summary';
            const summary = summaryMatch ? summaryMatch[1].trim() : content;

            setPendingSummary({ title, summary });
        } catch (error) {
            console.error('Summarization error:', error);
            setPendingSummary({ 
                title: 'Chat Summary', 
                summary: 'Error generating summary. You can still save this note with a manual title.' 
            });
        } finally {
            setIsSummarizing(false);
        }
    };

    // Confirm and save the summary
    const confirmSaveSummary = () => {
        if (!pendingSummary) return;

        const newNote: SavedNote = {
            id: `note-${Date.now()}`,
            title: pendingSummary.title,
            summary: pendingSummary.summary,
            messages: [...messages],
            createdAt: new Date().toISOString(),
            messageCount: messages.length
        };

        const updatedNotes = addNote(newNote);
        setSavedNotes(updatedNotes);
        
        // Reset state
        setPendingSummary(null);
        setShowSummarizeConfirm(false);
        
        // Start fresh chat
        handleNewChat(true);
    };

    // Load a saved note
    const loadNote = (note: SavedNote) => {
        setMessages(note.messages);
        setShowNotes(false);
    };

    // Delete a saved note
    const deleteNote = (noteId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updatedNotes = deleteNoteUtil(noteId);
        setSavedNotes(updatedNotes);
    };

    return (
        <>
            {/* Floating AI Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button
                        size="icon"
                        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-110 group"
                    >
                        <Bot className="h-6 w-6 transition-transform group-hover:scale-110" />
                        {/* Pulse ring animation */}
                        <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-75" style={{ animationDuration: '2s' }} />
                    </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:w-[440px] p-0 flex flex-col h-full border-l-2 border-primary/20">
                    {/* Header */}
                    <SheetHeader className="p-4 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shrink-0">
                        <div className="flex items-center justify-between">
                            <SheetTitle className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-lg">FloorOps AI</span>
                            </SheetTitle>
                            
                            <div className="flex items-center gap-1">
                                {/* Notes Button */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-9 px-3 gap-1.5 transition-all",
                                        showNotes && "bg-primary/10 text-primary"
                                    )}
                                    onClick={() => setShowNotes(!showNotes)}
                                >
                                    <FolderOpen className="w-4 h-4" />
                                    <span className="text-xs font-medium">Notes</span>
                                    {savedNotes.length > 0 && (
                                        <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-primary/20 text-primary rounded-full">
                                            {savedNotes.length}
                                        </span>
                                    )}
                                    <ChevronDown className={cn("w-3 h-3 transition-transform", showNotes && "rotate-180")} />
                                </Button>

                                {/* New Chat Button */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 px-3 gap-1.5 hover:bg-primary/10 hover:text-primary transition-all"
                                    onClick={() => handleNewChat()}
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="text-xs font-medium">New</span>
                                </Button>
                            </div>
                        </div>

                        {/* Notes Dropdown */}
                        {showNotes && (
                            <div className="mt-3 -mx-1 animate-in slide-in-from-top-2 duration-200">
                                <div className="bg-card border rounded-xl shadow-lg max-h-64 overflow-y-auto">
                                    {savedNotes.length === 0 ? (
                                        <div className="p-6 text-center text-muted-foreground">
                                            <Archive className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm font-medium">No saved notes yet</p>
                                            <p className="text-xs mt-1">Use &quot;Summarize &amp; File&quot; to save conversations</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-2 border-b">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full justify-start gap-2 text-xs"
                                                    onClick={() => {
                                                        setShowNotes(false);
                                                        router.push('/notes');
                                                    }}
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    View All Notes
                                                </Button>
                                            </div>
                                            <div className="divide-y max-h-48 overflow-y-auto">
                                                {savedNotes.slice(0, 5).map((note) => (
                                                    <button
                                                        key={note.id}
                                                        onClick={() => loadNote(note)}
                                                        className="w-full p-3 text-left hover:bg-muted/50 transition-colors group"
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="w-4 h-4 text-primary shrink-0" />
                                                                    <span className="font-medium text-sm truncate">{note.title}</span>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{note.summary}</p>
                                                                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                                                                    <Clock className="w-3 h-3" />
                                                                    {formatRelativeTime(note.createdAt)}
                                                                    <span>•</span>
                                                                    <span>{note.messageCount} messages</span>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:bg-destructive/10 hover:text-destructive"
                                                                onClick={(e) => deleteNote(note.id, e)}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* New Chat Confirmation */}
                        {showNewChatConfirm && (
                            <div className="mt-3 p-3 bg-warning/10 border border-warning/30 rounded-xl animate-in slide-in-from-top-2 duration-200">
                                <p className="text-sm font-medium text-warning-foreground">Start a new chat?</p>
                                <p className="text-xs text-muted-foreground mt-1">Your current conversation will be cleared. Consider saving it first!</p>
                                <div className="flex gap-2 mt-3">
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="h-8 text-xs"
                                        onClick={() => setShowNewChatConfirm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs gap-1"
                                        onClick={handleSummarizeAndFile}
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        Save First
                                    </Button>
                                    <Button 
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => handleNewChat(true)}
                                    >
                                        Clear Anyway
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Summarize Confirmation */}
                        {showSummarizeConfirm && (
                            <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-xl animate-in slide-in-from-top-2 duration-200">
                                {isSummarizing ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm font-medium">Generating summary...</span>
                                    </div>
                                ) : pendingSummary ? (
                                    <>
                                        <div className="flex items-start gap-2">
                                            <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-primary">{pendingSummary.title}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{pendingSummary.summary}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <Button 
                                                size="sm" 
                                                variant="ghost"
                                                className="h-8 text-xs"
                                                onClick={() => {
                                                    setShowSummarizeConfirm(false);
                                                    setPendingSummary(null);
                                                }}
                                            >
                                                <X className="w-3 h-3 mr-1" />
                                                Cancel
                                            </Button>
                                            <Button 
                                                size="sm"
                                                className="h-8 text-xs gap-1"
                                                onClick={confirmSaveSummary}
                                            >
                                                <Check className="w-3 h-3" />
                                                Save &amp; Start New Chat
                                            </Button>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        )}
                    </SheetHeader>

                    {/* Messages - Fixed scrolling */}
                    <div 
                        ref={scrollContainerRef}
                        className="flex-1 overflow-y-auto p-4 min-h-0"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        <div className="space-y-4 pb-2">
                            {messages.map((message, index) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        'flex animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
                                        message.role === 'user' ? 'justify-end' : 'justify-start'
                                    )}
                                    style={{ animationDelay: `${Math.min(index * 50, 200)}ms` }}
                                >
                                    <div
                                        className={cn(
                                            'max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap shadow-sm',
                                            message.role === 'user'
                                                ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md'
                                                : 'bg-muted/80 backdrop-blur-sm rounded-bl-md border border-border/50'
                                        )}
                                    >
                                        {message.content}
                                    </div>
                                </div>
                            ))}
                            
                            {/* Loading indicator */}
                            {isLoading && (
                                <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                                    <div className="bg-muted/80 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-3 border border-border/50">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                            <span className="text-xs text-muted-foreground">Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Scroll anchor */}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t bg-gradient-to-t from-background via-background to-background/80 backdrop-blur shrink-0">
                        {/* Summarize & File Button - only show if there's a real conversation */}
                        {messages.length >= 3 && !showSummarizeConfirm && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full mb-3 h-9 gap-2 text-xs font-medium border-dashed hover:border-primary hover:bg-primary/5 hover:text-primary transition-all group"
                                onClick={handleSummarizeAndFile}
                            >
                                <Sparkles className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                                Summarize &amp; File This Chat
                            </Button>
                        )}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="flex gap-2"
                        >
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask me anything..."
                                className="flex-1 h-11 rounded-xl border-2 focus:border-primary/50 transition-colors"
                                disabled={isLoading}
                            />
                            {speechSupported && (
                                <Button
                                    type="button"
                                    size="icon"
                                    variant={isListening ? 'destructive' : 'outline'}
                                    className={cn(
                                        'shrink-0 h-11 w-11 rounded-xl transition-all duration-200',
                                        isListening && 'animate-pulse ring-2 ring-red-400 ring-offset-2'
                                    )}
                                    onClick={toggleListening}
                                    title={isListening ? 'Stop listening' : 'Start voice input'}
                                    disabled={isLoading}
                                >
                                    {isListening ? (
                                        <MicOff className="h-4 w-4" />
                                    ) : (
                                        <Mic className="h-4 w-4" />
                                    )}
                                </Button>
                            )}
                            <Button 
                                type="submit" 
                                size="icon" 
                                className="shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all"
                                disabled={isLoading || !input.trim()}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
