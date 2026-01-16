'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, ArrowRight, Sparkles, BarChart3, Calendar, Users,
    Zap, Shield, Clock, Building2, Hammer, ClipboardCheck,
    DollarSign, Play, MessageSquare, PhoneCall, Mail, ChevronDown,
    Bot, Cloud, Smartphone, RefreshCw, Lock, Layers, Rocket
} from 'lucide-react';
import './landing-animations.css';

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED GRADIENT MESH BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════

function GradientMeshBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-violet-600/30 via-purple-500/20 to-transparent blur-[120px] animate-gradient-mesh-1" />
            <div className="absolute bottom-[-30%] right-[-20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tl from-cyan-500/25 via-blue-500/15 to-transparent blur-[150px] animate-gradient-mesh-2" />
            <div className="absolute top-[40%] left-[50%] w-[50%] h-[50%] rounded-full bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent blur-[100px] animate-gradient-mesh-3" />
            <div className="absolute inset-0 noise-overlay opacity-50" />
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING PARTICLES
// ═══════════════════════════════════════════════════════════════════════════

function FloatingParticles() {
    const [particles, setParticles] = useState<Array<{ id: number; left: number; top: number; size: number; delay: number; duration: number }>>([]);

    useEffect(() => {
        setParticles(
            [...Array(30)].map((_, i) => ({
                id: i,
                left: Math.random() * 100,
                top: Math.random() * 100,
                size: 2 + Math.random() * 4,
                delay: Math.random() * 5,
                duration: 5 + Math.random() * 10
            }))
        );
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-gradient-to-r from-violet-400/40 to-cyan-400/40"
                    style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
                    animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
                />
            ))}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL INDICATOR
// ═══════════════════════════════════════════════════════════════════════════

