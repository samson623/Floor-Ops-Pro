/**
 * Company Context - Multi-Tenancy Support
 * ========================================
 * Provides company-scoped data access for FloorOps Pro.
 * 
 * Features:
 * - Get current company ID for the user
 * - Fallback to default Tex Flooring company
 * - Utility to inject company_id into inserts
 * 
 * @author FloorOps Pro Engineering
 * @version 2.0.0
 */

import { getSupabaseClient } from './client';

// ============================================================
// CONSTANTS
// ============================================================

// Default company slug (Tex Flooring)
export const DEFAULT_COMPANY_SLUG = 'tex-flooring';

// Cache for company ID to avoid repeated queries
let cachedCompanyId: string | null = null;
let cachedDefaultCompanyId: string | null = null;

// ============================================================
// COMPANY CONTEXT FUNCTIONS
// ============================================================

/**
 * Get the default company ID (Tex Flooring)
 * This is cached after first fetch for performance
 */
export async function getDefaultCompanyId(): Promise<string | null> {
    if (cachedDefaultCompanyId) {
        return cachedDefaultCompanyId;
    }

    const client = getSupabaseClient();
    if (!client) {
        console.warn('Supabase not configured, cannot get default company ID');
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (client as any)
        .from('companies')
        .select('id')
        .eq('slug', DEFAULT_COMPANY_SLUG)
        .single();

    if (error) {
        console.error('Failed to get default company:', error);
        return null;
    }

    cachedDefaultCompanyId = data?.id || null;
    return cachedDefaultCompanyId;
}

/**
 * Get the current user's company ID
 * Falls back to default company if user has no company assigned
 */
export async function getCurrentCompanyId(): Promise<string | null> {
    if (cachedCompanyId) {
        return cachedCompanyId;
    }

    const client = getSupabaseClient();
    if (!client) {
        return getDefaultCompanyId();
    }

    // Try to get authenticated user's company
    const { data: { user } } = await client.auth.getUser();

    if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (client as any)
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();

        if (profile?.company_id) {
            cachedCompanyId = profile.company_id;
            return cachedCompanyId;
        }
    }

    // Fallback to default company
    return getDefaultCompanyId();
}

/**
 * Clear the company ID cache (call when user logs in/out)
 */
export function clearCompanyCache(): void {
    cachedCompanyId = null;
}

/**
 * Set the cached company ID directly (useful for testing or overrides)
 */
export function setCachedCompanyId(companyId: string): void {
    cachedCompanyId = companyId;
}

// ============================================================
// INSERT HELPER
// ============================================================

/**
 * Inject company_id into a data object for insert operations
 * This is the key utility for ensuring multi-tenancy on all inserts
 */
export async function withCompanyId<T extends Record<string, unknown>>(
    data: T
): Promise<T & { company_id: string }> {
    const companyId = await getCurrentCompanyId();

    if (!companyId) {
        console.warn('No company ID available, insert may fail RLS policies');
    }

    return {
        ...data,
        company_id: companyId || '',
    };
}

/**
 * Synchronous version for when company ID is already known
 */
export function withKnownCompanyId<T extends Record<string, unknown>>(
    data: T,
    companyId: string
): T & { company_id: string } {
    return {
        ...data,
        company_id: companyId,
    };
}

// ============================================================
// COMPANY INFO TYPES & FUNCTIONS
// ============================================================

export interface CompanyInfo {
    id: string;
    name: string;
    slug: string;
    owner_email: string;
    plan: 'starter' | 'pro' | 'enterprise';
    max_users: number;
    max_projects: number;
    is_active: boolean;
}

/**
 * Get full company information for the current user
 */
export async function getCurrentCompany(): Promise<CompanyInfo | null> {
    const companyId = await getCurrentCompanyId();
    if (!companyId) return null;

    const client = getSupabaseClient();
    if (!client) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (client as any)
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

    if (error) {
        console.error('Failed to get company info:', error);
        return null;
    }

    return data as CompanyInfo;
}
