/**
 * Supabase Client Configuration
 * =============================
 * Enterprise-grade Supabase client with:
 * - Browser client for client-side operations
 * - Server client for API routes
 * - Automatic session refresh
 * - Type-safe database queries
 * 
 * @author FloorOps Pro Engineering
 * @version 2.0.0
 */

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { Database } from './types';

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '⚠️ Supabase credentials not configured. Running in demo mode.\n' +
        'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
}

/**
 * Browser-side Supabase client
 * Used for all client-side operations
 */
export function createClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        return null;
    }

    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
        global: {
            headers: {
                'x-application-name': 'floorops-pro',
            },
        },
    });
}

/**
 * Server-side Supabase client for API routes
 * Requires cookies for session management
 */
export function createServerSupabaseClient(cookieStore: {
    get: (name: string) => { value: string } | undefined;
    set: (name: string, value: string, options: Record<string, unknown>) => void;
}) {
    if (!supabaseUrl || !supabaseAnonKey) {
        return null;
    }

    return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: Record<string, unknown>) {
                cookieStore.set(name, value, options);
            },
            remove(name: string, options: Record<string, unknown>) {
                cookieStore.set(name, '', options);
            },
        },
    });
}

/**
 * Singleton browser client for use in hooks
 */
let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
    if (typeof window === 'undefined') {
        throw new Error('getSupabaseClient must only be called on the client side');
    }

    if (!browserClient) {
        browserClient = createClient();
    }

    return browserClient;
}

/**
 * Check if Supabase is configured and available
 */
export function isSupabaseConfigured(): boolean {
    return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Type helper for flexible table access
 * Use this when you need to access tables not fully typed in Database interface
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySupabaseClient = ReturnType<typeof createClient> extends infer T
    ? T extends null ? null : { from: (table: string) => any } & T
    : never;

export function getFlexibleClient(): AnySupabaseClient {
    return getSupabaseClient() as AnySupabaseClient;
}
