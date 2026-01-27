import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { CrawlState, FailureRecord } from './types';

const RESULTS_DIR = path.join(__dirname, '..', 'results');
const SCREENSHOTS_DIR = path.join(RESULTS_DIR, 'screenshots');

export function ensureResultsDirs(): void {
    if (!fs.existsSync(RESULTS_DIR)) {
        fs.mkdirSync(RESULTS_DIR, { recursive: true });
    }
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
        fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }
}

export async function captureScreenshot(
    page: Page,
    name: string
): Promise<string> {
    ensureResultsDirs();

    const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').slice(0, 50);
    const filename = `${sanitizedName}_${Date.now()}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);

    try {
        await page.screenshot({
            path: filepath,
            fullPage: true,
            timeout: 10000
        });
        return filepath;
    } catch (error) {
        console.error(`Failed to capture screenshot: ${error}`);
        return '';
    }
}

export async function captureFailureEvidence(
    page: Page,
    failure: FailureRecord,
    state: CrawlState
): Promise<void> {
    // Capture screenshot
    const screenshotName = `${failure.type}_${failure.id}`;
    failure.screenshot = await captureScreenshot(page, screenshotName);

    // Already have console and network from state
    failure.consoleErrors = state.consoleLog.slice(-10).map(e => `[${e.type}] ${e.text}`);
    failure.networkFailures = state.networkLog.slice(-5);
    failure.reproSteps = state.actionHistory.slice(-15);
}

export function buildReproSteps(actionHistory: string[]): string[] {
    return actionHistory.map((action, i) => `${i + 1}. ${action}`);
}

export function getConsoleExcerpt(state: CrawlState, limit = 10): string[] {
    return state.consoleLog
        .slice(-limit)
        .filter(e => e.type === 'error' || e.type === 'warning')
        .map(e => `[${e.type.toUpperCase()}] ${e.text.slice(0, 150)}`);
}

export function getNetworkFailureSummary(state: CrawlState): string[] {
    return state.networkLog.slice(-10).map(f =>
        `${f.method} ${f.status} ${f.url.slice(0, 80)}`
    );
}
