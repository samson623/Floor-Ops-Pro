'use client';

import { usePathname } from 'next/navigation';
import { DataProvider } from "@/components/data-provider";
import { PermissionProvider } from "@/components/permission-context";
import { AuthGuard } from "@/components/auth-guard";
import { Sidebar } from "@/components/sidebar";
import { AIPanel } from "@/components/ai-panel";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname?.startsWith('/login');

    return (
        <DataProvider>
            <PermissionProvider>
                <AuthGuard>
                    {/* Demo Banner removed - integrated into TopBar */}
                    <div className="flex min-h-screen bg-background">
                        {!isLoginPage && <Sidebar />}
                        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
                            {children}
                        </main>
                    </div>
                    {!isLoginPage && <AIPanel />}
                    {!isLoginPage && <ScrollToTopButton />}
                </AuthGuard >
            </PermissionProvider >
        </DataProvider >
    );
}

