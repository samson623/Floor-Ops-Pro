import { test, expect, Page } from '@playwright/test';
import {
    CrawlState,
    QueueItem,
    DEFAULT_CONFIG,
    ElementInfo,
    PageVisit,
} from './helpers/types';
import {
    discoverClickableElements,
    filterSafeElements,
    getElementSignature,
    getElementInfo,
} from './helpers/discovery';
import {
    initializeCrawlState,
    isVisited,
    markVisited,
    shouldContinue,
    normalizeUrl,
} from './helpers/detection';
import {
    safeNavigate,
    safeClick,
    closeModals,
    waitForStability,
    setupConsoleListener,
    setupNetworkListener,
} from './helpers/interactions';
import {
    captureScreenshot,
    captureFailureEvidence,
    ensureResultsDirs,
} from './helpers/evidence';
import {
    generateJsonReport,
    generateMarkdownReport,
} from './helpers/reporting';

test.describe('E2E Functional Audit', () => {
    test('Full Crawl of Floor Ops Pro', async ({ page }) => {
        const state = initializeCrawlState();
        const config = DEFAULT_CONFIG;

        ensureResultsDirs();

        // Setup listeners for console and network
        setupConsoleListener(page, state);
        setupNetworkListener(page, state);

        // Seed URLs - start with landing and root
        const queue: QueueItem[] = config.seedUrls.map(url => ({ url, depth: 0 }));

        console.log(`🚀 Starting E2E audit of ${config.baseUrl}`);
        console.log(`📋 Max depth: ${config.maxDepth}, Max actions: ${config.maxTotalActions}`);

        // BFS crawl
        while (queue.length > 0 && shouldContinue(state, config)) {
            const item = queue.shift()!;
            const { url, depth } = item;

            // Skip if already visited or too deep
            const normalizedUrl = normalizeUrl(url);
            if (isVisited(normalizedUrl, null, state) || depth > config.maxDepth) {
                continue;
            }

            console.log(`\n📄 [Depth ${depth}] Visiting: ${url}`);

            // Navigate to the page
            const navResult = await safeNavigate(page, url, state);
            markVisited(normalizedUrl, null, state);

            if (!navResult.success) {
                console.log(`   ❌ Navigation failed with ${navResult.failures.length} issues`);
                state.failures.push(...navResult.failures);
                continue;
            }

            // Wait for page to stabilize
            await waitForStability(page);

            // Discover clickable elements
            const allElements = await discoverClickableElements(page);
            const safeElements = await filterSafeElements(allElements, config.baseUrl);

            console.log(`   🔍 Found ${allElements.length} elements, ${safeElements.length} safe to click`);

            // Record page visit
            const pageVisit: PageVisit = {
                url: page.url(),
                title: await page.title(),
                elementsFound: safeElements.length,
                elementsClicked: 0,
                failures: 0,
                timestamp: new Date().toISOString(),
            };

            // Click elements up to limit
            let clickCount = 0;
            for (const { element, info } of safeElements) {
                if (clickCount >= config.maxClicksPerPage) {
                    console.log(`   ⏸️ Reached max clicks per page (${config.maxClicksPerPage})`);
                    break;
                }

                if (!shouldContinue(state, config)) {
                    console.log(`   ⏹️ Reached global action limit (${config.maxTotalActions})`);
                    break;
                }

                // Check if this specific interaction was already done
                const signature = getElementSignature(info);
                if (isVisited(normalizedUrl, signature, state)) {
                    continue;
                }

                // Attempt the click
                console.log(`   🖱️ Clicking: ${info.role} "${info.accessibleName.slice(0, 30)}"`);

                const clickResult = await safeClick(page, element, info, state);
                markVisited(normalizedUrl, signature, state);
                clickCount++;
                pageVisit.elementsClicked++;

                if (!clickResult.success) {
                    pageVisit.failures++;
                    console.log(`      ❌ Click failed: ${clickResult.failure?.type}`);

                    // Capture evidence for failure
                    if (clickResult.failure) {
                        await captureFailureEvidence(page, clickResult.failure, state);
                    }
                } else {
                    console.log(`      ✅ Success${clickResult.navigated ? ` → ${clickResult.newUrl}` : ''}${clickResult.modalOpened ? ' (modal opened)' : ''}`);

                    // If navigation occurred, add new URL to queue
                    if (clickResult.navigated && clickResult.newUrl) {
                        const newPath = normalizeUrl(clickResult.newUrl);
                        if (!isVisited(newPath, null, state)) {
                            queue.push({ url: newPath, depth: depth + 1, fromElement: signature });
                            console.log(`      📌 Queued: ${newPath}`);
                        }
                    }

                    // If modal opened, try to close it
                    if (clickResult.modalOpened) {
                        await closeModals(page);
                    }
                }

                // Return to original URL if we navigated
                if (clickResult.navigated && clickResult.newUrl !== url) {
                    await safeNavigate(page, url, state);
                    await waitForStability(page);
                }
            }

            state.pageVisits.push(pageVisit);
        }

        // Generate reports
        console.log('\n📊 Generating reports...');

        const jsonPath = await generateJsonReport(state);
        const mdPath = await generateMarkdownReport(state);

        console.log(`\n✅ Audit complete!`);
        console.log(`   📄 JSON Report: ${jsonPath}`);
        console.log(`   📝 Markdown Report: ${mdPath}`);
        console.log(`\n📈 Summary:`);
        console.log(`   Pages visited: ${state.visitedUrls.size}`);
        console.log(`   Total actions: ${state.totalActions}`);
        console.log(`   Successes: ${state.successes.length}`);
        console.log(`   Failures: ${state.failures.length}`);

        // Test assertions
        expect(state.visitedUrls.size).toBeGreaterThan(0);

        // Log high severity failures
        const highSeverity = state.failures.filter(f => f.severity === 'HIGH');
        if (highSeverity.length > 0) {
            console.log(`\n🚨 HIGH SEVERITY ISSUES (${highSeverity.length}):`);
            for (const failure of highSeverity.slice(0, 10)) {
                console.log(`   - ${failure.type}: ${failure.description.slice(0, 80)}`);
            }
        }
    });
});
