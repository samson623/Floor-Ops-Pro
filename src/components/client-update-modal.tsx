'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/components/data-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DailyLog } from '@/lib/data';
import { format } from 'date-fns';
import { Wand2, Send, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ClientUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: number;
}

export function ClientUpdateModal({ isOpen, onClose, projectId }: ClientUpdateModalProps) {
    const { getProject, sendMessage } = useData();
    const [selectedLogs, setSelectedLogs] = useState<number[]>([]);
    const [generatedUpdate, setGeneratedUpdate] = useState('');
    const [tone, setTone] = useState<'professional' | 'casual' | 'brief'>('professional');
    const [isGenerating, setIsGenerating] = useState(false);

    const project = getProject(projectId);

    // Get logs for this project, sorted recent first
    const logs = (project?.dailyLogs || []).sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const handleGenerate = () => {
        setIsGenerating(true);
        // Simulate AI generation
        setTimeout(() => {
            const selectedLogItems = logs.filter(l => selectedLogs.includes(l.id));

            if (selectedLogItems.length === 0) {
                toast.error("Please select at least one log entry.");
                setIsGenerating(false);
                return;
            }

            let text = `Subject: Project Update - ${project?.name || 'Project'}\n\n`;
            text += `Dear ${project?.client || 'Client'},\n\n`;
            text += `Here is a summary of the progress made recently:\n\n`;

            selectedLogItems.forEach(log => {
                text += `• ${format(new Date(log.date), 'MM/dd')}: ${log.notes}\n`;
            });

            text += `\nHigh Level Summary:\n`;
            text += `The team has successfully moved through the recent phases. We are on track and looking forward to the next steps.\n\n`;

            if (tone === 'brief') {
                text = `Quick update on ${project?.name}:\n\n`;
                selectedLogItems.forEach(log => {
                    text += `- ${log.notes} (${format(new Date(log.date), 'MM/dd')})\n`;
                });
                text += `\nBest,\nFloor Ops Pro Team`;
            } else if (tone === 'casual') {
                text = `Hi there,\n\nJust wanted to share some quick wins from the ${project?.name} job site!\n\n`;
                selectedLogItems.forEach(log => {
                    text += `We tackled: ${log.notes} on ${format(new Date(log.date), 'MMM do')}.\n`;
                });
                text += `\nThings are looking great! Let us know if you have questions.\n\nCheers,\nFloor Ops Pro Team`;
            } else {
                text += `Best regards,\n\nFloor Ops Pro Team`;
            }

            setGeneratedUpdate(text);
            setIsGenerating(false);
            toast.success("Draft generated!");
        }, 1500);
    };

    const handleSend = () => {
        sendMessage({
            projectId,
            from: 'System (Client Update)',
            content: generatedUpdate,
            type: 'update',
            senderRole: 'system',
            preview: 'Client Update Sent'
        });
        toast.success("Update sent to client!");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Generate Client Update</DialogTitle>
                    <DialogDescription>
                        Select daily logs to summarize into a professional client update.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-1 gap-6 overflow-hidden pt-4">
                    {/* Left retrieval column */}
                    <div className="w-1/3 flex flex-col gap-4 border-r pr-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">Daily LogsSource</Label>
                            <Badge variant="outline">{logs.length} entries</Badge>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="space-y-3">
                                {logs.length === 0 ? (
                                    <div className="text-sm text-muted-foreground italic p-2">No logs found for this project.</div>
                                ) : logs.map(log => (
                                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded-md bg-card hover:bg-accent/50 transition cursor-pointer" onClick={() => {
                                        setSelectedLogs(prev => prev.includes(log.id) ? prev.filter(id => id !== log.id) : [...prev, log.id]);
                                    }}>
                                        <Checkbox
                                            id={`log-${log.id}`}
                                            checked={selectedLogs.includes(log.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedLogs(prev => [...prev, log.id]);
                                                else setSelectedLogs(prev => prev.filter(id => id !== log.id));
                                            }}
                                        />
                                        <div className="grid gap-1">
                                            <Label htmlFor={`log-${log.id}`} className="font-medium cursor-pointer">
                                                {format(new Date(log.date), 'MMM dd, yyyy')}
                                            </Label>
                                            <p className="text-xs text-muted-foreground line-clamp-3">
                                                {log.notes}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right generation column */}
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Label>Tone:</Label>
                                <div className="flex border rounded-lg p-1 bg-muted/50">
                                    {(['professional', 'casual', 'brief'] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTone(t)}
                                            className={`px-3 py-1 text-xs rounded-md transition-all ${tone === t ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Button onClick={handleGenerate} disabled={selectedLogs.length === 0 || isGenerating} size="sm">
                                {isGenerating ? <div className="animate-spin mr-2">⏳</div> : <Wand2 className="w-4 h-4 mr-2" />}
                                {isGenerating ? 'Drafting...' : 'Generate Draft'}
                            </Button>
                        </div>

                        <div className="flex-1 flex flex-col relative">
                            <Textarea
                                className="flex-1 font-mono text-sm resize-none p-4 leading-relaxed"
                                placeholder="Generated update will appear here..."
                                value={generatedUpdate}
                                onChange={(e) => setGeneratedUpdate(e.target.value)}
                            />
                            {generatedUpdate && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 h-8 w-8"
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatedUpdate);
                                        toast.success("Copied to clipboard");
                                    }}
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSend} disabled={!generatedUpdate} className="gap-2">
                        <Send className="w-4 h-4" /> Send Update
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
