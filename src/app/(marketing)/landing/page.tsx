'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, ArrowRight, Sparkles, BarChart3, Calendar, Users,
    Zap, Shield, Building2, Hammer, ClipboardCheck,
    DollarSign, Play, MessageSquare, PhoneCall, Mail, ChevronDown,
    Bot, Cloud, Smartphone, RefreshCw, Lock, Layers, Rocket, Loader2
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import './landing-animations.css';

type ConversionIntent = 'overview' | 'pilot' | 'walkthrough';

const CONVERSION_CONTENT: Record<ConversionIntent, { title: string; description: string; subject: string }> = {
    overview: {
        title: 'From awarded job to final walkthrough',
        description: 'See how ownership, project managers, field teams, and the warehouse work from one shared operating view.',
        subject: 'Floor Ops Pro overview',
    },
    pilot: {
        title: 'Plan your guided pilot',
        description: 'We begin with discovery and onboarding, then configure Floor Ops Pro around your projects, roles, materials, and reporting needs.',
        subject: 'Plan a Floor Ops Pro guided pilot',
    },
    walkthrough: {
        title: 'Schedule a focused walkthrough',
        description: 'Choose the workflows that matter most and we will tailor the demonstration to your flooring operation.',
        subject: 'Schedule a Floor Ops Pro walkthrough',
    },
};

