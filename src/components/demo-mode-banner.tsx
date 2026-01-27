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

    if (!isDemoMode) return null;

    return (
        <AnimatePresence mode="wait">
            {!isDismissed ? (
                /* 1. Full Banner State */
                <motion.div
                    key="banner"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 shadow-lg"
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
                                    — You are viewing sample data
                                </span>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleExitDemo}
                                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Exit</span>
                                </button>

                                {/* Dismiss button - Minimizes to FAB */}
                                <button
                                    onClick={() => setIsDismissed(true)}
                                    className="p-1 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                                    aria-label="Minimize banner"
                                    title="Minimize to button"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ) : (
                /* 2. Minimized Floating Button State */
                <motion.button
                    key="fab"
                    onClick={handleExitDemo}
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 20 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="fixed bottom-6 left-6 z-[200] flex items-center gap-2 px-4 py-3 rounded-full 
                               bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30
                               hover:shadow-xl hover:shadow-violet-500/40 border border-white/10"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium text-sm">Exit Demo</span>
                </motion.button>
            )}
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
