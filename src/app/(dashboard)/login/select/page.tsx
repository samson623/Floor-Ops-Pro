'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/components/permission-context';
import { getRoleInfo, UserRole } from '@/lib/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Home, Check, Shield, Briefcase, HardHat, Eye,
    ArrowRight, Building2, Wrench, FileText, ArrowLeft, Loader2
} from 'lucide-react';

// Role capability descriptions
const ROLE_CAPABILITIES: Record<UserRole, { description: string; highlights: string[]; icon: React.ReactNode }> = {
    owner: {
        description: 'Full system access with complete financial visibility and user management',
        highlights: ['All financial data & margins', 'User management', 'All projects', 'System settings'],
        icon: <Shield className="w-5 h-5" />
    },
    pm: {
        description: 'Manage projects end-to-end with budget oversight and team coordination',
        highlights: ['Project budgets', 'Schedule management', 'Change orders', 'Client communication'],
        icon: <Briefcase className="w-5 h-5" />
    },
    foreman: {
        description: 'Field leadership with crew management and quality oversight',
        highlights: ['Crew assignments', 'Punch lists', 'Quality checklists', 'Photo documentation'],
        icon: <HardHat className="w-5 h-5" />
    },
    installer: {
        description: 'Field work execution with task completion and time tracking',
        highlights: ['My assignments', 'Punch items', 'Daily logs', 'Photo uploads'],
        icon: <Wrench className="w-5 h-5" />
    },
    office_admin: {
        description: 'Administrative operations including invoicing and vendor management',
        highlights: ['Invoices', 'Purchase orders', 'Vendor coordination', 'Scheduling'],
        icon: <FileText className="w-5 h-5" />
    },
    warehouse_manager: {
        description: 'Full warehouse control: receiving, transfers, inventory adjustments',
        highlights: ['Inventory management', 'Receiving', 'Stock transfers', 'Cycle counting'],
        icon: <Briefcase className="w-5 h-5" />
    },
    warehouse_staff: {
        description: 'Warehouse operations: receive, pick, stage, and transfer materials',
        highlights: ['Receiving', 'Picking', 'Transfers', 'Job staging'],
        icon: <Wrench className="w-5 h-5" />
    },
    client: {
        description: 'Project visibility with approval workflows and communication',
        highlights: ['Project status', 'Photo gallery', 'Approvals', 'Messages'],
        icon: <Building2 className="w-5 h-5" />
    },
    sub: {
        description: 'External contractor access to assigned tasks and documents',
        highlights: ['Assigned projects', 'Schedule view', 'Communication', 'Safety reports'],
        icon: <Briefcase className="w-5 h-5" />
    },
    demo: {
        description: 'Explore the full platform with read-only access to all features',
        highlights: ['View all features', 'AI Assistant', 'Full visibility', 'No changes saved'],
        icon: <Eye className="w-5 h-5" />
    }
};

