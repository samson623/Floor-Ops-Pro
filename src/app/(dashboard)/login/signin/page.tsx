'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePermissions } from '@/components/permission-context';
import { getRoleInfo, UserRole, can } from '@/lib/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Home, ArrowLeft, ArrowRight, Loader2,
    Lock, Mail, KeyRound, Shield
} from 'lucide-react';

// Helper to get a summary of what a role can access
interface AccessItem {
    label: string;
    allowed: boolean;
}

function getRoleAccessSummary(role: UserRole): AccessItem[] {
    return [
        { label: 'View All Projects', allowed: can(role, 'VIEW_ALL_PROJECTS') },
        { label: 'Financial Data', allowed: can(role, 'VIEW_PRICING') || can(role, 'VIEW_BUDGET') },
        { label: 'Create/Edit Projects', allowed: can(role, 'CREATE_PROJECT') || can(role, 'EDIT_PROJECT') },
        { label: 'Manage Punch List', allowed: can(role, 'CREATE_PUNCH_ITEM') || can(role, 'COMPLETE_PUNCH_ITEM') },
        { label: 'Daily Logs', allowed: can(role, 'VIEW_DAILY_LOGS') },
        { label: 'Schedule & Crews', allowed: can(role, 'VIEW_SCHEDULE') },
        { label: 'Invoicing', allowed: can(role, 'VIEW_CLIENT_INVOICES') || can(role, 'CREATE_CLIENT_INVOICE') },
        { label: 'Warehouse Access', allowed: can(role, 'VIEW_INVENTORY') },
        { label: 'Team Management', allowed: can(role, 'MANAGE_USERS') },
        { label: 'AI Assistant', allowed: can(role, 'USE_AI_ASSISTANT') },
    ];
}

function SignInForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { getAllUsers, switchUser, isLoaded } = usePermissions();

    const userId = searchParams.get('userId');
    const users = getAllUsers();
    const selectedUser = users.find(u => u.id === Number(userId));

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [showError, setShowError] = useState(false);

    // Redirect if no userId
    useEffect(() => {
        if (isLoaded && !userId) {
            router.push('/login');
        }
    }, [isLoaded, userId, router]);

    // Handle Sign In with credentials
    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowError(false);

        if (!email.trim() || !password.trim()) {
            toast.error('Please enter email and password');
            return;
        }

        // Validate test credentials
        if (email.toLowerCase() === 'test' && password === '123') {
            setIsLoggingIn(true);
            if (selectedUser) {
                switchUser(selectedUser.id);
            }
            await new Promise(resolve => setTimeout(resolve, 600));
            router.push('/dashboard');
        } else {
            setShowError(true);
            toast.error('Invalid credentials');
        }
    };

    if (!isLoaded || !selectedUser) {
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

    const roleInfo = getRoleInfo(selectedUser.role);

    return (
        <div className="min-h-screen flex bg-[#0a0a0f]">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-violet-600/15 to-transparent blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-30%] right-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-cyan-500/15 to-transparent blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Center Content */}
            <div className="flex-1 flex items-center justify-center p-4 lg:p-8 relative z-10">
                <div className="w-full max-w-md space-y-6">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl mb-4">
                            <Home className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-tight">FloorOps Pro</h1>
                        <p className="text-slate-400 text-sm">Enterprise Edition</p>
                    </div>

                    {/* Sign In Card */}
                    <Card className="border-0 bg-slate-900/60 backdrop-blur-sm shadow-2xl shadow-black/40">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push('/login')}
                                    className="text-slate-400 hover:text-white -ml-2 h-8"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back
                                </Button>
                            </div>
                            <CardTitle className="text-lg text-white flex items-center gap-2">
                                <Lock className="w-4 h-4 text-slate-400" />
                                Sign In
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-sm">
                                Enter your credentials to continue
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Selected User Preview */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                                <div
                                    className="flex items-center justify-center w-12 h-12 rounded-full text-white text-lg font-bold shrink-0 shadow-md"
                                    style={{ backgroundColor: roleInfo?.color || '#3b82f6' }}
                                >
                                    {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <div>
                                    <p className="font-semibold text-white">{selectedUser.name}</p>
                                    <Badge
                                        variant="outline"
                                        className="text-xs mt-1"
                                        style={{ borderColor: roleInfo?.color, color: roleInfo?.color }}
                                    >
                                        {roleInfo?.label}
                                    </Badge>
                                </div>
                            </div>

                            {/* Role Access Information */}
                            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5" />
                                    Role Access
                                </p>
                                <div className="space-y-2">
                                    {getRoleAccessSummary(selectedUser.role).map((access, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm">
                                            <div
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: access.allowed ? '#22c55e' : '#ef4444' }}
                                            />
                                            <span className={access.allowed ? 'text-slate-300' : 'text-slate-500'}>
                                                {access.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-500 mt-3 pt-3 border-t border-slate-700/50">
                                    {roleInfo?.description}
                                </p>
                            </div>

                            {/* Credentials Form */}
                            <form onSubmit={handleSignIn} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-300 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-500" />
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="text"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setShowError(false); }}
                                        placeholder="Enter email"
                                        className={`h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20 ${showError ? 'border-red-500' : ''}`}
                                        autoComplete="username"
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-slate-300 flex items-center gap-2">
                                        <KeyRound className="w-4 h-4 text-slate-500" />
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setShowError(false); }}
                                        placeholder="Enter password"
                                        className={`h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20 ${showError ? 'border-red-500' : ''}`}
                                        autoComplete="current-password"
                                    />
                                </div>

                                {showError && (
                                    <p className="text-sm text-red-400 flex items-center gap-2">
                                        <span className="w-1 h-1 rounded-full bg-red-400" />
                                        Invalid email or password
                                    </p>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isLoggingIn}
                                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white shadow-lg shadow-violet-500/25 transition-all duration-200 group"
                                    size="lg"
                                >
                                    {isLoggingIn ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Signing in...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Sign In
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    )}
                                </Button>
                            </form>

                            {/* Hint */}
                            <p className="text-xs text-center text-slate-500">
                                Test credentials: <span className="text-slate-400">test</span> / <span className="text-slate-400">123</span>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
            </div>
        }>
            <SignInForm />
        </Suspense>
    );
}
