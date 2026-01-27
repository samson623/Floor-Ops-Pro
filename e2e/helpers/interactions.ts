import { Page, Locator } from '@playwright/test';
import {
    CrawlState,
    ClickResult,
    ElementInfo,
    SuccessRecord,
    DEFAULT_CONFIG
} from './types';
import {
    detectPageFailures,
    detectDeadClick,
    createFailure,
    markVisited
} from './detection';
import { getElementInfo, getElementSignature } from './discovery';

export async function waitForStability(page: Page, timeout = 5000): Promise<void> {
    try {
        await Promise.race([
            page.waitForLoadState('networkidle', { timeout }),
            new Promise(resolve => setTimeout(resolve, timeout))
        ]);

        // Extra wait for React/Next.js hydration
        await page.waitForTimeout(300);
    } catch {
        // Timeout is acceptable, we'll proceed
    }
}

export async function safeNavigate(
    page: Page,
    url: string,
    state: CrawlState
): Promise<{ success: boolean; failures: any[] }> {
    const fullUrl = url.startsWith('http') ? url : `${DEFAULT_CONFIG.baseUrl}${url}`;
    state.actionHistory.push(`Navigate to ${url}`);

    try {
        // Clear recent logs for fresh detection
        state.consoleLog = [];
        state.networkLog = [];

        const response = await page.goto(fullUrl, {
            waitUntil: 'domcontentloaded',
            timeout: DEFAULT_CONFIG.networkIdleTimeout * 2
        });

        await waitForStability(page);

        const failures = await detectPageFailures(page, state);

        // Check response status
        if (response && response.status() >= 400) {
            failures.push(createFailure(
                response.status() >= 500 ? 'HTTP_5XX' : 'HTTP_4XX',
                url,
                state,
                undefined,
                `HTTP ${response.status()} on navigation`
            ));
        }

        state.totalActions++;

        return { success: failures.length === 0, failures };
    } catch (error) {
        const failures = [createFailure('NETWORK_FAILURE', url, state, undefined, String(error))];
        return { success: false, failures };
    }
}

export async function safeClick(
    page: Page,
    element: Locator,
    elementInfo: ElementInfo,
    state: CrawlState
): Promise<ClickResult> {
    const beforeUrl = page.url();
    const beforeContent = await page.content();

    state.actionHistory.push(`Click ${elementInfo.role} "${elementInfo.accessibleName}" at ${beforeUrl}`);

    // Clear logs for fresh detection
    const consoleSnapshot = [...state.consoleLog];
    const networkSnapshot = [...state.networkLog];
    state.consoleLog = [];
    state.networkLog = [];

    try {
        // Scroll into view and click
        await element.scrollIntoViewIfNeeded({ timeout: 2000 });
        await element.click({ timeout: 5000 });

        await waitForStability(page);

        const afterUrl = page.url();
        const navigated = afterUrl !== beforeUrl;

        // Check for modal
        const modalOpened = await page.locator('[role="dialog"], [role="alertdialog"], [class*="modal"][class*="open"], [data-state="open"]')
            .first()
            .isVisible({ timeout: 500 })
            .catch(() => false);

        // Detect failures
        const failures = await detectPageFailures(page, state, elementInfo);

        // Detect dead click
        if (!navigated && !modalOpened && failures.length === 0) {
            const isDead = await detectDeadClick(page, beforeUrl, beforeContent);
            if (isDead) {
                failures.push(createFailure('DEAD_CLICK', beforeUrl, state, elementInfo, 'Click had no visible effect'));
            }
        }

        state.totalActions++;

        if (failures.length === 0) {
            state.successes.push({
                url: beforeUrl,
                element: elementInfo,
                action: 'click',
                resultUrl: navigated ? afterUrl : undefined,
                timestamp: new Date().toISOString(),
            });
        } else {
            state.failures.push(...failures);
        }

        return {
            success: failures.length === 0,
            navigated,
            newUrl: navigated ? afterUrl : undefined,
            modalOpened,
            failure: failures[0],
        };
    } catch (error) {
        // Restore logs on error
        state.consoleLog = consoleSnapshot;
        state.networkLog = networkSnapshot;

        const failure = createFailure('DEAD_CLICK', beforeUrl, state, elementInfo, String(error));
        state.failures.push(failure);
        state.totalActions++;

        return {
            success: false,
            navigated: false,
            modalOpened: false,
            failure,
        };
    }
}

export async function closeModals(page: Page): Promise<void> {
    // Try to close any open modals/dialogs
    const closeButtons = [
        '[aria-label="Close"]',
        '[aria-label="close"]',
        'button:has-text("Close")',
        'button:has-text("Cancel")',
        '[data-dismiss="modal"]',
        '.modal-close',
        '[class*="close-button"]',
    ];

    for (const selector of closeButtons) {
        try {
            const btn = page.locator(selector).first();
            if (await btn.isVisible({ timeout: 500 })) {
                await btn.click({ timeout: 1000 });
                await page.waitForTimeout(300);
            }
        } catch {
            // Button not found or not clickable
        }
    }

    // Press Escape as fallback
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
}

export function setupConsoleListener(page: Page, state: CrawlState): void {
    page.on('console', msg => {
        state.consoleLog.push({
            type: msg.type(),
            text: msg.text(),
            location: msg.location().url || '',
            timestamp: Date.now(),
        });
    });

    page.on('pageerror', error => {
        state.consoleLog.push({
            type: 'error',
            text: `Uncaught: ${error.message}`,
            location: '',
            timestamp: Date.now(),
        });
    });
}

export function setupNetworkListener(page: Page, state: CrawlState): void {
    page.on('response', response => {
        if (response.status() >= 400) {
            state.networkLog.push({
                url: response.url(),
                method: response.request().method(),
                status: response.status(),
                statusText: response.statusText(),
                resourceType: response.request().resourceType(),
            });
        }
    });

    page.on('requestfailed', request => {
        state.networkLog.push({
            url: request.url(),
            method: request.method(),
            status: 0,
            statusText: request.failure()?.errorText || 'Request failed',
            resourceType: request.resourceType(),
        });
    });
}
