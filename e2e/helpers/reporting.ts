import * as fs from 'fs';
import * as path from 'path';
import { CrawlState, FailureRecord, Severity, FailureType } from './types';
import { ensureResultsDirs } from './evidence';

const RESULTS_DIR = path.join(__dirname, '..', 'results');

interface ReportSummary {
    totalPagesVisited: number;
    totalElementsClicked: number;
    totalFailures: number;
    highSeverityCount: number;
    mediumSeverityCount: number;
    lowSeverityCount: number;
    passRate: string;
    duration: string;
    timestamp: string;
}

interface GroupedFailures {
    [key: string]: FailureRecord[];
}

export function generateSummary(state: CrawlState): ReportSummary {
    const duration = Date.now() - state.startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    const highCount = state.failures.filter(f => f.severity === 'HIGH').length;
    const mediumCount = state.failures.filter(f => f.severity === 'MEDIUM').length;
    const lowCount = state.failures.filter(f => f.severity === 'LOW').length;

    const totalActions = state.successes.length + state.failures.length;
    const passRate = totalActions > 0
        ? ((state.successes.length / totalActions) * 100).toFixed(1)
        : '0';

    return {
        totalPagesVisited: state.visitedUrls.size,
        totalElementsClicked: state.totalActions,
        totalFailures: state.failures.length,
        highSeverityCount: highCount,
        mediumSeverityCount: mediumCount,
        lowSeverityCount: lowCount,
        passRate: `${passRate}%`,
        duration: `${minutes}m ${seconds}s`,
        timestamp: new Date().toISOString(),
    };
}

export function groupFailuresByType(failures: FailureRecord[]): GroupedFailures {
    return failures.reduce((acc, failure) => {
        const key = failure.type;
        if (!acc[key]) acc[key] = [];
        acc[key].push(failure);
        return acc;
    }, {} as GroupedFailures);
}

export function groupFailuresBySeverity(failures: FailureRecord[]): GroupedFailures {
    return failures.reduce((acc, failure) => {
        const key = failure.severity;
        if (!acc[key]) acc[key] = [];
        acc[key].push(failure);
        return acc;
    }, {} as GroupedFailures);
}

export async function generateJsonReport(state: CrawlState): Promise<string> {
    ensureResultsDirs();

    const report = {
        summary: generateSummary(state),
        failures: state.failures,
        successes: state.successes,
        pageVisits: state.pageVisits,
        visitedUrls: Array.from(state.visitedUrls),
        actionHistory: state.actionHistory,
    };

    const filepath = path.join(RESULTS_DIR, 'report.json');
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));

    return filepath;
}

export async function generateMarkdownReport(state: CrawlState): Promise<string> {
    ensureResultsDirs();

    const summary = generateSummary(state);
    const groupedByType = groupFailuresByType(state.failures);
    const groupedBySeverity = groupFailuresBySeverity(state.failures);

    let md = `# E2E Functional Audit Report

**Generated:** ${summary.timestamp}  
**Duration:** ${summary.duration}

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Pages Visited | ${summary.totalPagesVisited} |
| Elements Interacted | ${summary.totalElementsClicked} |
| Total Failures | ${summary.totalFailures} |
| Pass Rate | ${summary.passRate} |

### Severity Breakdown

| Severity | Count |
|----------|-------|
| 🔴 HIGH | ${summary.highSeverityCount} |
| 🟠 MEDIUM | ${summary.mediumSeverityCount} |
| 🟡 LOW | ${summary.lowSeverityCount} |

---

## Failures by Root Cause

`;

    // HIGH severity first
    if (groupedBySeverity['HIGH']?.length) {
        md += `### 🔴 HIGH Severity Issues\n\n`;
        md += formatFailureGroup(groupedBySeverity['HIGH']);
    }

    // MEDIUM severity
    if (groupedBySeverity['MEDIUM']?.length) {
        md += `### 🟠 MEDIUM Severity Issues\n\n`;
        md += formatFailureGroup(groupedBySeverity['MEDIUM']);
    }

    // LOW severity
    if (groupedBySeverity['LOW']?.length) {
        md += `### 🟡 LOW Severity Issues\n\n`;
        md += formatFailureGroup(groupedBySeverity['LOW']);
    }

    if (state.failures.length === 0) {
        md += `> ✅ **No failures detected!** All interactions completed successfully.\n\n`;
    }

    // Working Flows
    md += `---

## Working Flows

Successfully tested interactions: **${state.successes.length}**

`;

    // Group successes by URL
    const successByUrl = state.successes.reduce((acc, s) => {
        if (!acc[s.url]) acc[s.url] = [];
        acc[s.url].push(s);
        return acc;
    }, {} as Record<string, typeof state.successes>);

    for (const [url, successes] of Object.entries(successByUrl).slice(0, 15)) {
        const urlPath = new URL(url).pathname;
        md += `### ${urlPath}\n\n`;
        for (const s of successes.slice(0, 5)) {
            const navInfo = s.resultUrl ? ` → navigated to ${new URL(s.resultUrl).pathname}` : '';
            md += `- ✅ ${s.element?.role || 'element'} "${s.element?.accessibleName || 'unnamed'}"${navInfo}\n`;
        }
        if (successes.length > 5) {
            md += `- ... and ${successes.length - 5} more\n`;
        }
        md += '\n';
    }

    // Coverage Gaps
    md += `---

## Coverage Gaps

### Skipped (Destructive Actions)
Elements containing destructive keywords were intentionally skipped:
- delete, remove, destroy, cancel, refund, charge, payment, reset, purge, logout

### Auth-Protected Routes
Routes requiring authentication that may not have been fully tested:
- /dashboard/* (if not logged in)
- Any route redirecting to /login

---

## Routes Visited

`;

    for (const url of state.visitedUrls) {
        md += `- ${url}\n`;
    }

    md += `
---

## Reproduction Steps

For any failure, use the following general process:
1. Navigate to the URL listed in the failure
2. Follow the action history steps
3. Observe the specific element interaction
4. Compare actual vs expected behavior

---

*Report generated by Floor Ops Pro E2E Audit Crawler*
`;

    const filepath = path.join(RESULTS_DIR, 'report.md');
    fs.writeFileSync(filepath, md);

    return filepath;
}

function formatFailureGroup(failures: FailureRecord[]): string {
    let md = '';

    for (const failure of failures) {
        md += `#### ${failure.type}\n\n`;
        md += `**URL:** \`${failure.url}\`\n\n`;

        if (failure.element) {
            md += `**Element:** ${failure.element.role} "${failure.element.accessibleName}"\n`;
            md += `**Selector:** \`${failure.element.selector}\`\n\n`;
        }

        md += `**Description:** ${failure.description}\n\n`;

        if (failure.screenshot) {
            const filename = path.basename(failure.screenshot);
            md += `**Screenshot:** [${filename}](./screenshots/${filename})\n\n`;
        }

        if (failure.consoleErrors.length > 0) {
            md += `**Console Errors:**\n\`\`\`\n${failure.consoleErrors.slice(0, 3).join('\n')}\n\`\`\`\n\n`;
        }

        if (failure.reproSteps.length > 0) {
            md += `**Repro Steps:**\n`;
            for (const step of failure.reproSteps.slice(-5)) {
                md += `1. ${step}\n`;
            }
            md += '\n';
        }

        md += '---\n\n';
    }

    return md;
}
