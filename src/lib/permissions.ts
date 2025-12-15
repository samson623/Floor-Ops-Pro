// ══════════════════════════════════════════════════════════════════
// ROLE-BASED ACCESS CONTROL SYSTEM
// FloorOps Pro - Enterprise Permissions Framework
// ══════════════════════════════════════════════════════════════════

/**
 * User roles in the flooring operations hierarchy.
 * Each role has distinct responsibilities and access levels.
 */
export type UserRole = 'owner' | 'pm' | 'foreman' | 'installer' | 'office_admin' | 'sub';

export interface RoleInfo {
    role: UserRole;
    label: string;
    description: string;
    color: string;
    icon: string;
}

export const ROLE_DEFINITIONS: Record<UserRole, Omit<RoleInfo, 'role'>> = {
    owner: {
        label: 'Owner',
        description: 'Full access to all features, financials, and team management',
        color: 'hsl(262, 83%, 58%)', // Purple
        icon: '👑'
    },
    pm: {
        label: 'Project Manager',
        description: 'Manages projects, schedules, and client relationships',
        color: 'hsl(221, 83%, 53%)', // Blue
        icon: '📋'
    },
    foreman: {
        label: 'Foreman',
        description: 'Leads field crews, manages daily operations and punch lists',
        color: 'hsl(142, 76%, 36%)', // Green
        icon: '🔧'
    },
    installer: {
        label: 'Installer',
        description: 'Field technician - updates progress, photos, and punch items',
        color: 'hsl(38, 92%, 50%)', // Orange
        icon: '🛠️'
    },
    office_admin: {
        label: 'Office Admin',
        description: 'Handles invoicing, scheduling coordination, and documentation',
        color: 'hsl(328, 85%, 46%)', // Pink
        icon: '💼'
    },
    sub: {
        label: 'Subcontractor',
        description: 'External contractor with limited access to assigned work',
        color: 'hsl(199, 89%, 48%)', // Cyan
        icon: '🤝'
    }
};

/**
 * Granular permissions for fine-grained access control.
 * Permissions are organized by feature area.
 */
export type Permission =
    // Financial Permissions
    | 'VIEW_PRICING'
    | 'VIEW_BUDGET'
    | 'EDIT_BUDGET'
    | 'VIEW_MARGINS'
    | 'APPROVE_EXPENSES'

    // Project Permissions
    | 'VIEW_ALL_PROJECTS'
    | 'VIEW_ASSIGNED_PROJECTS'
    | 'CREATE_PROJECT'
    | 'EDIT_PROJECT'
    | 'DELETE_PROJECT'

    // Estimates & Sales
    | 'VIEW_ESTIMATES'
    | 'CREATE_ESTIMATE'
    | 'EDIT_ESTIMATE'
    | 'SEND_ESTIMATE'
    | 'APPROVE_ESTIMATE'

    // Punch List
    | 'VIEW_PUNCH_LIST'
    | 'CREATE_PUNCH_ITEM'
    | 'EDIT_PUNCH_ITEM'
    | 'COMPLETE_PUNCH_ITEM'
    | 'DELETE_PUNCH_ITEM'

    // Photos & Documentation
    | 'VIEW_PHOTOS'
    | 'UPLOAD_PHOTOS'
    | 'DELETE_PHOTOS'

    // Daily Logs
    | 'VIEW_DAILY_LOGS'
    | 'CREATE_DAILY_LOG'
    | 'EDIT_DAILY_LOG'

    // Change Orders
    | 'VIEW_CHANGE_ORDERS'
    | 'CREATE_CHANGE_ORDER'
    | 'SUBMIT_CHANGE_ORDER'
    | 'APPROVE_CHANGE_ORDER'

    // Schedule
    | 'VIEW_SCHEDULE'
    | 'EDIT_SCHEDULE'
    | 'ASSIGN_CREWS'

    // Materials & Inventory
    | 'VIEW_MATERIALS'
    | 'MANAGE_MATERIALS'
    | 'CREATE_PO'
    | 'APPROVE_PO'
    | 'RECEIVE_DELIVERY'

    // Invoicing
    | 'VIEW_CLIENT_INVOICES'
    | 'CREATE_CLIENT_INVOICE'
    | 'SEND_INVOICE'
    | 'VIEW_SUB_INVOICES'
    | 'SUBMIT_SUB_INVOICE'
    | 'APPROVE_SUB_INVOICE'

    // Walkthroughs
    | 'VIEW_WALKTHROUGHS'
    | 'CREATE_WALKTHROUGH'
    | 'CONDUCT_WALKTHROUGH'
    | 'SIGN_OFF_PROJECT'

    // Team Management
    | 'VIEW_TEAM'
    | 'MANAGE_USERS'
    | 'ASSIGN_USERS'

    // Communication
    | 'VIEW_ALL_MESSAGES'
    | 'VIEW_PROJECT_MESSAGES'
    | 'SEND_MESSAGES';

