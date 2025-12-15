'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
    User,
    UserRole,
    Permission,
    DEFAULT_USERS,
    can,
    canAny,
    canAll,
    canViewPricing,
    getProjectAccessType,
    getRoleInfo,
    RoleInfo
} from '@/lib/permissions';

// ══════════════════════════════════════════════════════════════════
// PERMISSION CONTEXT
// Enterprise-grade role-based access control for FloorOps Pro
// ══════════════════════════════════════════════════════════════════

interface PermissionContextType {
    // Current user state
    currentUser: User | null;
    isLoaded: boolean;

    // Permission checks
    can: (permission: Permission) => boolean;
    canAny: (permissions: Permission[]) => boolean;
    canAll: (permissions: Permission[]) => boolean;
    canViewPricing: () => boolean;

    // Project access
    canAccessProject: (projectId: number) => boolean;
    getAccessibleProjectIds: () => number[] | 'all';

    // User operations
    switchUser: (userId: number) => void;
    getAllUsers: () => User[];
    getUserById: (id: number) => User | undefined;
    updateUser: (id: number, updates: Partial<User>) => void;
    addUser: (user: Omit<User, 'id' | 'createdAt'>) => User;

    // Role info
    getCurrentRoleInfo: () => RoleInfo | null;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

const STORAGE_KEY = 'floorops_current_user_id';
const USERS_STORAGE_KEY = 'floorops_users';

export function PermissionProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                // Load users
                const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
                if (savedUsers) {
                    const parsed = JSON.parse(savedUsers);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setUsers(parsed);
                    }
                }

                // Load current user
                const savedUserId = localStorage.getItem(STORAGE_KEY);
                if (savedUserId) {
                    setCurrentUserId(parseInt(savedUserId, 10));
                } else {
                    // Default to owner for new sessions
                    setCurrentUserId(1);
                    localStorage.setItem(STORAGE_KEY, '1');
                }
            } catch (e) {
                console.error('Failed to load user state:', e);
                setCurrentUserId(1);
            }
            setIsLoaded(true);
        }
    }, []);

    // Save users to localStorage when changed
    useEffect(() => {
        if (isLoaded && typeof window !== 'undefined') {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }
    }, [users, isLoaded]);

    const currentUser = users.find(u => u.id === currentUserId) || null;

    const checkPermission = useCallback((permission: Permission): boolean => {
        if (!currentUser) return false;
        return can(currentUser.role, permission);
    }, [currentUser]);

    const checkAnyPermission = useCallback((permissions: Permission[]): boolean => {
        if (!currentUser) return false;
        return canAny(currentUser.role, permissions);
    }, [currentUser]);

    const checkAllPermissions = useCallback((permissions: Permission[]): boolean => {
        if (!currentUser) return false;
        return canAll(currentUser.role, permissions);
    }, [currentUser]);

    const checkCanViewPricing = useCallback((): boolean => {
        if (!currentUser) return false;
        return canViewPricing(currentUser.role);
    }, [currentUser]);

    const canAccessProject = useCallback((projectId: number): boolean => {
        if (!currentUser) return false;
        const accessType = getProjectAccessType(currentUser.role);
        if (accessType === 'all') return true;
        if (accessType === 'assigned') {
            return currentUser.assignedProjectIds.includes(projectId);
        }
        return false;
    }, [currentUser]);

    const getAccessibleProjectIds = useCallback((): number[] | 'all' => {
        if (!currentUser) return [];
        const accessType = getProjectAccessType(currentUser.role);
        if (accessType === 'all') return 'all';
        return currentUser.assignedProjectIds;
    }, [currentUser]);

    const switchUser = useCallback((userId: number) => {
        const user = users.find(u => u.id === userId);
        if (user && user.active) {
            setCurrentUserId(userId);
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, userId.toString());
            }
            // Update last login
            setUsers(prev => prev.map(u =>
                u.id === userId
                    ? { ...u, lastLoginAt: new Date().toISOString() }
                    : u
            ));
        }
    }, [users]);

    const getAllUsers = useCallback(() => users, [users]);

    const getUserById = useCallback((id: number) => users.find(u => u.id === id), [users]);

    const updateUser = useCallback((id: number, updates: Partial<User>) => {
        setUsers(prev => prev.map(u =>
            u.id === id ? { ...u, ...updates } : u
        ));
    }, []);

    const addUser = useCallback((userData: Omit<User, 'id' | 'createdAt'>): User => {
        const newUser: User = {
            ...userData,
            id: Math.max(...users.map(u => u.id)) + 1,
            createdAt: new Date().toISOString()
        };
        setUsers(prev => [...prev, newUser]);
        return newUser;
    }, [users]);

    const getCurrentRoleInfo = useCallback((): RoleInfo | null => {
        if (!currentUser) return null;
        return getRoleInfo(currentUser.role);
    }, [currentUser]);

    const value: PermissionContextType = {
        currentUser,
        isLoaded,
        can: checkPermission,
        canAny: checkAnyPermission,
        canAll: checkAllPermissions,
        canViewPricing: checkCanViewPricing,
        canAccessProject,
        getAccessibleProjectIds,
        switchUser,
        getAllUsers,
        getUserById,
        updateUser,
        addUser,
        getCurrentRoleInfo
    };

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
}

