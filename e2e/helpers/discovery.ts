import { Page, Locator } from '@playwright/test';
import { ElementInfo, DEFAULT_CONFIG } from './types';

const INTERACTIVE_SELECTORS = [
    'button:not([disabled])',
    'a[href]',
    '[role="button"]:not([disabled])',
    'input[type="button"]:not([disabled])',
    'input[type="submit"]:not([disabled])',
    '[onclick]',
    '[tabindex="0"]',
    '[role="tab"]',
    '[role="menuitem"]',
    '[role="link"]',
    '[role="checkbox"]',
    '[role="switch"]',
    'summary',
].join(', ');

export async function discoverClickableElements(page: Page): Promise<Locator[]> {
    const elements: Locator[] = [];
    const locators = page.locator(INTERACTIVE_SELECTORS);
    const count = await locators.count();

    for (let i = 0; i < count; i++) {
        const element = locators.nth(i);
        try {
            const isVisible = await element.isVisible({ timeout: 1000 });
            const isEnabled = await element.isEnabled({ timeout: 1000 });
            if (isVisible && isEnabled) {
                elements.push(element);
            }
        } catch {
            // Element may have been removed from DOM
        }
    }

    return elements;
}

export async function getElementInfo(element: Locator): Promise<ElementInfo> {
    try {
        const tagName = await element.evaluate(el => el.tagName.toLowerCase());
        const role = await element.getAttribute('role') || inferRole(tagName);
        const accessibleName = await getAccessibleName(element);
        const selector = await generateSelector(element);
        const textContent = await element.textContent() || '';

        return {
            role,
            accessibleName: accessibleName.slice(0, 100),
            selector,
            tagName,
            textContent: textContent.trim().slice(0, 50),
        };
    } catch {
        return {
            role: 'unknown',
            accessibleName: 'unknown',
            selector: 'unknown',
            tagName: 'unknown',
            textContent: '',
        };
    }
}

function inferRole(tagName: string): string {
    const roleMap: Record<string, string> = {
        button: 'button',
        a: 'link',
        input: 'input',
        select: 'combobox',
        textarea: 'textbox',
        summary: 'button',
    };
    return roleMap[tagName] || 'generic';
}

async function getAccessibleName(element: Locator): Promise<string> {
    try {
        // Try aria-label first
        const ariaLabel = await element.getAttribute('aria-label');
        if (ariaLabel) return ariaLabel;

        // Try title
        const title = await element.getAttribute('title');
        if (title) return title;

        // Try inner text
        const text = await element.textContent();
        if (text?.trim()) return text.trim();

        // Try value for inputs
        const value = await element.getAttribute('value');
        if (value) return value;

        // Try alt for images inside
        const imgAlt = await element.locator('img').first().getAttribute('alt').catch(() => null);
        if (imgAlt) return imgAlt;

        return 'unnamed';
    } catch {
        return 'unnamed';
    }
}

async function generateSelector(element: Locator): Promise<string> {
    try {
        return await element.evaluate(el => {
            // Try data-testid
            const testId = el.getAttribute('data-testid');
            if (testId) return `[data-testid="${testId}"]`;

            // Try id
            const id = el.id;
            if (id) return `#${id}`;

            // Build a path
            const path: string[] = [];
            let current: Element | null = el;
            while (current && current !== document.body) {
                let selector = current.tagName.toLowerCase();
                if (current.id) {
                    selector = `#${current.id}`;
                    path.unshift(selector);
                    break;
                }
                const classes = Array.from(current.classList).slice(0, 2).join('.');
                if (classes) selector += `.${classes}`;
                const parent: Element | null = current.parentElement;
                if (parent) {
                    const siblings = Array.from(parent.children).filter(c => c.tagName === current!.tagName);
                    if (siblings.length > 1) {
                        const index = siblings.indexOf(current) + 1;
                        selector += `:nth-of-type(${index})`;
                    }
                }
                path.unshift(selector);
                current = parent;
                if (path.length > 4) break;
            }
            return path.join(' > ');
        });
    } catch {
        return 'unknown';
    }
}

export function getElementSignature(info: ElementInfo): string {
    return `${info.tagName}|${info.role}|${info.accessibleName}|${info.selector}`;
}

export function isDestructiveElement(info: ElementInfo): boolean {
    const text = `${info.accessibleName} ${info.textContent}`.toLowerCase();
    return DEFAULT_CONFIG.destructiveKeywords.some(keyword => text.includes(keyword));
}

export function isSameOrigin(href: string, baseUrl: string): boolean {
    try {
        if (href.startsWith('/')) return true;
        if (href.startsWith('#')) return true;
        const url = new URL(href, baseUrl);
        const base = new URL(baseUrl);
        return url.origin === base.origin;
    } catch {
        return false;
    }
}

export async function filterSafeElements(
    elements: Locator[],
    baseUrl: string
): Promise<{ element: Locator; info: ElementInfo }[]> {
    const results: { element: Locator; info: ElementInfo }[] = [];

    for (const element of elements) {
        const info = await getElementInfo(element);

        // A focusable container without an interactive semantic role is commonly
        // a framework focus target, not an application control.
        if (info.role === 'generic') continue;

        // Skip destructive elements
        if (isDestructiveElement(info)) continue;

        // For links, check same-origin
        if (info.tagName === 'a') {
            const href = await element.getAttribute('href');
            if (href && !isSameOrigin(href, baseUrl)) continue;
        }

        results.push({ element, info });
    }

    return results;
}
