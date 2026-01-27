'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/components/permission-context';
import { getRoleInfo, UserRole } from '@/lib/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Home, Shield, Briefcase, HardHat, Eye,
    Building2, Wrench, FileText, Loader2, Lock
} from 'lucide-react';

// All available roles with descriptions
const AVAILABLE_ROLES: { role: UserRole; label: string; description: string; icon: React.ReactNode }[] = [
    { role: 'owner', label: 'Owner', description: 'Full system access with complete financial visibility and user management', icon: <Shield className="w-5 h-5" /> },
    { role: 'pm', label: 'PM', description: 'Manage projects end-to-end with budget oversight and team coordination', icon: <Briefcase className="w-5 h-5" /> },
    { role: 'foreman', label: 'Foreman', description: 'Field leadership with crew management and quality oversight', icon: <HardHat className="w-5 h-5" /> },
    { role: 'installer', label: 'Installer', description: 'Field work execution with task completion and time tracking', icon: <Wrench className="w-5 h-5" /> },
    { role: 'office_admin', label: 'Office Admin', description: 'Administrative operations including invoicing and vendor management', icon: <FileText className="w-5 h-5" /> },
    { role: 'warehouse_manager', label: 'Warehouse Manager', description: 'Full warehouse control: receiving, transfers, inventory adjustments', icon: <Briefcase className="w-5 h-5" /> },
    { role: 'warehouse_staff', label: 'Warehouse Staff', description: 'Warehouse operations: receive, pick, stage, and transfer materials', icon: <Wrench className="w-5 h-5" /> },
    { role: 'client', label: 'Client', description: 'Project visibility with approval workflows and communication', icon: <Building2 className="w-5 h-5" /> },
    { role: 'sub', label: 'Sub', description: 'External contractor access to assigned tasks and documents', icon: <Briefcase className="w-5 h-5" /> },
];

export default function LoginPage() {
    const router = useRouter();
    const { getAllUsers, switchUser, signInAsDemo, isLoaded, currentUser } = usePermissions();

    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Filter out demo user
    const users = getAllUsers().filter(u => u.active && u.role !== 'demo');
    const selectedUser = users.find(u => u.id === selectedUserId);

    // Handle select account - go to sign-in page
    const handleSelectAccount = async () => {
        if (!selectedUserId) return;
        router.push(`/login/signin?userId=${selectedUserId}`);
    };

    // Handle Try Demo
    const handleTryDemo = async () => {
        setIsLoggingIn(true);
        signInAsDemo();
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push('/dashboard');
    };

    // Handle keyboard Enter
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && selectedUserId) {
            handleSelectAccount();
        }
    };

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
        <div className="min-h-screen flex bg-[#0a0a0f]" onKeyDown={handleKeyDown} tabIndex={0}>
            {/* Left Panel - Available Roles */}
            <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] p-8 flex-col border-r border-slate-800/50">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <Home className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight">FloorOps Pro</h1>
                        <p className="text-xs text-slate-500">Enterprise Edition</p>
                    </div>
                </div>

                {/* Title */}
                <div className="mb-6">
                    <h2 className="text-base font-semibold text-white mb-2">Role-Based Access Control</h2>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Each role in FloorOps Pro has tailored permissions that match real-world flooring operations. From owners with full financial visibility to installers focused on field execution.
                    </p>
                </div>

                {/* Available Roles */}
                <div className="flex-1 overflow-y-auto">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Available Roles</p>
                    <div className="space-y-1">
                        {AVAILABLE_ROLES.map((roleItem) => (
                            <div
                                key={roleItem.role}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/30 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                                    {roleItem.icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-sm text-white">{roleItem.label}</p>
                                    <p className="text-xs text-slate-500 leading-relaxed">{roleItem.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-xs text-slate-600 mt-6 pt-6 border-t border-slate-800/50">
                    <p>© 2025 FloorOps Pro</p>
                    <p className="mt-0.5">Enterprise flooring operations management</p>
                </div>
            </div>

            {/* Right Panel - Sign In */}
            <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl mb-4">
                            <Home className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-tight">FloorOps Pro</h1>
                        <p className="text-slate-400 text-sm">Enterprise Edition</p>
                    </div>

                    {/* Sign In Card */}
                    <Card className="border-0 bg-slate-900/60 backdrop-blur-sm shadow-2xl shadow-black/40">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg text-white flex items-center gap-2">
                                <Lock className="w-4 h-4 text-slate-400" />
                                Sign In
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-sm">
                                Select a user account to explore role-based features
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* User Selection List */}
                            <div className="space-y-2">
                                {users.map(user => {
                                    const roleInfo = getRoleInfo(user.role);
                                    const isSelected = selectedUserId === user.id;
                                    const isCurrent = currentUser?.id === user.id;

                                    return (
                                        <button
                                            key={user.id}
                                            onClick={() => setSelectedUserId(user.id)}
                                            className={`
                                                w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 text-left
                                                ${isSelected
                                                    ? 'border-blue-500/50 bg-blue-500/10'
                                                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                                                }
                                            `}
                                        >
                                            {/* Avatar */}
                                            <div
                                                className="flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-semibold shrink-0"
                                                style={{ backgroundColor: roleInfo?.color || '#3b82f6' }}
                                            >
                                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-white text-sm">{user.name}</span>
                                                    {isCurrent && (
                                                        <Badge className="text-[10px] bg-emerald-500/20 text-emerald-400 border-0 py-0 px-1.5">
                                                            Current Session
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] py-0 px-1.5 border-slate-700"
                                                        style={{ color: roleInfo?.color }}
                                                    >
                                                        {roleInfo?.label}
                                                    </Badge>
                                                </div>
                                                <p className="text-[11px] text-slate-500 mt-0.5">{user.email}</p>
                                            </div>

                                            {/* Radio indicator */}
                                            <div className={`
                                                w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center
                                                ${isSelected ? 'border-blue-500' : 'border-slate-600'}
                                            `}>
                                                {isSelected && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Sign In Button */}
                            <Button
                                onClick={handleSelectAccount}
                                disabled={!selectedUserId || isLoggingIn}
                                className="w-full h-11 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isLoggingIn ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Signing in...
                                    </span>
                                ) : (
                                    'Select an Account'
                                )}
                            </Button>

                            {/* Demo Mode Link */}
                            <p className="text-xs text-center text-slate-500">
                                <button
                                    onClick={handleTryDemo}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    Demo mode
                                </button>
                                {' • No password required • Press Enter to sign in'}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
