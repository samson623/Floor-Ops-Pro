import { expect, Page, test } from '@playwright/test';

const OWNER_ROUTES = [
    '/dashboard',
    '/projects',
    '/assignments',
    '/punch',
    '/estimates',
    '/invoices',
    '/budget',
    '/subcontractors',
    '/schedule',
    '/daily-logs',
    '/intelligence',
    '/warehouse',
    '/materials',
    '/inventory',
    '/vendors',
    '/team',
    '/messages',
    '/notes',
    '/projects/1',
] as const;

const DEMO_ACCOUNT_PREVIEWS = [
    { id: 1, name: 'Derek Morrison', firstName: 'Derek', role: 'Owner' },
    { id: 2, name: 'Sarah Chen', firstName: 'Sarah', role: 'Project Manager' },
    { id: 3, name: 'Mike Rodriguez', firstName: 'Mike', role: 'Foreman' },
    { id: 4, name: 'James Wilson', firstName: 'James', role: 'Installer' },
    { id: 5, name: 'Emily Parker', firstName: 'Emily', role: 'Office Admin' },
    { id: 6, name: 'Tony Martinez', firstName: 'Tony', role: 'Subcontractor' },
    { id: 7, name: 'David (Lakeside HOA)', firstName: 'David', role: 'Client' },
    { id: 8, name: 'Marcus Thompson', firstName: 'Marcus', role: 'Warehouse Manager' },
    { id: 9, name: 'Lisa Nguyen', firstName: 'Lisa', role: 'Warehouse Staff' },
    { id: 10, name: 'Carlos Ramirez', firstName: 'Carlos', role: 'Installer' },
    { id: 11, name: 'Ana Gonzalez', firstName: 'Ana', role: 'Foreman' },
] as const;

type RuntimeIssue = {
    type: 'console' | 'pageerror' | 'response' | 'requestfailed';
    detail: string;
};

function monitorRuntime(page: Page): RuntimeIssue[] {
    const issues: RuntimeIssue[] = [];

    page.on('console', message => {
        if (message.type() === 'error') {
            issues.push({ type: 'console', detail: message.text() });
        }
    });

    page.on('pageerror', error => {
        issues.push({ type: 'pageerror', detail: error.message });
    });

    page.on('response', response => {
        const resourceType = response.request().resourceType();
        if (response.status() >= 400 && ['document', 'fetch', 'xhr', 'script'].includes(resourceType)) {
            issues.push({
                type: 'response',
                detail: `${response.status()} ${response.request().method()} ${response.url()}`,
            });
        }
    });

    page.on('requestfailed', request => {
        if (request.failure()?.errorText === 'net::ERR_ABORTED') return;
        issues.push({
            type: 'requestfailed',
            detail: `${request.method()} ${request.url()} - ${request.failure()?.errorText || 'failed'}`,
        });
    });

    return issues;
}

async function clearBrowserSession(page: Page): Promise<void> {
    await page.goto('/landing');
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
}

async function signInAsOwner(page: Page): Promise<void> {
    await clearBrowserSession(page);
    await page.goto('/login');

    await page.getByRole('button', { name: /Derek Morrison/ }).click();
    await page.getByRole('button', { name: 'Select an Account', exact: true }).click();
    await expect(page).toHaveURL(/\/login\/signin\?userId=1$/);

    await page.getByLabel('Email').fill('test');
    await page.getByLabel('Password').fill('123');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText('Welcome back, Derek')).toBeVisible();
}

