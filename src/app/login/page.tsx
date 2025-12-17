'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/components/permission-context';
import { getRoleInfo, UserRole } from '@/lib/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Home, Check, Shield, User, Users, Briefcase, HardHat, Eye,
    Lock, Unlock, ArrowRight, Building2, Wrench, FileText,
    DollarSign, Calendar, ClipboardList, Camera, MessageSquare
} from 'lucide-react';

// Role capability descriptions for the demo
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
        description: 'Full warehouse control: receiving, transfers, inventory adjustments, locations',
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
    }
};

const PERMISSION_ICONS: Record<string, React.ReactNode> = {
    'Financial': <DollarSign className="w-4 h-4" />,
    'Projects': <Briefcase className="w-4 h-4" />,
    'Schedule': <Calendar className="w-4 h-4" />,
    'Punch List': <ClipboardList className="w-4 h-4" />,
    'Photos': <Camera className="w-4 h-4" />,
    'Messages': <MessageSquare className="w-4 h-4" />,
};

export default function LoginPage() {
    const router = useRouter();
    const { getAllUsers, switchUser, currentUser, isLoaded } = usePermissions();
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const users = getAllUsers().filter(u => u.active);

    // Group users by role for better organization
    const usersByRole = users.reduce((acc, user) => {
        if (!acc[user.role]) acc[user.role] = [];
        acc[user.role].push(user);
        return acc;
    }, {} as Record<UserRole, typeof users>);

    const selectedUser = users.find(u => u.id === selectedUserId);

    const handleLogin = async () => {
        if (selectedUserId) {
            setIsLoggingIn(true);
            switchUser(selectedUserId);

            // Brief delay for visual feedback
            await new Promise(resolve => setTimeout(resolve, 400));
            router.push('/');
        }
    };

    // Keyboard shortcut: Enter to login
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && selectedUserId) {
                handleLogin();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedUserId]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center animate-pulse">
                        <Home className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <p className="text-muted-foreground animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-background via-background to-primary/5">
            {/* Left Panel - Branding & Info */}
            <div className="hidden lg:flex lg:w-2/5 xl:w-1/3 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 flex-col justify-between border-r border-border/50">
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                            <Home className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">FloorOps Pro</h1>
                            <p className="text-sm text-muted-foreground">Enterprise Edition</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold mb-2">Role-Based Access Control</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Each role in FloorOps Pro has tailored permissions that match real-world flooring
                                operations. From owners with full financial visibility to installers focused on
                                field execution.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Available Roles</h3>
                            {Object.entries(ROLE_CAPABILITIES).map(([role, info]) => (
                                <div key={role} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                        {info.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium capitalize text-sm">{role.replace('_', ' ')}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{info.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="text-xs text-muted-foreground">
                    <p>© 2024 FloorOps Pro</p>
                    <p className="mt-1">Enterprise flooring operations management</p>
                </div>
            </div>

            {/* Right Panel - Login */}
            <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
                <div className="w-full max-w-xl space-y-6">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-xl mb-4">
                            <Home className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">FloorOps Pro</h1>
                        <p className="text-muted-foreground text-sm">Enterprise Edition</p>
                    </div>

                    <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Lock className="w-5 h-5 text-primary" />
                                Sign In
                            </CardTitle>
                            <CardDescription>
                                Select a user account to explore role-based features
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* User Selection */}
                            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
                                {users.map(user => {
                                    const roleInfo = getRoleInfo(user.role);
                                    const isSelected = selectedUserId === user.id;
                                    const isCurrent = currentUser?.id === user.id;
                                    const capabilities = ROLE_CAPABILITIES[user.role];

                                    return (
                                        <button
                                            key={user.id}
                                            onClick={() => setSelectedUserId(user.id)}
                                            className={`
                        relative w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left
                        ${isSelected
                                                    ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20'
                                                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                                }
                      `}
                                        >
                                            {/* Avatar */}
                                            <div
                                                className="flex items-center justify-center w-12 h-12 rounded-full text-white text-lg font-bold shrink-0 shadow-md"
                                                style={{ backgroundColor: roleInfo?.color || 'hsl(var(--primary))' }}
                                            >
                                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold">{user.name}</span>
                                                    {isCurrent && (
                                                        <Badge variant="secondary" className="text-xs">Current Session</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                        style={{ borderColor: roleInfo?.color, color: roleInfo?.color }}
                                                    >
                                                        {roleInfo?.icon} {roleInfo?.label}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 truncate">{user.email}</p>
                                            </div>

                                            {/* Selection Indicator */}
                                            <div className={`
                        flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 transition-all
                        ${isSelected
                                                    ? 'border-primary bg-primary text-primary-foreground scale-110'
                                                    : 'border-muted-foreground/30'
                                                }
                      `}>
                                                {isSelected && <Check className="w-4 h-4" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Selected User Capabilities */}
                            {selectedUser && (
                                <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    <div className="flex items-center gap-2">
                                        <Unlock className="w-4 h-4 text-primary" />
                                        <span className="font-medium text-sm">Access Preview</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {ROLE_CAPABILITIES[selectedUser.role].description}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {ROLE_CAPABILITIES[selectedUser.role].highlights.map((highlight, i) => (
                                            <Badge key={i} variant="secondary" className="text-xs">
                                                {highlight}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Login Button */}
                            <Button
                                onClick={handleLogin}
                                disabled={!selectedUserId || isLoggingIn}
                                className="w-full h-12 text-base font-semibold group"
                                size="lg"
                            >
                                {isLoggingIn ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                            <p className="text-xs text-center text-muted-foreground">
                                Demo mode • No password required • Press Enter to sign in
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
