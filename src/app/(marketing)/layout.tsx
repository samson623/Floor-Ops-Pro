'use client';

import { PermissionProvider } from '@/components/permission-context';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="dark">
            <PermissionProvider>
                {children}
            </PermissionProvider>
        </div>
    );
}
