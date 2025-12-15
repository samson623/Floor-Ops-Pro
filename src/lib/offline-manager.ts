'use client';

/**
 * Offline Manager for FloorOps Pro Field Production Tools
 * Handles offline detection, local queuing, and sync when online
 */

import { OfflineQueueItem } from './data';

// Check if we're online
export function isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
}

// Generate unique ID for queue items
export function generateQueueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create a queue item for offline storage
export function createQueueItem(
    action: OfflineQueueItem['action'],
    entity: OfflineQueueItem['entity'],
    projectId: number,
    payload: unknown
): OfflineQueueItem {
    return {
        id: generateQueueId(),
        action,
        entity,
        projectId,
        payload,
        timestamp: new Date().toISOString(),
        synced: false,
    };
}

// Get pending items from queue
export function getPendingItems(queue: OfflineQueueItem[]): OfflineQueueItem[] {
    return queue.filter(item => !item.synced);
}

// Mark items as synced
export function markAsSynced(queue: OfflineQueueItem[], ids: string[]): OfflineQueueItem[] {
    return queue.map(item =>
        ids.includes(item.id) ? { ...item, synced: true } : item
    );
}

// Clean up old synced items (keep last 50)
export function cleanupQueue(queue: OfflineQueueItem[]): OfflineQueueItem[] {
    const synced = queue.filter(item => item.synced);
    const pending = queue.filter(item => !item.synced);

    // Keep only the last 50 synced items
    const recentSynced = synced.slice(-50);

    return [...pending, ...recentSynced];
}

// Hook for online/offline status
export function useOnlineStatus(): boolean {
    if (typeof window === 'undefined') return true;

    // This is a simple implementation - in production you'd use useEffect with event listeners
    return navigator.onLine;
}

// Offline indicator component helper
export function getOfflineIndicator(isOnline: boolean): { text: string; color: string; icon: string } {
    if (isOnline) {
        return {
            text: 'Online',
            color: 'text-success',
            icon: '🟢'
        };
    }
    return {
        text: 'Offline - Changes will sync when connected',
        color: 'text-warning',
        icon: '🟡'
    };
}
