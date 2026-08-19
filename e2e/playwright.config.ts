import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'https://floor-ops-pro.vercel.app';

export default defineConfig({
    testDir: '.',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: 1,
    reporter: [
        ['html', { outputFolder: 'results/html-report' }],
        ['json', { outputFile: 'results/playwright-results.json' }],
        ['list']
    ],

    use: {
        baseURL,
        trace: 'on-first-retry',
        video: 'on-first-retry',
        screenshot: 'only-on-failure',
        viewport: { width: 1920, height: 1080 },
        actionTimeout: 10000,
        navigationTimeout: 30000,
    },

    timeout: 600000, // 10 minutes for full crawl

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    outputDir: 'results/test-results',
});