function ScrollIndicator() {
    return (
        <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
        >
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Scroll to explore</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                <ChevronDown className="w-5 h-5 text-primary" />
            </motion.div>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// CAPABILITY BADGE (replaces fake stats)
// ═══════════════════════════════════════════════════════════════════════════

function CapabilityBadge({ icon: Icon, label, description }: { icon: React.ElementType; label: string; description: string }) {
    return (
        <motion.div
            className="relative group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
            <div className="relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-primary/30 transition-all duration-500 text-center">
                <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-lg font-semibold mb-1">{label}</div>
                <div className="text-muted-foreground text-sm">{description}</div>
            </div>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3D TILT FEATURE CARD
// ═══════════════════════════════════════════════════════════════════════════

function FeatureCard({ icon: Icon, title, description, index }: { icon: React.ElementType; title: string; description: string; index: number }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        setRotateX((y - centerY) / 20);
        setRotateY((centerX - x) / 20);
    };

    const handleMouseLeave = () => { setRotateX(0); setRotateY(0); };

    return (
        <motion.div
            ref={cardRef}
            className="group relative"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`, transformStyle: 'preserve-3d' }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
            <div className="relative p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl hover:border-primary/40 transition-all duration-500 h-full">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <motion.div
                    className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <Icon className="w-8 h-8 text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{description}</p>
                <motion.div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" initial={{ x: -10 }} whileHover={{ x: 0 }}>
                    Learn more <ArrowRight className="w-4 h-4 ml-2" />
                </motion.div>
            </div>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// PRICING CARD
// ═══════════════════════════════════════════════════════════════════════════

function PricingCard({ name, price, period, description, features, popular = false, cta = "Get Started", delay = 0 }: {
    name: string; price: number; period: string; description: string; features: string[]; popular?: boolean; cta?: string; delay?: number;
}) {
    return (
        <motion.div
            className={`relative h-full ${popular ? 'z-10' : ''}`}
            initial={{ opacity: 0, y: 50, scale: popular ? 1 : 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
        >
            {popular && (
                <div className="absolute -inset-[2px] bg-gradient-to-r from-violet-500 via-cyan-500 to-emerald-500 rounded-[28px] blur-sm animate-glow-pulse" />
            )}
            <div className={`relative p-8 rounded-3xl h-full ${popular ? 'bg-gradient-to-br from-violet-900/50 via-card to-cyan-900/30 border-2 border-primary/50' : 'bg-gradient-to-br from-card/80 to-card/40 border border-white/10'}`}>
                {popular && (
                    <motion.div
                        className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full text-sm font-bold text-white shadow-lg shadow-primary/30"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                    >
                        <Sparkles className="w-4 h-4 inline mr-2" />Recommended
                    </motion.div>
                )}
                <div className="mb-6 pt-2">
                    <h3 className="text-2xl font-bold mb-2">{name}</h3>
                    <p className="text-muted-foreground text-sm">{description}</p>
                </div>
                <div className="mb-8">
                    <span className="text-5xl font-bold gradient-text-animated">${price.toLocaleString()}</span>
                    <span className="text-muted-foreground ml-2">/{period}</span>
                </div>
                <ul className="space-y-4 mb-8">
                    {features.map((feature, i) => (
                        <motion.li key={i} className="flex items-start gap-3" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: delay + 0.1 * i }}>
                            <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                            <span className="text-foreground/90">{feature}</span>
                        </motion.li>
                    ))}
                </ul>
                <motion.button className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${popular ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:shadow-xl hover:shadow-primary/30' : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50'}`} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    {cta}<ArrowRight className="w-5 h-5 inline ml-2" />
                </motion.button>
            </div>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// AI CHAT DEMO
// ═══════════════════════════════════════════════════════════════════════════

function AIChatDemo() {
    const [currentMessage, setCurrentMessage] = useState(0);
    const messages = [
        { type: 'user', text: "What's our revenue this quarter?" },
        { type: 'ai', text: "Your Q4 revenue is $847,250, up 23% from last quarter. The Downtown Lobby project contributed the most at $156K." },
        { type: 'user', text: "Which crew is available next Tuesday?" },
        { type: 'ai', text: "Team A is fully available Tuesday. Team B has one job finishing at 2 PM. Would you like me to schedule something?" },
    ];

    useEffect(() => {
        const timer = setInterval(() => setCurrentMessage(m => (m + 1) % messages.length), 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-card to-card/50 border border-white/10 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 opacity-50" />
            <div className="relative">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                    <motion.div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Bot className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                        <div className="font-semibold">Floor Ops AI</div>
                        <div className="text-sm text-emerald-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />Online</div>
                    </div>
                </div>
                <div className="space-y-4 min-h-[200px]">
                    <AnimatePresence mode="popLayout">
                        {messages.slice(0, currentMessage + 1).map((msg, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className={`flex ${msg.type === 'user' ? 'justify-end' : ''}`}>
                                <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${msg.type === 'user' ? 'bg-primary/20 rounded-tr-sm' : 'bg-white/5 rounded-tl-sm'}`}>{msg.text}</div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// CAPABILITY SHOWCASE CARD (replaces testimonials)
// ═══════════════════════════════════════════════════════════════════════════

function CapabilityShowcaseCard({ icon: Icon, title, description, highlights, delay = 0 }: {
    icon: React.ElementType; title: string; description: string; highlights: string[]; delay?: number
}) {
    return (
        <motion.div
            className="p-8 rounded-3xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 backdrop-blur-xl relative group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            whileHover={{ y: -5 }}
        >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-muted-foreground mb-4">{description}</p>
                <div className="flex flex-wrap gap-2">
                    {highlights.map((h, i) => (
                        <span key={i} className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">{h}</span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// PLATFORM BADGES (replaces fake logos)
// ═══════════════════════════════════════════════════════════════════════════

function PlatformBadges() {
    const badges = [
        { icon: Cloud, label: 'Cloud-Based' },
        { icon: RefreshCw, label: 'Real-Time Sync' },
        { icon: Shield, label: 'Enterprise Security' },
        { icon: Smartphone, label: 'Mobile-First' },
        { icon: Bot, label: 'AI-Powered' },
        { icon: Lock, label: 'Role-Based Access' },
    ];
    return (
        <div className="flex flex-wrap justify-center gap-4">
            {badges.map((badge, i) => (
                <motion.div
                    key={i}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05, borderColor: 'rgba(139, 92, 246, 0.5)' }}
                >
                    <badge.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{badge.label}</span>
                </motion.div>
            ))}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN LANDING PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function LandingPage() {
    const [isScrolled, setIsScrolled] = useState(false);
    const searchParams = useSearchParams();
    const clientName = searchParams.get('client');
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        { icon: BarChart3, title: "Smart Estimating", description: "Generate accurate estimates in minutes with AI-powered material calculators and real-time labor rates. Win more jobs with professional proposals." },
        { icon: Calendar, title: "Crew Scheduling", description: "Drag-and-drop scheduling with real-time availability. Automatic notifications keep your crews on track and clients informed." },
        { icon: ClipboardCheck, title: "Punch List Pro", description: "Track every detail with photo documentation, priority levels, and completion tracking. Never miss a callback again." },
        { icon: Building2, title: "Project Dashboard", description: "Get a bird's eye view of all your projects with progress tracking, budget monitoring, and milestone alerts." },
        { icon: DollarSign, title: "Invoicing & Payments", description: "Create professional invoices, track payments, and manage job costing all in one place. Get paid faster." },
        { icon: Users, title: "Team Management", description: "Manage installers, assign crews to jobs, track certifications, and monitor performance metrics in real-time." }
    ];

    const capabilities = [
        { icon: Layers, title: "Manage Complex Projects", description: "Handle projects of any size with phase tracking, budget monitoring, and milestone management.", highlights: ['Multi-phase projects', 'Budget tracking', 'Document storage'] },
        { icon: Bot, title: "AI That Understands Flooring", description: "Ask questions in plain English and get instant answers about your projects, finances, and schedules.", highlights: ['Natural language', 'Instant insights', 'Smart scheduling'] },
        { icon: Smartphone, title: "Office to Job Site", description: "Your entire team stays in sync—from the office to the field. Real-time updates, photo uploads, and task completion.", highlights: ['Mobile-first', 'Offline capable', 'Real-time sync'] },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground relative">
            <GradientMeshBackground />

            {/* Navigation */}
            <motion.nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-background/80 backdrop-blur-xl border-b border-white/10 py-3' : 'py-6'}`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between">
                        <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/30">
                                <Hammer className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold">Floor Ops Pro</span>
                            <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Beta</span>
                        </motion.div>
                        <div className="hidden md:flex items-center gap-8">
                            {['Features', 'Pricing', 'Demo'].map((item) => (
                                <motion.a key={item} href={`#${item.toLowerCase()}`} className="text-muted-foreground hover:text-foreground transition-colors relative group" whileHover={{ y: -2 }}>
                                    {item}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 group-hover:w-full transition-all duration-300" />
                                </motion.a>
                            ))}
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="hidden sm:block text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link href="/login" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all">
                                    Try Demo
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Hero */}
            <section ref={heroRef} className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden">
                <FloatingParticles />
                <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative max-w-7xl mx-auto px-6 w-full">
                    <div className="text-center max-w-5xl mx-auto">
                        {/* Personalized welcome for clients */}
                        {clientName && (
                            <motion.div
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <Sparkles className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm font-medium text-emerald-400">Welcome, {clientName.charAt(0).toUpperCase() + clientName.slice(1)} Team</span>
                            </motion.div>
                        )}

                        <motion.div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-primary/20 mb-8" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <Rocket className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Enterprise Flooring Operations Software</span>
                        </motion.div>

                        <motion.h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-8" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
                            Run Your Flooring Business{' '}
                            <span className="gradient-text-animated">Like a Pro</span>
                        </motion.h1>

                        <motion.p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            The all-in-one platform built specifically for flooring contractors. Manage projects, track materials, schedule crews, and grow your business—all in one place.
                        </motion.p>

                        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center mb-16" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link href="/login" className="px-10 py-5 rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500 text-white font-semibold text-lg shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all flex items-center justify-center gap-3">
                                    Explore the Platform<ArrowRight className="w-5 h-5" />
                                </Link>
                            </motion.div>
                            <motion.button className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-3 backdrop-blur-sm" whileHover={{ scale: 1.02, borderColor: 'rgba(139, 92, 246, 0.5)' }}>
                                <Play className="w-5 h-5" />Watch Overview
                            </motion.button>
                        </motion.div>

                        {/* Capability badges instead of fake stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                            <CapabilityBadge icon={Layers} label="Unlimited Projects" description="Scale without limits" />
                            <CapabilityBadge icon={RefreshCw} label="Real-Time Sync" description="Always up to date" />
                            <CapabilityBadge icon={Bot} label="AI Assistant" description="Answers in seconds" />
                            <CapabilityBadge icon={Smartphone} label="Mobile Ready" description="Work from anywhere" />
                        </div>
                    </div>
                </motion.div>
                <ScrollIndicator />
            </section>

            {/* Platform Badges (replaces fake trust logos) */}
            <section className="py-16 border-y border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.p className="text-center text-muted-foreground mb-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                        Built for professional flooring operations
                    </motion.p>
                    <PlatformBadges />
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-32 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div className="text-center mb-20" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-primary/20 mb-6">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Powerful Features</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">Everything You Need to <span className="gradient-text">Succeed</span></h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">From estimating to final punch list, Floor Ops Pro has every tool you need to run a successful flooring business.</p>
                    </motion.div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => <FeatureCard key={i} {...feature} index={i} />)}
                    </div>
                </div>
            </section>

            {/* AI Section */}
            <section className="py-32 relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5" />
                <div className="relative max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-primary/20 mb-6">
                                <Bot className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium text-primary">AI-Powered Intelligence</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">Your AI Assistant <span className="gradient-text">Knows Your Business</span></h2>
                            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">Ask anything about your business. Get instant answers about projects, financials, schedules, and more.</p>
                            <ul className="space-y-4">
                                {['Natural language queries about any project', 'Instant financial summaries and analysis', 'Smart scheduling recommendations', 'Automated report generation'].map((item, i) => (
                                    <motion.li key={i} className="flex items-center gap-3" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-white" /></div>
                                        <span className="text-foreground/90">{item}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                            <AIChatDemo />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-32 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div className="text-center mb-20" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-primary/20 mb-6">
                            <DollarSign className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Transparent Pricing</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">Choose Your <span className="gradient-text">Growth Plan</span></h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">No hidden fees. No long-term contracts. Founding customer pricing available.</p>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                        <PricingCard name="Starter" price={599} period="month" description="Perfect for small crews getting started" features={['Up to 5 active projects', '3 team members', 'Basic estimating tools', 'Job scheduling', 'Invoice generation', 'Email support']} delay={0} />
                        <PricingCard name="Professional" price={999} period="month" description="For growing contractors ready to scale" features={['Unlimited projects', '15 team members', 'Advanced estimating', 'Crew scheduling & tracking', 'Invoicing + payments', 'AI Assistant included', 'Priority support']} popular delay={0.1} cta="Start Free Trial" />
                        <PricingCard name="Enterprise" price={1499} period="month" description="For operations with multiple locations" features={['Everything in Professional', 'Unlimited team members', 'Multi-location support', 'Custom integrations', 'Advanced analytics', 'Dedicated manager', 'SLA guarantee']} delay={0.2} cta="Contact Sales" />
                    </div>
                    <motion.p className="text-center text-muted-foreground mt-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                        All plans include a 14-day free trial. No credit card required to start.
                    </motion.p>
                </div>
            </section>

            {/* Capabilities Showcase (replaces fake testimonials) */}
            <section id="demo" className="py-32 relative z-10 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div className="text-center mb-20" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-primary/20 mb-6">
                            <Layers className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">See What&apos;s Possible</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">Built for <span className="gradient-text">Real Operations</span></h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Discover how Floor Ops Pro handles the challenges that matter to your business.</p>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {capabilities.map((cap, i) => <CapabilityShowcaseCard key={i} {...cap} delay={i * 0.1} />)}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 relative z-10">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div className="relative p-16 rounded-[3rem] overflow-hidden" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-600" />
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
                        <FloatingParticles />
                        <div className="relative text-center text-white">
                            <motion.h2 className="text-4xl md:text-6xl font-bold mb-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>Ready to See It in Action?</motion.h2>
                            <motion.p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>Experience the platform yourself. No credit card required, no commitment.</motion.p>
                            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link href="/login" className="px-10 py-5 rounded-2xl bg-white text-violet-600 font-bold text-lg shadow-2xl hover:shadow-white/30 transition-all flex items-center justify-center gap-3">
                                        Try the Demo<ArrowRight className="w-5 h-5" />
                                    </Link>
                                </motion.div>
                                <motion.button className="px-10 py-5 rounded-2xl bg-white/10 border border-white/20 font-semibold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-3 backdrop-blur-sm" whileHover={{ scale: 1.02 }}>
                                    <PhoneCall className="w-5 h-5" />Schedule Walkthrough
                                </motion.button>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="py-20 border-t border-white/10 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center"><Hammer className="w-6 h-6 text-white" /></div>
                                <span className="text-xl font-bold">Floor Ops Pro</span>
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Beta</span>
                            </div>
                            <p className="text-muted-foreground mb-6 max-w-sm">Enterprise flooring operations software built specifically for professional contractors. Manage projects, schedule crews, and grow your business.</p>
                            <div className="flex gap-3">
                                {[MessageSquare, Mail, PhoneCall].map((Icon, i) => (
                                    <motion.a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all" whileHover={{ y: -3 }}><Icon className="w-5 h-5" /></motion.a>
                                ))}
                            </div>
                        </div>
                        {[
                            { title: 'Product', links: [{ label: 'Features', href: '#features' }, { label: 'Pricing', href: '#pricing' }, { label: 'Demo', href: '#demo' }] },
                            { title: 'Contact', links: [{ label: 'Schedule Demo', href: '#' }, { label: 'Email Us', href: 'mailto:hello@floorops.pro' }] }
                        ].map((col, i) => (
                            <div key={i}>
                                <h4 className="font-semibold mb-4">{col.title}</h4>
                                <ul className="space-y-3">
                                    {col.links.map((link, j) => (
                                        <li key={j}><a href={link.href} className="text-muted-foreground hover:text-foreground transition-colors hover:translate-x-1 inline-block">{link.label}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-muted-foreground text-sm">© 2026 Floor Ops Pro. All rights reserved.</p>
                        <div className="flex gap-6 text-sm text-muted-foreground">
                            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
