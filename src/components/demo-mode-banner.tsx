'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePermissions } from './permission-context';
import { useState } from 'react';

/**
 * Persistent banner shown when user is in demo mode.
 * Displays demo status and provides exit option.
 */
export function DemoModeBanner() {
    const { isDemoMode, signOut } = usePermissions();
    const router = useRouter();
    const [isDismissed, setIsDismissed] = useState(false);

    const handleExitDemo = () => {
        signOut();
        router.push('/landing');
    };

    if (!isDemoMode || isDismissed) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600"
            >
                <div className="max-w-7xl mx-auto px-4 py-2">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left: Demo mode indicator */}
                        <div className="flex items-center gap-3 text-white text-sm">
                            <span className="text-lg">🎭</span>
                            <span className="font-medium">
                                Demo Mode
                            </span>
                            <span className="hidden sm:inline text-white/80">
                                — Exploring Floor Ops Pro (changes won&apos;t be saved)
                            </span>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                            {/* Exit Demo button */}
                            <button
                                onClick={handleExitDemo}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Exit Demo</span>
                            </button>

                            {/* Dismiss button */}
                            <button
                                onClick={() => setIsDismissed(true)}
                                className="p-1 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                                aria-label="Dismiss banner"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

/**
 * Spacer component to offset content when demo banner is visible.
 * Should be placed at the top of page layouts.
 */
export function DemoModeBannerSpacer() {
    const { isDemoMode } = usePermissions();

    if (!isDemoMode) return null;

    return <div className="h-10" />;
}
