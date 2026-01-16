'use client';

import { usePathname } from 'next/navigation';
import { DataProvider } from "@/components/data-provider";
import { PermissionProvider } from "@/components/permission-context";
import { Sidebar } from "@/components/sidebar";
import { AIPanel } from "@/components/ai-panel";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    return (
        <DataProvider>
            <PermissionProvider>
                <div className="flex min-h-screen bg-background">
                    {!isLoginPage && <Sidebar />}
                    <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        {children}
                    </main>
                </div>
                {!isLoginPage && <AIPanel />}
            </PermissionProvider>
        </DataProvider>
    );
}
