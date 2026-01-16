'use client';

import { useSmartBack } from '@/hooks/use-smart-back';
import { IntelligenceCenter } from '@/components/intelligence-center';

export default function Page() {
    // Record this page in navigation history for smart back navigation
    useSmartBack({ title: 'Intelligence Center' });

    return <IntelligenceCenter />;
}
