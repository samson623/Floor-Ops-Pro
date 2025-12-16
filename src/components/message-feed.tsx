'use client';

import { useState, useRef, useEffect } from 'react';
import { useData } from '@/components/data-provider';
import { usePermissions } from '@/components/permission-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, Hash, AtSign, Paperclip, Sparkles, Lock } from 'lucide-react';
import { Message } from '@/lib/data';
import { format } from 'date-fns';

interface MessageFeedProps {
    projectId: number;
    currentUser?: string; // For demo purposes
}

export function MessageFeed({ projectId, currentUser = 'Samson (PM)' }: MessageFeedProps) {
    const { getProjectMessages, sendMessage, getTeamMembers } = useData();
    const { can, canAny } = usePermissions();
    const [newMessage, setNewMessage] = useState('');
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Permission checks
    const canViewMessages = canAny(['VIEW_ALL_MESSAGES', 'VIEW_PROJECT_MESSAGES']);
    const canSendMessages = can('SEND_MESSAGES');

    // Sort logic might be in data-provider, but let's ensure it here
    const messages = getProjectMessages(projectId).sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const teamMembers = getTeamMembers();

    const handleSend = () => {
        if (!newMessage.trim()) return;

        // Extract mentions
        const mentions = newMessage.match(/@(\w+)/g)?.map(m => m.substring(1)) || [];

        sendMessage({
            projectId,
            from: currentUser,
            content: newMessage,
            type: 'text',
            senderRole: 'pm',
            mentions,
            preview: newMessage.slice(0, 50)
        });
        setNewMessage('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages.length]);

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = new Date(message.timestamp).toLocaleDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {} as Record<string, Message[]>);

    return (
        <Card className="flex flex-col h-[600px] border-none shadow-none rounded-none w-full">
            <CardHeader className="px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Hash className="w-4 h-4 text-muted-foreground" /> Project Feed
                        </CardTitle>
                        <CardDescription>Team communication & updates</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        {/* Placeholder for filters or settings */}
                    </div>
                </div>
            </CardHeader>
            <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
                <div className="space-y-6">
                    {Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date} className="space-y-4">
                            <div className="relative flex items-center justify-center">
                                <Separator className="absolute w-full" />
                                <span className="relative bg-background px-2 text-xs text-muted-foreground">
                                    {date === new Date().toLocaleDateString() ? 'Today' : date}
                                </span>
                            </div>
                            {msgs.map((msg) => {
                                const isMe = msg.from === currentUser;
                                return (
                                    <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                        <Avatar className="w-8 h-8 mt-1">
                                            <AvatarFallback className={isMe ? 'bg-primary text-primary-foreground' : ''}>
                                                {msg.from.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-semibold">{msg.from}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(msg.timestamp), 'h:mm a')}
                                                </span>
                                            </div>
                                            <div
                                                className={`px-3 py-2 rounded-lg text-sm ${isMe
                                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                    : 'bg-muted rounded-tl-none'
                                                    } ${msg.type === 'system' ? 'bg-secondary italic' : ''}`}
                                            >
                                                {msg.content}
                                            </div>
                                            {msg.mentions && msg.mentions.length > 0 && (
                                                <div className="flex gap-1 mt-1">
                                                    {msg.mentions.map(m => (
                                                        <Badge key={m} variant="outline" className="text-[10px] h-5">
                                                            @{m}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-4 border-t bg-background">
                {!canSendMessages ? (
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-dashed">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                            Read-only access. Contact your administrator to send messages.
                        </span>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="shrink-0" title="Attach File">
                            <Paperclip className="w-4 h-4" />
                        </Button>
                        <div className="flex-1 relative">
                            <Textarea
                                placeholder="Type a message... Use @ to mention"
                                className="min-h-[40px] max-h-[120px] resize-none pr-12"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <Button
                                className="absolute right-1 bottom-1 h-8 w-8"
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                    // Trigger AI or client update generator
                                }}
                                title="Generate Update"
                            >
                                <Sparkles className="w-4 h-4 text-amber-500" />
                            </Button>
                        </div>
                        <Button onClick={handleSend} size="icon" className="shrink-0">
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
}
