'use client';

import { useSmartBack } from '@/hooks/use-smart-back';
import { TopBar } from '@/components/top-bar';
import { useData } from '@/components/data-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MessageSquare, Search, Plus, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function MessagesPage() {
    const router = useRouter();
    const { data } = useData();

    // Record this page in navigation history for smart back navigation
    useSmartBack({ title: 'Messages' });

    const unreadCount = data.messages.filter(m => m.unread).length;

    return (
        <>
            <TopBar
                title="Messages"
                breadcrumb="All Conversations"
                showNewProject={false}
            >
                <Button onClick={() => toast.info('New message coming soon')} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Message
                </Button>
            </TopBar>

            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-primary/10">
                                    <MessageSquare className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{data.messages.length}</div>
                                    <div className="text-sm text-muted-foreground">Total</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className={unreadCount > 0 ? 'border-primary/50 bg-primary/5' : ''}>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-primary">{unreadCount}</div>
                            <div className="text-sm text-muted-foreground">Unread</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search messages..." className="pl-9" />
                </div>

                {/* Messages List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Conversations</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {data.messages.map(message => {
                                const project = data.projects.find(p => p.id === message.projectId);

                                return (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            'flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-muted/50',
                                            message.unread && 'bg-primary/5'
                                        )}
                                        onClick={() => {
                                            toast.info('Message thread coming soon');
                                        }}
                                    >
                                        {/* Unread indicator */}
                                        <div className={cn(
                                            'w-2 h-2 rounded-full shrink-0',
                                            message.unread ? 'bg-primary' : 'bg-transparent'
                                        )} />

                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                                            {message.from.charAt(0)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className={cn(
                                                    'font-medium truncate',
                                                    message.unread && 'font-semibold'
                                                )}>
                                                    {message.from}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                                                    <Clock className="w-3 h-3" />
                                                    {message.time}
                                                </span>
                                            </div>
                                            <p className={cn(
                                                'text-sm truncate',
                                                message.unread ? 'text-foreground' : 'text-muted-foreground'
                                            )}>
                                                {message.preview}
                                            </p>
                                            {project && (
                                                <div
                                                    className="text-xs text-primary mt-1 hover:underline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/projects/${project.id}`);
                                                    }}
                                                >
                                                    📁 {project.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {data.messages.length === 0 && (
                    <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No messages yet.</p>
                    </div>
                )}
            </div>
        </>
    );
}
