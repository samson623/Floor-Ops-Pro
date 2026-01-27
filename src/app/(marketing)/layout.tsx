'use client';

import { PermissionProvider } from '@/components/permission-context';
import { ScrollToTopButton } from '@/components/ui/scroll-to-top';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="dark">
            <PermissionProvider>
                {children}
                <ScrollToTopButton />
            </PermissionProvider>
        </div>
    );
}