test.describe('Deterministic verification', () => {
    test('@smoke public landing page renders its primary sections', async ({ page }) => {
        const runtimeIssues = monitorRuntime(page);
        const response = await page.goto('/landing');

        expect(response?.status()).toBeLessThan(400);
        await expect(page.getByRole('heading', { name: 'Run Your Flooring Business Like a Pro' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Everything You Need to Succeed' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Start with a Guided Pilot' })).toBeVisible();
        expect(runtimeIssues).toEqual([]);
    });

    test('@smoke owner journey and all primary routes stay healthy', async ({ page }) => {
        const runtimeIssues = monitorRuntime(page);
        await signInAsOwner(page);

        for (const route of OWNER_ROUTES) {
            const issueCountBeforeNavigation = runtimeIssues.length;
            const response = await page.goto(route, { waitUntil: 'domcontentloaded' });

            expect.soft(response?.status(), `${route} should return a successful document`).toBeLessThan(400);
            await expect.soft(page.locator('main'), `${route} should render its main region`).toBeVisible();
            await expect.soft(page.locator('body'), `${route} should render meaningful content`).not.toHaveText(/^\s*$/);

            const newBlockingIssues = runtimeIssues
                .slice(issueCountBeforeNavigation)
                .filter(issue => issue.type !== 'console');
            expect.soft(newBlockingIssues, `${route} should not emit fatal runtime or network errors`).toEqual([]);
        }
    });

    test('@smoke demo entry reaches a clearly identified demo session', async ({ page }) => {
        const runtimeIssues = monitorRuntime(page);
        await clearBrowserSession(page);
        await page.goto('/demo');

        await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10_000 });
        await expect(page.getByText('Demo Mode', { exact: true })).toBeVisible();
        await expect(page.getByText('Viewing Sample Data', { exact: true })).toBeVisible();
        await expect(page.getByText('Welcome back, Demo', { exact: true })).toBeVisible();
        expect(runtimeIssues).toEqual([]);
    });

    test('@release the owner demo can preview every account row', async ({ page }) => {
        await clearBrowserSession(page);

        for (const account of DEMO_ACCOUNT_PREVIEWS) {
            await page.goto('/login/select');

            const accountRow = page.getByRole('button', { name: new RegExp(account.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) });
            await expect(accountRow, `${account.name} (${account.role}) should be listed`).toBeVisible();
            await accountRow.click();

            const selectAccount = page.getByRole('button', { name: 'Continue to Dashboard', exact: true });
            await expect(selectAccount, `${account.name}'s row should be selectable`).toBeEnabled();
            await selectAccount.click();

            await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10_000 });
            await expect(page.getByText(`Welcome back, ${account.firstName}`, { exact: true })).toBeVisible();
        }
    });

    test('@release authenticated dashboard loads without console or integration errors', async ({ page }) => {
        const runtimeIssues = monitorRuntime(page);
        await signInAsOwner(page);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(500);

        expect(runtimeIssues).toEqual([]);
    });

    test('@release demo browsing does not submit data to external backends', async ({ page }) => {
        const backendWrites: string[] = [];
        page.on('request', request => {
            if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) return;

            const url = new URL(request.url());
            if (url.hostname !== new URL(page.url()).hostname || url.hostname.includes('supabase')) {
                backendWrites.push(`${request.method()} ${request.url()}`);
            }
        });

        await clearBrowserSession(page);
        await page.goto('/demo');
        await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10_000 });

        await page.evaluate(() => {
            localStorage.setItem('floorops-pro-demo-data', JSON.stringify({ verificationMarker: true }));
        });
        await page.goto('/projects');
        await page.goto('/dashboard');

        const markerSurvived = await page.evaluate(() => {
            const value = localStorage.getItem('floorops-pro-demo-data');
            return value?.includes('verificationMarker') ?? false;
        });

        expect(markerSurvived, 'demo state should remain local to the browser session').toBeTruthy();
        expect(backendWrites, 'demo browsing should not send write requests to external backends').toEqual([]);
    });

    test('@release public calls to action have a real destination or interaction', async ({ page }) => {
        await page.goto('/landing');

        const interactiveButtons = [
            'Watch Overview',
            'Plan Your Pilot',
            'Schedule Walkthrough',
        ];

        for (const name of interactiveButtons) {
            const button = page.getByRole('button', { name, exact: true });
            const initialUrl = page.url();
            const initialDialogCount = await page.getByRole('dialog').count();

            await button.click();
            await page.waitForTimeout(300);

            const changedUrl = page.url() !== initialUrl;
            const openedDialog = await page.getByRole('dialog').count() > initialDialogCount;
            expect.soft(changedUrl || openedDialog, `${name} should navigate or open a dialog`).toBeTruthy();

            if (changedUrl) await page.goto('/landing');
            if (openedDialog) {
                await page.getByRole('button', { name: 'Close', exact: true }).click();
                await expect(page.getByRole('dialog')).toHaveCount(0);
            }
        }

        await expect.soft(page.getByRole('link', { name: 'Privacy Policy' })).not.toHaveAttribute('href', '#');
        await expect.soft(page.getByRole('link', { name: 'Terms of Service' })).not.toHaveAttribute('href', '#');
        await expect.soft(page.getByRole('link', { name: 'Schedule Demo' })).not.toHaveAttribute('href', '#');

        await page.goto('/privacy');
        await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
        await page.goto('/terms');
        await expect(page.getByRole('heading', { name: 'Terms of Use' })).toBeVisible();
    });

    test('@smoke AI endpoint responds when explicitly enabled', async ({ request }) => {
        test.skip(process.env.VERIFY_AI !== '1', 'Set VERIFY_AI=1 to run the billable AI endpoint check.');

        const response = await request.post('/api/chat', {
            data: {
                messages: [{ role: 'user', content: 'Reply with exactly: AI endpoint operational' }],
                projectContext: {},
            },
        });

        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        expect(body.role).toBe('assistant');
        expect(body.content).toContain('AI endpoint operational');
    });
});
