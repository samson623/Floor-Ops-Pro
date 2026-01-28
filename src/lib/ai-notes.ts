'use client';

export interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
}

export interface SavedNote {
    id: string;
    title: string;
    summary: string;
    messages: Message[];
    createdAt: string;
    messageCount: number;
}

const NOTES_STORAGE_KEY = 'floorops-ai-notes';
const CURRENT_CHAT_KEY = 'floorops-ai-current-chat';
const DEMO_SESSION_KEY = 'floorops_demo_session_active';

// Check if currently in demo mode
function isDemoMode(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return localStorage.getItem(DEMO_SESSION_KEY) === 'true';
    } catch {
        return false;
    }
}

// Load saved notes from localStorage (returns empty array in demo mode)
export function loadSavedNotes(): SavedNote[] {
    if (typeof window === 'undefined') return [];
    if (isDemoMode()) return []; // Don't load saved notes in demo mode
    try {
        const stored = localStorage.getItem(NOTES_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Error loading notes:', e);
        return [];
    }
}

// Save notes to localStorage (only if not in demo mode)
export function saveNotes(notes: SavedNote[]): void {
    if (typeof window === 'undefined') return;
    if (isDemoMode()) return; // Don't save in demo mode
    try {
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
        console.error('Error saving notes:', e);
    }
}

// Load current chat from localStorage (returns null in demo mode)
export function loadCurrentChat(): Message[] | null {
    if (typeof window === 'undefined') return null;
    if (isDemoMode()) return null; // Don't load saved chat in demo mode
    try {
        const stored = localStorage.getItem(CURRENT_CHAT_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        console.error('Error loading current chat:', e);
        return null;
    }
}

// Save current chat to localStorage (only if not in demo mode)
export function saveCurrentChat(messages: Message[]): void {
    if (typeof window === 'undefined') return;
    if (isDemoMode()) return; // Don't save in demo mode
    try {
        localStorage.setItem(CURRENT_CHAT_KEY, JSON.stringify(messages));
    } catch (e) {
        console.error('Error saving current chat:', e);
    }
}

// Clear current chat
export function clearCurrentChat(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CURRENT_CHAT_KEY);
}

// Delete a note
export function deleteNote(noteId: string): SavedNote[] {
    const notes = loadSavedNotes();
    const updated = notes.filter(n => n.id !== noteId);
    saveNotes(updated);
    return updated;
}

// Add a new note
export function addNote(note: SavedNote): SavedNote[] {
    const notes = loadSavedNotes();
    const updated = [note, ...notes];
    saveNotes(updated);
    return updated;
}

// Export notes as JSON
export function exportNotesAsJSON(notes: SavedNote[]): void {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `floorops-ai-notes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Export notes as TXT
export function exportNotesAsTXT(notes: SavedNote[]): void {
    let content = 'FloorOps AI Notes Export\n';
    content += '='.repeat(50) + '\n\n';
    
    notes.forEach((note, index) => {
        content += `Note ${index + 1}: ${note.title}\n`;
        content += `Created: ${new Date(note.createdAt).toLocaleString()}\n`;
        content += `Messages: ${note.messageCount}\n`;
        content += `Summary: ${note.summary}\n`;
        content += '-'.repeat(50) + '\n\n';
        
        note.messages.forEach((msg, msgIndex) => {
            const role = msg.role === 'user' ? 'You' : 'AI';
            const timestamp = msg.timestamp 
                ? new Date(msg.timestamp).toLocaleString() 
                : '';
            content += `[${role}${timestamp ? ` - ${timestamp}` : ''}]\n`;
            content += `${msg.content}\n\n`;
        });
        
        content += '\n' + '='.repeat(50) + '\n\n';
    });
    
    const dataBlob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `floorops-ai-notes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Export a single note as JSON
export function exportNoteAsJSON(note: SavedNote): void {
    const dataStr = JSON.stringify(note, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `floorops-note-${note.id}-${new Date(note.createdAt).toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Export a single note as TXT
export function exportNoteAsTXT(note: SavedNote): void {
    let content = `FloorOps AI Note: ${note.title}\n`;
    content += '='.repeat(50) + '\n\n';
    content += `Created: ${new Date(note.createdAt).toLocaleString()}\n`;
    content += `Messages: ${note.messageCount}\n`;
    content += `Summary: ${note.summary}\n`;
    content += '-'.repeat(50) + '\n\n';
    
    note.messages.forEach((msg) => {
        const role = msg.role === 'user' ? 'You' : 'AI';
        const timestamp = msg.timestamp 
            ? new Date(msg.timestamp).toLocaleString() 
            : '';
        content += `[${role}${timestamp ? ` - ${timestamp}` : ''}]\n`;
        content += `${msg.content}\n\n`;
    });
    
    const dataBlob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedTitle = note.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    link.download = `floorops-note-${sanitizedTitle}-${new Date(note.createdAt).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

