'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

/**
 * A premium floating scroll-to-top button with physics-based animations.
 * Features:
 * - Spring physics for organic feel
 * - Pulsing glow effect on hover
 * - Smooth fade + scale entrance
 * - Respects prefers-reduced-motion
 * - Full keyboard accessibility
 */
export function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const shouldReduceMotion = useReducedMotion();

    // Throttled scroll handler for performance
    const handleScroll = useCallback(() => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        setIsVisible(scrollY > 300);
    }, []);

    useEffect(() => {
        // Use passive listener for scroll performance
        let ticking = false;

        const throttledScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', throttledScroll, { passive: true });
        // Initial check
        handleScroll();

        return () => window.removeEventListener('scroll', throttledScroll);
    }, [handleScroll]);

    const scrollToTop = useCallback(() => {
        window.scrollTo({
            top: 0,
            behavior: shouldReduceMotion ? 'auto' : 'smooth',
        });
    }, [shouldReduceMotion]);

    // Spring physics configuration
    const springConfig = {
        type: 'spring' as const,
        stiffness: 400,
        damping: 25,
        mass: 0.8,
    };

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.button
                    key="scroll-to-top"
                    onClick={scrollToTop}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    aria-label="Scroll to top"
                    className="fixed bottom-6 right-6 z-50 group"
                    // Entrance animation
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    transition={shouldReduceMotion ? { duration: 0.1 } : springConfig}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                >
                    {/* Outer glow ring - pulses on hover */}
                    <motion.span
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30"
                        initial={{ scale: 1, opacity: 0 }}
                        animate={
                            isHovered && !shouldReduceMotion
                                ? {
                                    scale: [1, 1.4, 1.2],
                                    opacity: [0, 0.6, 0],
                                }
                                : { scale: 1, opacity: 0 }
                        }
                        transition={{
                            duration: 1.5,
                            repeat: isHovered ? Infinity : 0,
                            ease: 'easeInOut',
                        }}
                    />

                    {/* Main button body */}
                    <span
                        className="relative flex items-center justify-center size-12 rounded-full 
                       bg-gradient-to-br from-primary to-primary/80
                       shadow-lg shadow-primary/25
                       border border-primary-foreground/10
                       transition-shadow duration-300
                       group-hover:shadow-xl group-hover:shadow-primary/40
                       group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2
                       group-active:shadow-md"
                    >
                        {/* Arrow icon with bounce animation */}
                        <motion.span
                            animate={
                                isHovered && !shouldReduceMotion
                                    ? { y: [0, -3, 0] }
                                    : { y: 0 }
                            }
                            transition={{
                                duration: 0.6,
                                repeat: isHovered ? Infinity : 0,
                                ease: 'easeInOut',
                            }}
                        >
                            <ArrowUp
                                className="size-5 text-primary-foreground stroke-[2.5]"
                                aria-hidden="true"
                            />
                        </motion.span>
                    </span>

                    {/* Tooltip - appears on hover */}
                    <AnimatePresence>
                        {isHovered && !shouldReduceMotion && (
                            <motion.span
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-full mr-3 top-1/2 -translate-y-1/2
                           px-3 py-1.5 rounded-md text-xs font-medium
                           bg-popover text-popover-foreground
                           shadow-md border border-border
                           whitespace-nowrap pointer-events-none"
                            >
                                Back to top
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>
            )}
        </AnimatePresence>
    );
}
