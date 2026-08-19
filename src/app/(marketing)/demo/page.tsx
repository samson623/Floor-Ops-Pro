'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Hammer, Sparkles, Loader2 } from 'lucide-react';
import { usePermissions } from '@/components/permission-context';

const DEMO_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: (i * 43) % 100,
    top: (i * 67) % 100,
    duration: 3 + (i % 5) * 0.4,
    delay: (i % 8) * 0.2,
}));

export default function DemoPage() {
    const router = useRouter();
    const { signInAsDemo, isLoaded, isDemoMode } = usePermissions();
    const [stage, setStage] = useState<'entering' | 'ready'>('entering');
    const hasSignedIn = useRef(false);

    // Step 1: Sign in as demo user when loaded
    useEffect(() => {
        if (!isLoaded || hasSignedIn.current) return;
        hasSignedIn.current = true;
        signInAsDemo();
    }, [isLoaded, signInAsDemo]);

    // Step 2: Only redirect AFTER isDemoMode becomes true (confirming sign-in succeeded)
    useEffect(() => {
        if (!isDemoMode) return;

        // Show animation stages, then redirect
        const stageTimer = setTimeout(() => {
            setStage('ready');
        }, 1000);

        const redirectTimer = setTimeout(() => {
            router.push('/dashboard');
        }, 2000);

        return () => {
            clearTimeout(stageTimer);
            clearTimeout(redirectTimer);
        };
    }, [isDemoMode, router]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-background to-cyan-600/20" />

            {/* Animated particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {DEMO_PARTICLES.map(particle => (
                    <motion.div
                        key={particle.id}
                        className="absolute w-2 h-2 rounded-full bg-primary/30"
                        style={{ left: `${particle.left}%`, top: `${particle.top}%` }}
                        initial={{ x: 0, y: 0 }}
                        animate={{
                            x: [0, 10, -8, 0],
                            y: [null, -100],
                            opacity: [0.3, 0]
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            delay: particle.delay
                        }}
                    />
                ))}
            </div>

            {/* Main content */}
            <motion.div
                className="relative z-10 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Logo */}
                <motion.div
                    className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-primary/40"
                    animate={{
                        scale: [1, 1.05, 1],
                        rotate: stage === 'ready' ? [0, 5, -5, 0] : 0
                    }}
                    transition={{
                        duration: 2,
                        repeat: stage === 'entering' ? Infinity : 0,
                        ease: "easeInOut"
                    }}
                >
                    <Hammer className="w-12 h-12 text-white" />
                </motion.div>

                {/* Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h1 className="text-3xl font-bold mb-2">
                        {stage === 'entering' ? 'Entering Demo Mode' : 'Welcome to Floor Ops Pro!'}
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        {stage === 'entering'
                            ? 'Preparing your demo experience...'
                            : 'Explore everything • Changes won\'t be saved'
                        }
                    </p>
                </motion.div>

                {/* Loading indicator */}
                <motion.div
                    className="flex items-center justify-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {stage === 'entering' ? (
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Sparkles className="w-6 h-6 text-primary" />
                        </motion.div>
                    )}
                    <span className="text-sm text-muted-foreground">
                        {stage === 'entering' ? 'Loading demo data...' : 'Redirecting to dashboard...'}
                    </span>
                </motion.div>

                {/* Demo mode badge */}
                <motion.div
                    className="mt-12 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-primary/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <span className="text-xl">🎭</span>
                    <span className="text-sm font-medium text-primary">Demo Mode Active</span>
                </motion.div>
            </motion.div>
        </div>
    );
}