/**
 * Permission sets for each role.
 * Carefully designed based on flooring industry best practices.
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    owner: [
        // Full access to everything
        'VIEW_PRICING', 'VIEW_BUDGET', 'EDIT_BUDGET', 'VIEW_MARGINS', 'APPROVE_EXPENSES',
        'VIEW_ALL_PROJECTS', 'CREATE_PROJECT', 'EDIT_PROJECT', 'DELETE_PROJECT',
        'VIEW_ESTIMATES', 'CREATE_ESTIMATE', 'EDIT_ESTIMATE', 'SEND_ESTIMATE', 'APPROVE_ESTIMATE',
        'VIEW_PUNCH_LIST', 'CREATE_PUNCH_ITEM', 'EDIT_PUNCH_ITEM', 'COMPLETE_PUNCH_ITEM', 'DELETE_PUNCH_ITEM',
        'VIEW_PHOTOS', 'UPLOAD_PHOTOS', 'DELETE_PHOTOS',
        'VIEW_DAILY_LOGS', 'CREATE_DAILY_LOG', 'EDIT_DAILY_LOG',
        'VIEW_CHANGE_ORDERS', 'CREATE_CHANGE_ORDER', 'SUBMIT_CHANGE_ORDER', 'APPROVE_CHANGE_ORDER',
        'VIEW_SCHEDULE', 'EDIT_SCHEDULE', 'ASSIGN_CREWS',
        'VIEW_MATERIALS', 'MANAGE_MATERIALS', 'CREATE_PO', 'APPROVE_PO', 'RECEIVE_DELIVERY',
        'VIEW_CLIENT_INVOICES', 'CREATE_CLIENT_INVOICE', 'SEND_INVOICE',
        'VIEW_SUB_INVOICES', 'SUBMIT_SUB_INVOICE', 'APPROVE_SUB_INVOICE',
        'VIEW_WALKTHROUGHS', 'CREATE_WALKTHROUGH', 'CONDUCT_WALKTHROUGH', 'SIGN_OFF_PROJECT',
        'VIEW_TEAM', 'MANAGE_USERS', 'ASSIGN_USERS',
        'VIEW_ALL_MESSAGES', 'SEND_MESSAGES'
    ],

    pm: [
        // Full financial visibility, project management
        'VIEW_PRICING', 'VIEW_BUDGET', 'VIEW_MARGINS',
        'VIEW_ALL_PROJECTS', 'CREATE_PROJECT', 'EDIT_PROJECT',
        'VIEW_ESTIMATES', 'CREATE_ESTIMATE', 'EDIT_ESTIMATE', 'SEND_ESTIMATE',
        'VIEW_PUNCH_LIST', 'CREATE_PUNCH_ITEM', 'EDIT_PUNCH_ITEM', 'COMPLETE_PUNCH_ITEM',
        'VIEW_PHOTOS', 'UPLOAD_PHOTOS',
        'VIEW_DAILY_LOGS', 'CREATE_DAILY_LOG', 'EDIT_DAILY_LOG',
        'VIEW_CHANGE_ORDERS', 'CREATE_CHANGE_ORDER', 'SUBMIT_CHANGE_ORDER',
        'VIEW_SCHEDULE', 'EDIT_SCHEDULE', 'ASSIGN_CREWS',
        'VIEW_MATERIALS', 'MANAGE_MATERIALS', 'CREATE_PO', 'RECEIVE_DELIVERY',
        'VIEW_CLIENT_INVOICES', 'CREATE_CLIENT_INVOICE',
        'VIEW_SUB_INVOICES', 'APPROVE_SUB_INVOICE',
        'VIEW_WALKTHROUGHS', 'CREATE_WALKTHROUGH', 'CONDUCT_WALKTHROUGH', 'SIGN_OFF_PROJECT',
        'VIEW_TEAM', 'ASSIGN_USERS',
        'VIEW_ALL_MESSAGES', 'SEND_MESSAGES'
    ],

    foreman: [
        // Field operations - NO pricing/financial access
        'VIEW_ASSIGNED_PROJECTS',
        'VIEW_PUNCH_LIST', 'CREATE_PUNCH_ITEM', 'EDIT_PUNCH_ITEM', 'COMPLETE_PUNCH_ITEM',
        'VIEW_PHOTOS', 'UPLOAD_PHOTOS',
        'VIEW_DAILY_LOGS', 'CREATE_DAILY_LOG', 'EDIT_DAILY_LOG',
        'VIEW_CHANGE_ORDERS', 'CREATE_CHANGE_ORDER', // Can flag issues, PM approves
        'VIEW_SCHEDULE',
        'VIEW_MATERIALS', 'RECEIVE_DELIVERY',
        'VIEW_WALKTHROUGHS', 'CONDUCT_WALKTHROUGH',
        'VIEW_TEAM',
        'VIEW_PROJECT_MESSAGES', 'SEND_MESSAGES'
    ],

    installer: [
        // Field work - punch, photos, basic logs
        'VIEW_ASSIGNED_PROJECTS',
        'VIEW_PUNCH_LIST', 'CREATE_PUNCH_ITEM', 'COMPLETE_PUNCH_ITEM',
        'VIEW_PHOTOS', 'UPLOAD_PHOTOS',
        'VIEW_DAILY_LOGS',
        'VIEW_CHANGE_ORDERS',
        'VIEW_SCHEDULE',
        'VIEW_MATERIALS',
        'VIEW_WALKTHROUGHS', 'CONDUCT_WALKTHROUGH',
        'VIEW_PROJECT_MESSAGES', 'SEND_MESSAGES'
    ],

    office_admin: [
        // Administrative - full visibility, limited operations
        'VIEW_PRICING', 'VIEW_BUDGET', 'VIEW_MARGINS',
        'VIEW_ALL_PROJECTS',
        'VIEW_ESTIMATES', 'CREATE_ESTIMATE', 'EDIT_ESTIMATE', 'SEND_ESTIMATE',
        'VIEW_PUNCH_LIST',
        'VIEW_PHOTOS',
        'VIEW_DAILY_LOGS',
        'VIEW_CHANGE_ORDERS',
        'VIEW_SCHEDULE',
        'VIEW_MATERIALS', 'MANAGE_MATERIALS', 'CREATE_PO',
        'VIEW_CLIENT_INVOICES', 'CREATE_CLIENT_INVOICE', 'SEND_INVOICE',
        'VIEW_SUB_INVOICES',
        'VIEW_WALKTHROUGHS',
        'VIEW_TEAM',
        'VIEW_ALL_MESSAGES', 'SEND_MESSAGES'
    ],

    sub: [
        // Subcontractor - limited to assigned work
        'VIEW_ASSIGNED_PROJECTS',
        'VIEW_PHOTOS',
        'VIEW_SCHEDULE',
        'VIEW_MATERIALS',
        'VIEW_SUB_INVOICES', 'SUBMIT_SUB_INVOICE',
        'VIEW_PROJECT_MESSAGES', 'SEND_MESSAGES'
    ]
};

/**
 * Check if a role has a specific permission.
 */
