'use client';

import { useState } from 'react';
import { usePermissions } from '@/components/permission-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Only show AI panel if user has permission
    if (!can('USE_AI_ASSISTANT')) {
        return null;
    }

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now(),
            role: 'user',
            content: input
        };

        // Simulate AI response
        const aiResponses: Record<string, string> = {
            'downtown status': '📊 **Downtown Lobby Renovation**\n\n✅ Progress: 65%\n📋 Open Punch Items: 3\n💰 Margin: 37%\n📅 Due: Dec 20\n\nCurrent Phase: Tile Installation\nNext Up: Carpet Install (Dec 16)',
            'open punch list': '🔧 **Open Punch Items (4 total)**\n\n**High Priority:**\n• Grout color mismatch near elevator (Downtown - Dec 13)\n• Transition strip loose at hallway (Downtown - Dec 14)\n• Verify moisture levels in exam room (Oakridge - Dec 14)\n\n**Medium Priority:**\n• Minor chip on tile near entrance (Downtown - Dec 15)',
            'schedule today': '📅 **Today\'s Schedule**\n\n• 7:00 AM - Downtown Tile Install (Team A)\n• 8:00 AM - Oakridge Subfloor Prep (Team B)\n• 2:00 PM - Downtown Client Walk (Derek + PM)\n• 4:00 PM - Lakeside Material Delivery',
        };

        const responseKey = Object.keys(aiResponses).find(key =>
            input.toLowerCase().includes(key)
        );

        const aiMessage: Message = {
            id: Date.now() + 1,
            role: 'assistant',
            content: responseKey
                ? aiResponses[responseKey]
                : `I understand you're asking about "${input}". In a production app, this would connect to an AI service. For now, try:\n\n• "downtown status"\n• "open punch list"\n• "schedule today"`
        };

        setMessages(prev => [...prev, userMessage, aiMessage]);
        setInput('');
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
