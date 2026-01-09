/**
 * Supabase React Hooks
 * ====================
 * Custom hooks for seamless Supabase integration with React.
 * Features:
 * - Automatic loading states
 * - Error handling with toast notifications
 * - Real-time subscription management
 * - Optimistic UI updates
 * - Automatic cleanup on unmount
 * 
 * @author FloorOps Pro Engineering
 * @version 2.0.0
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from './client';
import {
    ProjectsService,
    PunchItemsService,
    DailyLogsService,
    InventoryService,
    PurchaseOrdersService,
    MessagesService,
    NotificationsService,
    syncQueue,
    type ServiceResult,
} from './services';
import type {
    Project,
    PunchItem,
    DailyLog,
    WarehouseInventory,
    PurchaseOrder,
    Message,
    Notification,
} from './types';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ============================================================
// GENERIC ASYNC HOOK
// ============================================================

interface UseAsyncState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    isOffline: boolean;
    refetch: () => Promise<void>;
}

function useAsync<T>(
    asyncFn: () => Promise<ServiceResult<T>>,
    deps: React.DependencyList = []
): UseAsyncState<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isOffline, setIsOffline] = useState(false);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await asyncFn();
            setData(result.data);
            setError(result.error);
            setIsOffline(result.isOffline || false);
        } catch (e) {
            setError(e instanceof Error ? e : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { data, loading, error, isOffline, refetch: fetch };
}

// ============================================================
// SUPABASE STATUS HOOK
// ============================================================

export function useSupabaseStatus() {
    const [isConfigured, setIsConfigured] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [pendingSyncs, setPendingSyncs] = useState(0);

    useEffect(() => {
        setIsConfigured(isSupabaseConfigured());
        setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
        setPendingSyncs(syncQueue.getPendingCount());

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Check pending syncs periodically
        const interval = setInterval(() => {
            setPendingSyncs(syncQueue.getPendingCount());
        }, 5000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    return { isConfigured, isOnline, pendingSyncs };
}

// ============================================================
// PROJECTS HOOKS
// ============================================================

export function useProjects() {
    return useAsync(() => ProjectsService.getAll(), []);
}

export function useProject(id: number | null) {
    return useAsync(
        async () => {
            if (id === null) return { data: null, error: null };
            return ProjectsService.getById(id);
        },
        [id]
    );
}

export function useProjectWithFinancials(id: number | null) {
    return useAsync(
        async () => {
            if (id === null) return { data: null, error: null };
            return ProjectsService.getWithFinancials(id);
        },
        [id]
    );
}

export function useProjectSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const search = useCallback((searchQuery: string) => {
        setQuery(searchQuery);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            const result = await ProjectsService.search(searchQuery);
            setResults(result.data || []);
            setLoading(false);
        }, 300);
    }, []);

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return { query, results, loading, search };
}

// ============================================================
// PUNCH ITEMS HOOKS
// ============================================================

export function usePunchItems(projectId: number | null) {
    return useAsync(
        async () => {
            if (projectId === null) return { data: [], error: null };
            return PunchItemsService.getByProject(projectId);
        },
        [projectId]
    );
}

export function useOpenPunchItems() {
    return useAsync(() => PunchItemsService.getOpen(), []);
}

export function useOverduePunchItems() {
    return useAsync(() => PunchItemsService.getOverdue(), []);
}

// ============================================================
// DAILY LOGS HOOKS
// ============================================================

export function useDailyLogs(projectId: number | null) {
    return useAsync(
        async () => {
            if (projectId === null) return { data: [], error: null };
            return DailyLogsService.getByProject(projectId);
        },
        [projectId]
    );
}

export function useDailyLogsByDateRange(
    projectId: number | null,
    startDate: string,
    endDate: string
) {
    return useAsync(
        async () => {
            if (projectId === null) return { data: [], error: null };
            return DailyLogsService.getByDateRange(projectId, startDate, endDate);
        },
        [projectId, startDate, endDate]
    );
}

// ============================================================
// INVENTORY HOOKS
// ============================================================

export function useInventory() {
    return useAsync(() => InventoryService.getAll(), []);
}

export function useLowStockItems() {
    return useAsync(() => InventoryService.getLowStock(), []);
}

export function useInventoryByCategory(category: string | null) {
    return useAsync(
        async () => {
            if (!category) return { data: [], error: null };
            return InventoryService.getByCategory(category);
        },
        [category]
    );
}

// ============================================================
// PURCHASE ORDERS HOOKS
// ============================================================

export function usePurchaseOrders() {
    return useAsync(() => PurchaseOrdersService.getAll(), []);
}

export function useProjectPurchaseOrders(projectId: number | null) {
    return useAsync(
        async () => {
            if (projectId === null) return { data: [], error: null };
            return PurchaseOrdersService.getByProject(projectId);
        },
        [projectId]
    );
}

// ============================================================
// MESSAGES HOOKS (with Real-time)
// ============================================================

export function useProjectMessages(projectId: number | null) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (projectId === null) {
            setMessages([]);
            setLoading(false);
            return;
        }

        // Initial fetch
        const fetchMessages = async () => {
            setLoading(true);
            const result = await MessagesService.getByProject(projectId);
            setMessages(result.data || []);
            setError(result.error);
            setLoading(false);
        };

        fetchMessages();

        // Subscribe to real-time updates
        channelRef.current = MessagesService.subscribeToProject(projectId, (payload) => {
            if (payload.new) {
                setMessages((prev) => [...prev, payload.new as Message]);
            }
        });

        return () => {
            if (channelRef.current) {
                channelRef.current.unsubscribe();
            }
        };
    }, [projectId]);

    const sendMessage = useCallback(
        async (content: string, senderName: string) => {
            if (projectId === null) return;

            // Optimistic update
            const tempMessage: Message = {
                id: Date.now(),
                project_id: projectId,
                content,
                sender_name: senderName,
                sender_id: null,
                sender_role: 'pm',
                type: 'text',
                thread_id: null,
                reply_count: 0,
                mentions: null,
                created_at: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, tempMessage]);

            const result = await MessagesService.send({
                project_id: projectId,
                content,
                sender_name: senderName,
                sender_role: 'pm',
                type: 'text',
            });

            if (result.error) {
                // Rollback on error
                setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
                setError(result.error);
            }
        },
        [projectId]
    );

    return { messages, loading, error, sendMessage };
}

// ============================================================
// NOTIFICATIONS HOOKS (with Real-time)
// ============================================================

export function useNotifications(userId: string | null) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (!userId) {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        const fetchNotifications = async () => {
            setLoading(true);
            const [notifResult, countResult] = await Promise.all([
                NotificationsService.getForUser(userId),
                NotificationsService.getUnreadCount(userId),
            ]);
            setNotifications(notifResult.data || []);
            setUnreadCount(countResult.data || 0);
            setLoading(false);
        };

        fetchNotifications();

        // Subscribe to new notifications
        channelRef.current = NotificationsService.subscribeToNotifications(userId, (payload) => {
            if (payload.new) {
                setNotifications((prev) => [payload.new as Notification, ...prev]);
                setUnreadCount((prev) => prev + 1);
            }
        });

        return () => {
            if (channelRef.current) {
                channelRef.current.unsubscribe();
            }
        };
    }, [userId]);

    const markAsRead = useCallback(async (id: string) => {
        await NotificationsService.markAsRead(id);
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    }, []);

    const markAllAsRead = useCallback(async () => {
        if (!userId) return;
        await NotificationsService.markAllAsRead(userId);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
    }, [userId]);

    return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}

// ============================================================
// AUTH HOOKS
// ============================================================

interface User {
    id: string;
    email: string;
    user_metadata?: {
        full_name?: string;
        avatar_url?: string;
    };
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const client = getSupabaseClient();
        if (!client) {
            setLoading(false);
            return;
        }

        // Get initial session
        client.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user as User | null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = client.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user as User | null);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        const client = getSupabaseClient();
        if (!client) return { error: new Error('Supabase not configured') };

        const { error } = await client.auth.signInWithPassword({ email, password });
        return { error: error ? new Error(error.message) : null };
    }, []);

    const signOut = useCallback(async () => {
        const client = getSupabaseClient();
        if (!client) return;

        await client.auth.signOut();
        setUser(null);
    }, []);

    const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, unknown>) => {
        const client = getSupabaseClient();
        if (!client) return { error: new Error('Supabase not configured') };

        const { error } = await client.auth.signUp({
            email,
            password,
            options: { data: metadata },
        });
        return { error: error ? new Error(error.message) : null };
    }, []);

    return { user, loading, signIn, signOut, signUp };
}

// ============================================================
// MUTATION HOOKS
// ============================================================

export function useMutation<TData, TVariables>(
    mutationFn: (variables: TVariables) => Promise<ServiceResult<TData>>
) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<TData | null>(null);

    const mutate = useCallback(
        async (variables: TVariables): Promise<ServiceResult<TData>> => {
            setLoading(true);
            setError(null);

            try {
                const result = await mutationFn(variables);
                setData(result.data);
                setError(result.error);
                setLoading(false);
                return result;
            } catch (e) {
                const err = e instanceof Error ? e : new Error('Unknown error');
                setError(err);
                setLoading(false);
                return { data: null, error: err };
            }
        },
        [mutationFn]
    );

    const reset = useCallback(() => {
        setLoading(false);
        setError(null);
        setData(null);
    }, []);

    return { mutate, loading, error, data, reset };
}

// Pre-configured mutation hooks
export function useCreateProject() {
    return useMutation(ProjectsService.create);
}

export function useUpdateProject() {
    return useMutation(
        ({ id, updates }: { id: number; updates: Parameters<typeof ProjectsService.update>[1] }) =>
            ProjectsService.update(id, updates)
    );
}

export function useCreatePunchItem() {
    return useMutation(PunchItemsService.create);
}

export function useUpdatePunchItem() {
    return useMutation(
        ({ id, updates }: { id: number; updates: Parameters<typeof PunchItemsService.update>[1] }) =>
            PunchItemsService.update(id, updates)
    );
}

export function useCompletePunchItem() {
    return useMutation(
        ({ id, completedBy }: { id: number; completedBy: string }) =>
            PunchItemsService.complete(id, completedBy)
    );
}

export function useCreateDailyLog() {
    return useMutation(DailyLogsService.create);
}

export function useSubmitDailyLog() {
    return useMutation((id: string) => DailyLogsService.submit(id));
}

export function useCreatePurchaseOrder() {
    return useMutation(PurchaseOrdersService.create);
}

export function useAdjustInventory() {
    return useMutation(
        ({ id, adjustment, reason }: { id: string; adjustment: number; reason: string }) =>
            InventoryService.adjustQuantity(id, adjustment, reason)
    );
}