export function usePermissions(): PermissionContextType {
    const context = useContext(PermissionContext);
    if (context === undefined) {
        throw new Error('usePermissions must be used within a PermissionProvider');
    }
    return context;
}

// ══════════════════════════════════════════════════════════════════
// PERMISSION GATE COMPONENT
// Declarative permission-based rendering
// ══════════════════════════════════════════════════════════════════

interface PermissionGateProps {
    children: ReactNode;
    permission?: Permission;
    permissions?: Permission[];
    requireAll?: boolean;
    fallback?: ReactNode;
    projectId?: number;
}

/**
 * Conditionally render children based on permissions.
 * 
 * @example
 * // Single permission
 * <PermissionGate permission="VIEW_PRICING">
 *   <PriceDisplay value={1000} />
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions (any)
 * <PermissionGate permissions={['CREATE_PUNCH_ITEM', 'EDIT_PUNCH_ITEM']}>
 *   <PunchItemForm />
 * </PermissionGate>
 * 
 * @example
 * // With project access check
 * <PermissionGate permission="VIEW_PHOTOS" projectId={project.id}>
 *   <PhotoGallery />
 * </PermissionGate>
 */
export function PermissionGate({
    children,
    permission,
    permissions,
    requireAll = false,
    fallback = null,
    projectId
}: PermissionGateProps) {
    const { can, canAny, canAll, canAccessProject, isLoaded } = usePermissions();

    if (!isLoaded) return null;

    // Check project access if projectId provided
    if (projectId !== undefined && !canAccessProject(projectId)) {
        return <>{fallback}</>;
    }

    // Check permissions
    if (permission) {
        if (!can(permission)) return <>{fallback}</>;
    } else if (permissions && permissions.length > 0) {
        const hasPermission = requireAll
            ? canAll(permissions)
            : canAny(permissions);
        if (!hasPermission) return <>{fallback}</>;
    }

    return <>{children}</>;
}

// ══════════════════════════════════════════════════════════════════
// PRICING DISPLAY COMPONENT
// Shows price or hides based on permission
// ══════════════════════════════════════════════════════════════════

interface PriceDisplayProps {
    value: number;
    className?: string;
    format?: 'currency' | 'percent';
    hiddenText?: string;
}

/**
 * Display a monetary value only if user has pricing permission.
 * Shows a placeholder for unauthorized users.
 */
export function PriceDisplay({
    value,
    className = '',
    format = 'currency',
    hiddenText = '—'
}: PriceDisplayProps) {
    const { canViewPricing, isLoaded } = usePermissions();

    if (!isLoaded) return <span className={className}>...</span>;

    if (!canViewPricing()) {
        return <span className={`${className} text-muted-foreground/50 italic`}>{hiddenText}</span>;
    }

    const formatted = format === 'currency'
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
        : `${value.toFixed(1)}%`;

    return <span className={className}>{formatted}</span>;
}
