'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePermissions } from './permission-context';
import { Loader2, Home } from 'lucide-react';

interface AuthGuardProps {
    children: React.ReactNode;
}

/**
 * AuthGuard protects dashboard routes by redirecting to landing page
 * if the user is not logged in. Allows access to /login page for signing in.
 */
export function AuthGuard({ children }: AuthGuardProps) {
    const { isLoaded, isLoggedIn } = usePermissions();
    const router = useRouter();
    const pathname = usePathname();

    const isLoginPage = pathname === '/login';

    useEffect(() => {
        // Only redirect after permissions are loaded
        if (isLoaded && !isLoggedIn && !isLoginPage) {
            router.replace('/landing');
        }
    }, [isLoaded, isLoggedIn, isLoginPage, router]);

    // Show loading while checking auth
    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center animate-pulse">
                        <Home className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    // If not logged in and not on login page, show loading while redirecting
    if (!isLoggedIn && !isLoginPage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center animate-pulse">
                        <Home className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Redirecting...</span>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