export function can(role: UserRole, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has ALL of the specified permissions.
 */
export function canAll(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every(p => can(role, p));
}

/**
 * Check if a role has ANY of the specified permissions.
 */
export function canAny(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some(p => can(role, p));
}

/**
 * Get the effective project access type for a role.
 */
export function getProjectAccessType(role: UserRole): 'all' | 'assigned' | 'none' {
    if (can(role, 'VIEW_ALL_PROJECTS')) return 'all';
    if (can(role, 'VIEW_ASSIGNED_PROJECTS')) return 'assigned';
    return 'none';
}

/**
 * Check if role can view financial/pricing information.
 */
export function canViewPricing(role: UserRole): boolean {
    return can(role, 'VIEW_PRICING');
}

/**
 * Check if role can modify punch list items.
 */
export function canEditPunchList(role: UserRole): boolean {
    return canAny(role, ['CREATE_PUNCH_ITEM', 'EDIT_PUNCH_ITEM', 'COMPLETE_PUNCH_ITEM']);
}

/**
 * Check if role has team management capabilities.
 */
export function canManageTeam(role: UserRole): boolean {
    return can(role, 'MANAGE_USERS');
}

/**
 * Get display-friendly role info.
 */
export function getRoleInfo(role: UserRole): RoleInfo {
    return {
        role,
        ...ROLE_DEFINITIONS[role]
    };
}

/**
 * Get all roles sorted by hierarchy level.
 */
export function getAllRoles(): RoleInfo[] {
    const order: UserRole[] = ['owner', 'pm', 'foreman', 'installer', 'office_admin', 'sub'];
    return order.map(role => getRoleInfo(role));
}

// ══════════════════════════════════════════════════════════════════
// USER INTERFACE
// ══════════════════════════════════════════════════════════════════

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    avatar?: string;
    assignedProjectIds: number[];
    assignedCrewIds: string[];
    active: boolean;
    createdAt: string;
    lastLoginAt?: string;
}

