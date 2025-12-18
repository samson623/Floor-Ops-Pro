'use client';

// ══════════════════════════════════════════════════════════════════
// USE SMART BACK NAVIGATION HOOK
// FloorOps Pro - Enterprise Navigation Hook
// ══════════════════════════════════════════════════════════════════

import { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    pushNavHistory,
    popNavHistory,
    getSmartBackDestination,
    hasNavigationHistory,
    getPreviousPage,
    getNavHistory,
    NavHistoryEntry
} from '@/lib/navigation';

export interface UseSmartBackOptions {
    /** Optional page title for history display */
    title?: string;
    /** Fallback path if no history exists */
    fallbackPath?: string;
    /** Whether to skip recording this page in history (for modals, etc.) */
    skipRecord?: boolean;
}

export interface UseSmartBackReturn {
    /** Navigate back intelligently */
    goBack: () => void;
    /** The path we'll navigate to on back */
    backPath: string;
    /** Human-readable label for the back destination */
    backLabel: string;
    /** Whether there's real history to go back to */
    hasHistory: boolean;
    /** Whether browser history.back() would work */
    canUseNativeBack: boolean;
}

/**
 * Generate a human-readable label from a path
 */
function getLabelFromPath(path: string): string {
    if (path === '/') return 'Dashboard';
    if (path === '/projects') return 'Projects';
    if (path === '/warehouse') return 'Warehouse';
    if (path === '/schedule') return 'Schedule';
    if (path === '/estimates') return 'Estimates';
    if (path === '/messages') return 'Messages';
    if (path === '/punch') return 'Punch List';
    if (path === '/assignments') return 'Assignments';
    if (path === '/inventory') return 'Inventory';
    if (path === '/invoices') return 'Invoices';
    if (path === '/intelligence') return 'Intelligence';
    if (path === '/daily-logs') return 'Daily Logs';
    if (path.startsWith('/projects/')) return 'Project';
    return 'Previous';
}

/**
 * Smart back navigation hook for FloorOps Pro.
 * 
 * Automatically records the current page in navigation history
 * and provides intelligent back navigation that respects the user's
 * actual navigation path rather than hardcoded destinations.
 * 
 * @example
 * ```tsx
 * const { goBack, backLabel } = useSmartBack({
 *   title: 'Project Detail',
 *   fallbackPath: '/projects'
 * });
 * 
 * return (
 *   <Button onClick={goBack}>
 *     <ArrowLeft className="w-4 h-4 mr-2" />
 *     {backLabel}
 *   </Button>
 * );
 * ```
 */
export function useSmartBack(options: UseSmartBackOptions = {}): UseSmartBackReturn {
    const router = useRouter();
    const pathname = usePathname();
    const { title, fallbackPath, skipRecord = false } = options;

    // Capture the previous page BEFORE we record the current page
    // This is stored in a ref so it persists across renders
    const previousPageRef = useRef<NavHistoryEntry | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Capture previous page info on first render, before useEffect records new page
    useEffect(() => {
        if (!isInitialized && pathname) {
            // Get the current last entry in history (this is our "previous page")
            const history = getNavHistory();
            const lastEntry = history.length > 0 ? history[history.length - 1] : null;

            // Only set if it's actually different from current pathname
            if (lastEntry && lastEntry.path !== pathname) {
                previousPageRef.current = lastEntry;
            }

            // Now record this page visit in history
            if (!skipRecord) {
                pushNavHistory(pathname, title);
            }

            setIsInitialized(true);
        }
    }, [pathname, title, skipRecord, isInitialized]);

    // Compute back path and label based on previous page
    const { backPath, backLabel, hasHistory } = useMemo(() => {
        const prevPage = previousPageRef.current;

        if (prevPage) {
            const label = prevPage.title || getLabelFromPath(prevPage.path);
            return {
                backPath: prevPage.path,
                backLabel: `Back to ${label}`,
                hasHistory: true
            };
        }

        // No previous page - use fallback
        const fallback = fallbackPath || getSmartBackDestination(pathname || '/', fallbackPath);
        const label = getLabelFromPath(fallback);
        return {
            backPath: fallback,
            backLabel: `Back to ${label}`,
            hasHistory: false
        };
    }, [isInitialized, pathname, fallbackPath]);

    const canUseNativeBack = hasHistory && previousPageRef.current !== null;

    const goBack = useCallback(() => {
        // Pop current page from our custom history
        popNavHistory();

        // Use native browser back if we have real history
        // This preserves scroll position and other browser state
        if (canUseNativeBack) {
            router.back();
        } else {
            // Fall back to our computed destination
            router.push(backPath);
        }
    }, [router, backPath, canUseNativeBack]);

    return {
        goBack,
        backPath,
        backLabel,
        hasHistory,
        canUseNativeBack
    };
}

/**
 * Simplified hook that just provides the goBack function.
 * Use this when you don't need the extra metadata.
 */
export function useGoBack(fallbackPath?: string): () => void {
    const { goBack } = useSmartBack({ fallbackPath });
    return goBack;
}

