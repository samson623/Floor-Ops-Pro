'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePermissions } from '@/components/permission-context';
import { useData } from '@/components/data-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, Mic, MicOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildAIContext } from '@/lib/ai-context';

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

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
}

const initialMessages: Message[] = [
    {
        id: 1,
        role: 'assistant',
        content: 'Hey Derek! I can help with project status, scheduling, punch lists, and more. Try "Downtown status" or "open punch list".'
    }
];

export function AIPanel() {
    const { can } = usePermissions();
    const { data } = useData();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const isStoppingRef = useRef(false);

    // Force stop any active recording
    const forceStopRecording = useCallback(() => {
        isStoppingRef.current = true;
        if (recognitionRef.current) {
            try {
                recognitionRef.current.abort(); // abort() is more forceful than stop()
            } catch (e) {
                // Ignore errors during abort
            }
            recognitionRef.current = null;
        }
        setIsListening(false);
        // Reset stopping flag after a short delay
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
            // Don't process results if we're stopping
            if (isStoppingRef.current) return;

            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                }
            }

            // Update input with transcribed text
            if (finalTranscript) {
                setInput(prev => prev + finalTranscript);
            }
        };

        recognition.onstart = () => {
            // Only set listening if we're not in stopping mode
            if (!isStoppingRef.current) {
                setIsListening(true);
            }
        };

        recognition.onend = () => {
            // Only update state if this wasn't a forced stop
            if (!isStoppingRef.current) {
                setIsListening(false);
            }
            recognitionRef.current = null;
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            // Extract error details from the event
            const errorType = event.error || 'unknown';
            const errorMessage = event.message || 'Speech recognition failed';
            
            // Only log non-benign errors (ignore 'no-speech' which is common)
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
        // Prevent rapid toggling
        if (isStoppingRef.current) return;

        if (isListening) {
            // Force stop recording
            forceStopRecording();
        } else {
            // Make sure any previous instance is fully cleaned up
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {
                    // Ignore
                }
                recognitionRef.current = null;
            }

            // Create a fresh recognition instance
            const recognition = createRecognitionInstance();
            if (!recognition) return;

            try {
                recognitionRef.current = recognition;
                recognition.start();
                // Note: setIsListening(true) is now handled in onstart
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

    const [isLoading, setIsLoading] = useState(false);

    // Only show AI panel if user has permission
    if (!can('USE_AI_ASSISTANT')) {
        return null;
    }

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now(),
            role: 'user',
            content: input
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
                content: responseData.content
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('AI Error:', error);
            const errorMessage: Message = {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Sorry, I encountered an error connecting to the AI service. Please check your API key and try again.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating AI Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button
                        size="icon"
                        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-110"
                    >
                        <Bot className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:w-[400px] p-0 flex flex-col">
                    <SheetHeader className="p-4 border-b bg-gradient-to-r from-primary/10 to-transparent">
                        <SheetTitle className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                                <Bot className="w-4 h-4" />
                            </div>
                            FloorOps AI
                        </SheetTitle>
                    </SheetHeader>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        'flex',
                                        message.role === 'user' ? 'justify-end' : 'justify-start'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap',
                                            message.role === 'user'
                                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                                : 'bg-muted rounded-bl-md'
                                        )}
                                    >
                                        {message.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-4 border-t bg-background/95 backdrop-blur">
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
                                className="flex-1"
                            />
                            {speechSupported && (
                                <Button
                                    type="button"
                                    size="icon"
                                    variant={isListening ? 'destructive' : 'outline'}
                                    className={cn(
                                        'shrink-0 transition-all duration-200',
                                        isListening && 'animate-pulse ring-2 ring-red-400 ring-offset-2'
                                    )}
                                    onClick={toggleListening}
                                    title={isListening ? 'Stop listening' : 'Start voice input'}
                                >
                                    {isListening ? (
                                        <MicOff className="h-4 w-4" />
                                    ) : (
                                        <Mic className="h-4 w-4" />
                                    )}
                                </Button>
                            )}
                            <Button type="submit" size="icon" className="shrink-0">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