export default function RoleSelectPage() {
    const router = useRouter();
    const { getAllUsers, switchUser, currentUser, isLoaded } = usePermissions();
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Filter out demo user - testers should use real roles
    const users = getAllUsers().filter(u => u.active && u.role !== 'demo');
    const selectedUser = users.find(u => u.id === selectedUserId);

    const handleContinue = async () => {
        if (selectedUserId) {
            setIsLoggingIn(true);
            switchUser(selectedUserId);
            await new Promise(resolve => setTimeout(resolve, 400));
            router.push('/dashboard');
        }
    };

    // Keyboard shortcut: Enter to continue
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && selectedUserId) {
                handleContinue();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedUserId]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center animate-pulse shadow-2xl shadow-violet-500/30">
                        <Home className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                        <p className="text-slate-400">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-[#0a0a0f] overflow-hidden">
            {/* Animated background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-violet-600/15 to-transparent blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-30%] right-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-cyan-500/15 to-transparent blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Left Panel - Info */}
            <div className="hidden lg:flex lg:w-2/5 xl:w-1/3 p-8 flex-col justify-between border-r border-slate-800 relative z-10">
                <div>
                    {/* Back button */}
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/login')}
                        className="mb-8 text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Button>

                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <Home className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Floor Ops Pro</h1>
                            <p className="text-sm text-slate-400">Enterprise Edition</p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white mb-2">Role-Based Access Control</h2>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Each role has tailored permissions that match real-world flooring
                            operations. Select your account to access the system.
                        </p>
                    </div>

                    {/* Only show selected role info - don't reveal all roles */}
                    {selectedUser && (
                        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
                                    {ROLE_CAPABILITIES[selectedUser.role]?.icon}
                                </div>
                                <div>
                                    <p className="font-semibold text-white capitalize">{selectedUser.role.replace('_', ' ')}</p>
                                    <p className="text-xs text-slate-500">{selectedUser.name}</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400">
                                {ROLE_CAPABILITIES[selectedUser.role]?.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {ROLE_CAPABILITIES[selectedUser.role]?.highlights.map((highlight, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs bg-slate-800 text-slate-300">
                                        {highlight}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {!selectedUser && (
                        <div className="p-6 rounded-xl border border-dashed border-slate-700 text-center">
                            <p className="text-sm text-slate-500">
                                Select an account to see role details
                            </p>
                        </div>
                    )}
                </div>

                <div className="text-xs text-slate-600">
                    <p>© 2026 Floor Ops Pro</p>
                    <p className="mt-1">Enterprise flooring operations management</p>
                </div>
            </div>

            {/* Right Panel - User Selection */}
            <div className="flex-1 flex items-center justify-center p-4 lg:p-8 relative z-10">
                <div className="w-full max-w-xl space-y-6">
                    {/* Mobile back button */}
                    <div className="lg:hidden">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/login')}
                            className="text-slate-400 hover:text-white"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </div>

                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-xl mb-4">
                            <Home className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Floor Ops Pro</h1>
                        <p className="text-slate-400 text-sm">Enterprise Edition</p>
                    </div>

                    <Card className="border-0 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-black/50">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-violet-400" />
                                Select Account
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Choose a user account to access the system
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* User Selection */}
                            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
                                {users.map(user => {
                                    const roleInfo = getRoleInfo(user.role);
                                    const isSelected = selectedUserId === user.id;
                                    const isCurrent = currentUser?.id === user.id;

                                    return (
                                        <button
                                            key={user.id}
                                            onClick={() => setSelectedUserId(user.id)}
                                            className={`
                                                relative w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer
                                                ${isSelected
                                                    ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                                                    : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                                                }
                                            `}
                                        >
                                            {/* Avatar */}
                                            <div
                                                className="flex items-center justify-center w-12 h-12 rounded-full text-white text-lg font-bold shrink-0 shadow-md"
                                                style={{ backgroundColor: roleInfo?.color || '#8b5cf6' }}
                                            >
                                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-white">{user.name}</span>
                                                    {isCurrent && (
                                                        <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">Current</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs border-slate-600"
                                                        style={{ borderColor: roleInfo?.color, color: roleInfo?.color }}
                                                    >
                                                        {roleInfo?.label}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1 truncate">{user.email}</p>
                                            </div>

                                            {/* Selection Indicator */}
                                            <div className={`
                                                flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 transition-all
                                                ${isSelected
                                                    ? 'border-violet-500 bg-violet-500 text-white scale-110'
                                                    : 'border-slate-600'
                                                }
                                            `}>
                                                {isSelected && <Check className="w-4 h-4" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>


                            {/* Continue Button */}
                            <Button
                                onClick={handleContinue}
                                disabled={!selectedUserId || isLoggingIn}
                                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed group"
                                size="lg"
                            >
                                {isLoggingIn ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Signing in...
                                    </span>
                                ) : selectedUserId ? (
                                    <span className="flex items-center gap-2">
                                        Continue to Dashboard
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                ) : (
                                    'Select an Account'
                                )}
                            </Button>

                            {/* Footer */}
                            <p className="text-xs text-center text-slate-500">
                                Full access • Press Enter to sign in
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