function ConversionDialog({ intent, onOpenChange }: { intent: ConversionIntent | null; onOpenChange: (open: boolean) => void }) {
    const content = intent ? CONVERSION_CONTENT[intent] : CONVERSION_CONTENT.overview;
    const emailHref = `mailto:hello@floorops.pro?subject=${encodeURIComponent(content.subject)}&body=${encodeURIComponent('Company:\nTeam size:\nNumber of active projects:\nWhat we want to see:\n')}`;

    return (
        <Dialog open={intent !== null} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden border-white/10 bg-slate-950 p-0 text-white sm:max-w-2xl">
                <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500" />
                <div className="p-7 sm:p-9">
                    <DialogHeader className="pr-8">
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                            {intent === 'overview' ? <Play className="h-5 w-5" /> : <PhoneCall className="h-5 w-5" />}
                        </div>
                        <DialogTitle className="text-2xl sm:text-3xl">{content.title}</DialogTitle>
                        <DialogDescription className="text-base leading-relaxed text-slate-400">{content.description}</DialogDescription>
                    </DialogHeader>

                    {intent === 'overview' && (
                        <div className="my-7 grid gap-3 sm:grid-cols-2">
                            {[
                                ['01', 'Win and plan', 'Estimate, scope, schedule, and assign the work.'],
                                ['02', 'Mobilize', 'Coordinate crews, materials, purchasing, and warehouse movement.'],
                                ['03', 'Control the job', 'Track progress, costs, daily logs, changes, and punch items.'],
                                ['04', 'Close with confidence', 'Complete approvals, invoicing, sign-off, and final reporting.'],
                            ].map(([number, title, description]) => (
                                <div key={number} className="border-l border-white/10 py-1 pl-4">
                                    <span className="text-xs font-semibold tracking-widest text-primary">{number}</span>
                                    <p className="mt-1 font-semibold">{title}</p>
                                    <p className="mt-1 text-sm leading-relaxed text-slate-400">{description}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        <Link href="/login/select" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-3 font-semibold text-white transition-transform hover:scale-[1.01]">
                            Open Owner Demo<ArrowRight className="h-4 w-4" />
                        </Link>
                        <a href={emailHref} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-semibold transition-colors hover:bg-white/10">
                            <Mail className="h-4 w-4" />Email Floor Ops Pro
                        </a>
                    </div>
                    <p className="mt-4 text-center text-xs text-slate-500">Pilot conversations are handled directly. No payment information is requested.</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

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

const FLOATING_PARTICLES = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: (i * 37) % 100,
    top: (i * 61) % 100,
    size: 2 + (i % 4),
    delay: (i % 10) * 0.45,
    duration: 6 + (i % 7),
}));

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING PARTICLES
// ═══════════════════════════════════════════════════════════════════════════

function FloatingParticles() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {FLOATING_PARTICLES.map((p) => (
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
            className="relative group h-full"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
            <div className="relative flex h-full min-h-40 flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-center backdrop-blur-sm transition-all duration-500 hover:border-primary/30 sm:p-6">
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
            </div>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// AI CHAT DEMO
// ═══════════════════════════════════════════════════════════════════════════

const AI_DEMO_MESSAGES = [
    { type: 'user', text: "What's our revenue this quarter?" },
    { type: 'ai', text: 'Your Q4 revenue is $847,250, up 23% from last quarter. The Downtown Lobby project contributed the most at $156K.' },
    { type: 'user', text: 'Which crew is available next Tuesday?' },
    { type: 'ai', text: 'Team A is fully available Tuesday. Team B has one job finishing at 2 PM. Would you like me to schedule something?' },
];

function AIChatDemo() {
    const [currentMessage, setCurrentMessage] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setCurrentMessage(m => (m + 1) % AI_DEMO_MESSAGES.length), 3000);
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
                        {AI_DEMO_MESSAGES.slice(0, currentMessage + 1).map((msg, i) => (
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

function LandingPageContent() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [conversionIntent, setConversionIntent] = useState<ConversionIntent | null>(null);
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
            <ConversionDialog intent={conversionIntent} onOpenChange={(open) => !open && setConversionIntent(null)} />

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
                            {['Features', 'Pilot', 'Demo'].map((item) => (
                                <motion.a key={item} href={`#${item.toLowerCase()}`} className="text-muted-foreground hover:text-foreground transition-colors relative group" whileHover={{ y: -2 }}>
                                    {item}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 group-hover:w-full transition-all duration-300" />
                                </motion.a>
                            ))}
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="hidden sm:block text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link href="/demo" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all">
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
                                <Link href="/demo" className="px-10 py-5 rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500 text-white font-semibold text-lg shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all flex items-center justify-center gap-3">
                                    Explore the Platform<ArrowRight className="w-5 h-5" />
                                </Link>
                            </motion.div>
                            <motion.button type="button" onClick={() => setConversionIntent('overview')} className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-3 backdrop-blur-sm" whileHover={{ scale: 1.02, borderColor: 'rgba(139, 92, 246, 0.5)' }}>
                                <Play className="w-5 h-5" />Watch Overview
                            </motion.button>
                        </motion.div>

                        {/* Capability badges instead of fake stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                            <CapabilityBadge icon={Layers} label="Project Portfolio" description="Plan capacity as operations grow" />
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

            {/* Guided Pilot */}
            <section id="pilot" className="py-32 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div className="max-w-3xl mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-primary/20 mb-6">
                            <Rocket className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Guided Implementation</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">Start with a <span className="gradient-text">Guided Pilot</span></h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">Floor Ops Pro is configured around your operation. Every engagement begins with discovery and onboarding—not a self-service trial.</p>
                    </motion.div>
                    <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                        <div className="border-t border-white/10">
                            {[
                                ['01', 'Discover', 'Map your current projects, roles, crews, materials, and reporting needs.'],
                                ['02', 'Configure', 'Set up workflows, permissions, the data plan, and role-based training.'],
                                ['03', 'Pilot & prove', 'Run an agreed project scope with direct support and clear success measures.'],
                            ].map(([number, title, description], index) => (
                                <motion.div
                                    key={number}
                                    className="grid grid-cols-[3.5rem_1fr] gap-5 border-b border-white/10 py-8"
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <span className="font-mono text-sm font-semibold tracking-widest text-primary">{number}</span>
                                    <div>
                                        <h3 className="text-2xl font-bold">{title}</h3>
                                        <p className="mt-2 max-w-xl leading-relaxed text-muted-foreground">{description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <motion.div
                            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-card/80 to-cyan-500/10 p-8 lg:sticky lg:top-28"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                        >
                            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                            <div className="relative">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">What defines your pilot</p>
                                <ul className="mt-6 space-y-4">
                                    {['Active project volume', 'Locations and warehouse structure', 'Users and role complexity', 'Data migration and integrations', 'Training and support needs'].map((factor) => (
                                        <li key={factor} className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
                                            <span>{factor}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-7 border-t border-white/10 pt-6 leading-relaxed text-muted-foreground">Scope and pricing are set after discovery. Project capacity is agreed for the pilot and adjusted for the full rollout.</p>
                                <motion.button type="button" onClick={() => setConversionIntent('pilot')} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/20 transition-shadow hover:shadow-primary/40" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    Plan Your Pilot<ArrowRight className="h-5 w-5" />
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
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
                            <motion.p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>Explore the product, then schedule an onboarding conversation tailored to your operation.</motion.p>
                            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link href="/demo" className="px-10 py-5 rounded-2xl bg-white text-violet-600 font-bold text-lg shadow-2xl hover:shadow-white/30 transition-all flex items-center justify-center gap-3">
                                        Try the Demo<ArrowRight className="w-5 h-5" />
                                    </Link>
                                </motion.div>
                                <motion.button type="button" onClick={() => setConversionIntent('walkthrough')} className="px-10 py-5 rounded-2xl bg-white/10 border border-white/20 font-semibold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-3 backdrop-blur-sm" whileHover={{ scale: 1.02 }}>
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
                                {[
                                    { Icon: MessageSquare, href: '/login/select', label: 'Open the owner demo' },
                                    { Icon: Mail, href: 'mailto:hello@floorops.pro?subject=Floor%20Ops%20Pro%20question', label: 'Email Floor Ops Pro' },
                                    { Icon: PhoneCall, href: 'mailto:hello@floorops.pro?subject=Schedule%20a%20Floor%20Ops%20Pro%20walkthrough', label: 'Schedule a walkthrough' },
                                ].map(({ Icon, href, label }) => (
                                    <motion.a key={label} href={href} aria-label={label} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all" whileHover={{ y: -3 }}><Icon className="w-5 h-5" /></motion.a>
                                ))}
                            </div>
                        </div>
                        {[
                            { title: 'Product', links: [{ label: 'Features', href: '#features' }, { label: 'Pilot', href: '#pilot' }, { label: 'Demo', href: '#demo' }] },
                            { title: 'Contact', links: [{ label: 'Schedule Demo', href: 'mailto:hello@floorops.pro?subject=Schedule%20a%20Floor%20Ops%20Pro%20demo' }, { label: 'Email Us', href: 'mailto:hello@floorops.pro' }] }
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
                            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE WRAPPER WITH SUSPENSE
// ═══════════════════════════════════════════════════════════════════════════

function LandingPageFallback() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center animate-pulse">
                    <Hammer className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading...</span>
                </div>
            </div>
        </div>
    );
}

export default function LandingPage() {
    return (
        <Suspense fallback={<LandingPageFallback />}>
            <LandingPageContent />
        </Suspense>
    );
}
