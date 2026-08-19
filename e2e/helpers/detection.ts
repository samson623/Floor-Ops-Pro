import { Page } from '@playwright/test';
import {
    CrawlState,
    FailureRecord,
    FailureType,
    Severity,
    ConsoleEntry,
    NetworkFailure,
    ElementInfo,
    DEFAULT_CONFIG
} from './types';

export function initializeCrawlState(): CrawlState {
    return {
        visitedUrls: new Set(),
        visitedInteractions: new Set(),
        totalActions: 0,
        currentDepth: 0,
        failures: [],
        successes: [],
        pageVisits: [],
        consoleLog: [],
        networkLog: [],
        actionHistory: [],
        startTime: Date.now(),
    };
}

export function isVisited(url: string, elementSig: string | null, state: CrawlState): boolean {
    if (elementSig) {
        return state.visitedInteractions.has(`${url}::${elementSig}`);
    }
    return state.visitedUrls.has(normalizeUrl(url));
}

export function markVisited(url: string, elementSig: string | null, state: CrawlState): void {
    if (elementSig) {
        state.visitedInteractions.add(`${url}::${elementSig}`);
    } else {
        state.visitedUrls.add(normalizeUrl(url));
    }
}

export function normalizeUrl(url: string): string {
    try {
        const u = new URL(url.startsWith('/') ? `https://floor-ops-pro.vercel.app${url}` : url);
        // Remove trailing slash, normalize path
        return u.pathname.replace(/\/$/, '') || '/';
    } catch {
        return url;
    }
}

export function shouldContinue(state: CrawlState, config = DEFAULT_CONFIG): boolean {
    return state.totalActions < config.maxTotalActions;
}

export function classifyFailure(type: FailureType): Severity {
    const highSeverity: FailureType[] = [
        'HYDRATION_ERROR',
        'CHUNK_LOAD_FAILURE',
        'CORS_ERROR',
        'HTTP_5XX',
        'UNCAUGHT_EXCEPTION',
    ];

    const mediumSeverity: FailureType[] = [
        'HTTP_4XX',
        'DEAD_CLICK',
        'BLANK_PAGE',
        'STUCK_LOADER',
    ];

    if (highSeverity.includes(type)) return 'HIGH';
    if (mediumSeverity.includes(type)) return 'MEDIUM';
    return 'LOW';
}

export function analyzeConsoleEntry(entry: ConsoleEntry): { isFailure: boolean; type?: FailureType; severity?: Severity } {
    const text = entry.text.toLowerCase();

    // High severity patterns
    if (text.includes('hydration') && (text.includes('failed') || text.includes('mismatch'))) {
        return { isFailure: true, type: 'HYDRATION_ERROR', severity: 'HIGH' };
    }

    if (text.includes('chunk') && text.includes('fail')) {
        return { isFailure: true, type: 'CHUNK_LOAD_FAILURE', severity: 'HIGH' };
    }

    if (text.includes('cors') || text.includes('cross-origin')) {
        return { isFailure: true, type: 'CORS_ERROR', severity: 'HIGH' };
    }

    if (entry.type === 'error' && (
        text.includes('uncaught') ||
        text.includes('unhandled') ||
        text.includes('typeerror') ||
        text.includes('referenceerror')
    )) {
        return { isFailure: true, type: 'UNCAUGHT_EXCEPTION', severity: 'HIGH' };
    }

    // Medium severity - warnings with specific keywords
    if (entry.type === 'warning' && (
        text.includes('failed') ||
        text.includes('deprecated') ||
        text.includes('undefined')
    )) {
        return { isFailure: true, type: 'CONSOLE_ERROR', severity: 'HIGH' };
    }

    // General console errors
    if (entry.type === 'error') {
        return { isFailure: true, type: 'CONSOLE_ERROR', severity: 'MEDIUM' };
    }

    return { isFailure: false };
}

export function analyzeNetworkFailure(failure: NetworkFailure): { type: FailureType; severity: Severity } {
    if (failure.status >= 500) {
        return { type: 'HTTP_5XX', severity: 'HIGH' };
    }
    if (failure.status >= 400) {
        return { type: 'HTTP_4XX', severity: 'MEDIUM' };
    }
    return { type: 'NETWORK_FAILURE', severity: 'MEDIUM' };
}

export async function detectPageFailures(
    page: Page,
    state: CrawlState,
    element?: ElementInfo
): Promise<FailureRecord[]> {
    const failures: FailureRecord[] = [];
    const url = page.url();

    // Check for blank page
    const content = await page.content();
    if (content.length < 200 || !content.includes('<body')) {
        failures.push(createFailure('BLANK_PAGE', url, state, element, 'Page appears blank or failed to render'));
    }

    // Check for stuck loaders
    try {
        const hasLoader = await page.locator('[class*="loading"], [class*="spinner"], [aria-busy="true"]').first().isVisible({ timeout: 1000 });
        if (hasLoader) {
            const stillLoading = await page.waitForSelector('[class*="loading"], [class*="spinner"], [aria-busy="true"]', {
                state: 'hidden',
                timeout: DEFAULT_CONFIG.loaderTimeout
            }).then(() => false).catch(() => true);

            if (stillLoading) {
                failures.push(createFailure('STUCK_LOADER', url, state, element, 'Loader stuck for more than 10 seconds'));
            }
        }
    } catch {
        // No loader found, which is fine
    }

    // Analyze recent console entries
    const recentLogs = state.consoleLog.slice(-20);
    for (const entry of recentLogs) {
        const analysis = analyzeConsoleEntry(entry);
        if (analysis.isFailure && analysis.type) {
            failures.push(createFailure(analysis.type, url, state, element, entry.text.slice(0, 200)));
        }
    }

    // Analyze recent network failures
    const recentNetwork = state.networkLog.slice(-10);
    for (const netFail of recentNetwork) {
        const analysis = analyzeNetworkFailure(netFail);
        failures.push(createFailure(analysis.type, url, state, element, `${netFail.method} ${netFail.url} - ${netFail.status}`));
    }

    return failures;
}

export function createFailure(
    type: FailureType,
    url: string,
    state: CrawlState,
    element?: ElementInfo,
    description: string = ''
): FailureRecord {
    return {
        id: `fail_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        type,
        severity: classifyFailure(type),
        url,
        element,
        consoleErrors: state.consoleLog.slice(-5).map(e => e.text),
        networkFailures: state.networkLog.slice(-5),
        timestamp: new Date().toISOString(),
        reproSteps: [...state.actionHistory.slice(-10)],
        description,
    };
}

export async function detectDeadClick(
    page: Page,
    beforeUrl: string,
    beforeContent: string
): Promise<boolean> {
    const afterUrl = page.url();
    const afterContent = await page.content();

    // URL changed = not dead
    if (afterUrl !== beforeUrl) return false;

    // Any rendered DOM change counts as an effect. Selection controls often only
    // update classes or ARIA state, so comparing document length creates false
    // positives when the before/after markup happens to be the same size.
    if (afterContent !== beforeContent) return false;

    // Check for modal/dialog opened
    const modalVisible = await page.locator('[role="dialog"], [role="alertdialog"], [class*="modal"]').first().isVisible({ timeout: 500 }).catch(() => false);
    if (modalVisible) return false;

    // Check for dropdown opened  
    const dropdownVisible = await page.locator('[role="menu"], [role="listbox"], [class*="dropdown"]').first().isVisible({ timeout: 500 }).catch(() => false);
    if (dropdownVisible) return false;

    return true;
}
