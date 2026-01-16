import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Floor Ops Pro - The #1 Flooring Operations Platform',
    description: 'The all-in-one platform that helps flooring contractors manage projects, track materials, schedule crews, and close deals faster. Built by flooring pros, for flooring pros.',
    keywords: ['flooring software', 'contractor management', 'project management', 'flooring business', 'crew scheduling', 'estimating software'],
    openGraph: {
        title: 'Floor Ops Pro - Run Your Flooring Business Like a Pro',
        description: 'The all-in-one platform for modern flooring contractors. Manage projects, schedule crews, and grow your business.',
        type: 'website',
    },
};

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="dark">
            {children}
        </div>
    );
}
