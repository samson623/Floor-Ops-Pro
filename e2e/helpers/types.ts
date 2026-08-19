export type FailureType =
    | 'CONSOLE_ERROR'
    | 'NETWORK_FAILURE'
    | 'DEAD_CLICK'
    | 'HYDRATION_ERROR'
    | 'CHUNK_LOAD_FAILURE'
    | 'CORS_ERROR'
    | 'STUCK_LOADER'
    | 'BLANK_PAGE'
    | 'HTTP_4XX'
    | 'HTTP_5XX'
    | 'UNCAUGHT_EXCEPTION';

export type Severity = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ElementInfo {
    role: string;
    accessibleName: string;
    selector: string;
    tagName: string;
    textContent: string;
}

export interface NetworkFailure {
    url: string;
    method: string;
    status: number;
    statusText: string;
    resourceType: string;
}

export interface ConsoleEntry {
    type: string;
    text: string;
    location: string;
    timestamp: number;
}

export interface FailureRecord {
    id: string;
    type: FailureType;
    severity: Severity;
    url: string;
    element?: ElementInfo;
    screenshot?: string;
    consoleErrors: string[];
    networkFailures: NetworkFailure[];
    timestamp: string;
    reproSteps: string[];
    description: string;
}

export interface SuccessRecord {
    url: string;
    element?: ElementInfo;
    action: string;
    resultUrl?: string;
    timestamp: string;
}

export interface PageVisit {
    url: string;
    title: string;
    elementsFound: number;
    elementsClicked: number;
    failures: number;
    timestamp: string;
}

export interface CrawlState {
    visitedUrls: Set<string>;
    visitedInteractions: Set<string>;
    totalActions: number;
    currentDepth: number;
    failures: FailureRecord[];
    successes: SuccessRecord[];
    pageVisits: PageVisit[];
    consoleLog: ConsoleEntry[];
    networkLog: NetworkFailure[];
    actionHistory: string[];
    startTime: number;
}

export interface QueueItem {
    url: string;
    depth: number;
    fromElement?: string;
}

export interface ClickResult {
    success: boolean;
    navigated: boolean;
    newUrl?: string;
    modalOpened: boolean;
    failure?: FailureRecord;
}

export interface CrawlConfig {
    maxDepth: number;
    maxClicksPerPage: number;
    maxTotalActions: number;
    baseUrl: string;
    seedUrls: string[];
    destructiveKeywords: string[];
    networkIdleTimeout: number;
    loaderTimeout: number;
}

export const DEFAULT_CONFIG: CrawlConfig = {
    maxDepth: 6,
    maxClicksPerPage: 35,
    maxTotalActions: 500,
    baseUrl: process.env.PLAYWRIGHT_BASE_URL || 'https://floor-ops-pro.vercel.app',
    seedUrls: ['/landing', '/'],
    destructiveKeywords: [
        'delete', 'remove', 'destroy', 'cancel', 'refund',
        'charge', 'payment', 'reset', 'purge', 'logout',
        'sign out', 'sign-out', 'signout'
    ],
    networkIdleTimeout: 5000,
    loaderTimeout: 10000,
};
