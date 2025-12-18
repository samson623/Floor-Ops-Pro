// ══════════════════════════════════════════════════════════════════
// SMART NAVIGATION SYSTEM
// FloorOps Pro - Enterprise Navigation with History Tracking
// ══════════════════════════════════════════════════════════════════

/**
 * Navigation history management for smart back navigation.
 * 
 * In a flooring business context, users often navigate through:
 * - Dashboard → Projects → Project Detail → Specific Tab
 * - Schedule → Project Detail → Punch List
 * - Warehouse → Inventory → Item Detail
 * - Messages → Project Link → Project Detail
 * 
 * This system ensures the back button takes you where you came from,
 * not a hardcoded destination.
 */

// Storage key for navigation history
const NAV_HISTORY_KEY = 'floorops_nav_history';
const MAX_HISTORY_SIZE = 20;

export interface NavHistoryEntry {
    path: string;
    title?: string;
    timestamp: number;
}

/**
 * Get the current navigation history stack from sessionStorage.
 * Uses sessionStorage so history is preserved during session but cleared on new tabs.
 */
export function getNavHistory(): NavHistoryEntry[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = sessionStorage.getItem(NAV_HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/**
 * Push a new entry to navigation history.
 * Called when navigating to a new page.
 */
export function pushNavHistory(path: string, title?: string): void {
    if (typeof window === 'undefined') return;

    const history = getNavHistory();

    // Don't push duplicate consecutive entries
    if (history.length > 0 && history[history.length - 1].path === path) {
        return;
    }

    history.push({
        path,
        title,
        timestamp: Date.now()
    });

    // Keep history size manageable
    while (history.length > MAX_HISTORY_SIZE) {
        history.shift();
    }

    try {
        sessionStorage.setItem(NAV_HISTORY_KEY, JSON.stringify(history));
    } catch {
        // Storage full or unavailable, gracefully fail
    }
}

/**
 * Pop the current page from history (when going back).
 */
export function popNavHistory(): NavHistoryEntry | undefined {
    if (typeof window === 'undefined') return undefined;

    const history = getNavHistory();

    if (history.length === 0) return undefined;

    // Remove current page
    history.pop();

    try {
        sessionStorage.setItem(NAV_HISTORY_KEY, JSON.stringify(history));
    } catch {
        // Storage full or unavailable, gracefully fail
    }

    return history[history.length - 1];
}

/**
 * Get the previous page destination for back navigation.
 * Returns undefined if there's no history.
 */
export function getPreviousPage(): NavHistoryEntry | undefined {
    const history = getNavHistory();

    // Need at least 2 entries: current page + previous page
    if (history.length < 2) return undefined;

    return history[history.length - 2];
}

/**
 * Clear navigation history (useful on logout).
 */
export function clearNavHistory(): void {
    if (typeof window === 'undefined') return;

    try {
        sessionStorage.removeItem(NAV_HISTORY_KEY);
    } catch {
        // Gracefully handle errors
    }
}

/**
 * Determine the smart back destination based on context.
 * 
 * Priority:
 * 1. Previous page in history (if exists)
 * 2. Context-aware fallback based on current page
 * 3. Dashboard as final fallback
 */
export function getSmartBackDestination(currentPath: string, fallbackPath?: string): string {
    const previousPage = getPreviousPage();

    if (previousPage) {
        return previousPage.path;
    }

    // Context-aware fallbacks based on current path
    if (fallbackPath) {
        return fallbackPath;
    }

    // Default fallbacks based on path patterns
    if (currentPath.startsWith('/projects/')) {
        return '/projects';
    }
    if (currentPath.startsWith('/warehouse/')) {
        return '/warehouse';
    }
    if (currentPath.startsWith('/estimates/')) {
        return '/estimates';
    }
    if (currentPath.startsWith('/inventory/')) {
        return '/inventory';
    }
    if (currentPath.startsWith('/schedule/')) {
        return '/schedule';
    }

    // Ultimate fallback - dashboard
    return '/';
}

/**
 * Hook-compatible function to check if we have meaningful history.
 * Useful for deciding whether to show "Back" or "Close" text.
 */
export function hasNavigationHistory(): boolean {
    const history = getNavHistory();
    return history.length >= 2;
}

/**
 * Get a human-readable label for the back destination.
 * Useful for showing "Back to Projects" vs just "Back".
 */
export function getBackLabel(currentPath: string): string {
    const previousPage = getPreviousPage();

    if (previousPage?.title) {
        return `Back to ${previousPage.title}`;
    }

    if (previousPage?.path) {
        // Generate label from path
        const path = previousPage.path;

        if (path === '/') return 'Back to Dashboard';
        if (path === '/projects') return 'Back to Projects';
        if (path === '/warehouse') return 'Back to Warehouse';
        if (path === '/schedule') return 'Back to Schedule';
        if (path === '/estimates') return 'Back to Estimates';
        if (path === '/messages') return 'Back to Messages';
        if (path === '/punch') return 'Back to Punch List';
        if (path === '/assignments') return 'Back to Assignments';
        if (path === '/inventory') return 'Back to Inventory';
        if (path === '/invoices') return 'Back to Invoices';
        if (path === '/intelligence') return 'Back to Intelligence';
        if (path === '/daily-logs') return 'Back to Daily Logs';

        // Project detail pages
        if (path.startsWith('/projects/')) {
            return 'Back to Project';
        }
    }

    // Generic fallback
    return 'Back';
}