/**
 * Default users for demo mode - representing typical flooring company structure.
 */
export const DEFAULT_USERS: User[] = [
    {
        id: 1,
        name: 'Derek Morrison',
        email: 'derek@floorops.com',
        phone: '(555) 100-0001',
        role: 'owner',
        assignedProjectIds: [],
        assignedCrewIds: [],
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
        lastLoginAt: new Date().toISOString()
    },
    {
        id: 2,
        name: 'Sarah Chen',
        email: 'sarah@floorops.com',
        phone: '(555) 100-0002',
        role: 'pm',
        assignedProjectIds: [1, 2, 3],
        assignedCrewIds: ['crew-a', 'crew-b'],
        active: true,
        createdAt: '2024-01-15T00:00:00Z'
    },
    {
        id: 3,
        name: 'Mike Rodriguez',
        email: 'mike@floorops.com',
        phone: '(555) 100-0003',
        role: 'foreman',
        assignedProjectIds: [1, 2],
        assignedCrewIds: ['crew-a'],
        active: true,
        createdAt: '2024-02-01T00:00:00Z'
    },
    {
        id: 4,
        name: 'James Wilson',
        email: 'james@floorops.com',
        phone: '(555) 100-0004',
        role: 'installer',
        assignedProjectIds: [1],
        assignedCrewIds: ['crew-a'],
        active: true,
        createdAt: '2024-02-15T00:00:00Z'
    },
    {
        id: 5,
        name: 'Emily Parker',
        email: 'emily@floorops.com',
        phone: '(555) 100-0005',
        role: 'office_admin',
        assignedProjectIds: [],
        assignedCrewIds: [],
        active: true,
        createdAt: '2024-03-01T00:00:00Z'
    },
    {
        id: 6,
        name: 'Tony Martinez',
        email: 'tony@precision-tile.com',
        phone: '(555) 200-0001',
        role: 'sub',
        assignedProjectIds: [2],
        assignedCrewIds: [],
        active: true,
        createdAt: '2024-03-15T00:00:00Z'
    }
];
