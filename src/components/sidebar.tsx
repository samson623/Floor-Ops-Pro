'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useData } from './data-provider';
import { usePermissions } from './permission-context';
import { getRoleInfo, Permission } from '@/lib/permissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    LayoutDashboard,
    FolderKanban,
    FileText,
    Calendar,
    Package,
    Store,
    MessageSquare,
    Menu,
    Home,
    Truck,
    Users,
    Brain
} from 'lucide-react';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    requiredPermission?: Permission;
}

interface NavSection {
    title: string;
    items: NavItem[];
    requiredPermissions?: Permission[];
}

function SidebarContent() {
    const pathname = usePathname();
    const { data, getUnreadMessageCount } = useData();
    const { currentUser, can, canAny, isLoaded, getCurrentRoleInfo } = usePermissions();

    const navSections: NavSection[] = [
        {
            title: 'Main',
            items: [
                { href: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
                { href: '/projects', label: 'Projects', icon: <FolderKanban className="w-5 h-5" />, badge: data.projects.length },
            ]
        },
        {
            title: 'Sales',
            items: [
                { href: '/estimates', label: 'Estimates', icon: <FileText className="w-5 h-5" />, badge: data.estimates.length, requiredPermission: 'VIEW_ESTIMATES' },
            ],
            requiredPermissions: ['VIEW_ESTIMATES']
        },
        {
            title: 'Finance',
            items: [
                { href: '/invoices', label: 'Invoices', icon: <FileText className="w-5 h-5" />, badge: (data.clientInvoices || []).filter(inv => inv.status === 'sent' || inv.status === 'partial').length || undefined, requiredPermission: 'VIEW_CLIENT_INVOICES' },
                { href: '/budget', label: 'Job Costing', icon: <LayoutDashboard className="w-5 h-5" />, badge: (data.profitLeakAlerts || []).filter(a => !a.resolvedAt && a.severity === 'critical').length || undefined, requiredPermission: 'VIEW_BUDGET' },
                { href: '/subcontractors', label: 'Subcontractors', icon: <Store className="w-5 h-5" />, badge: (data.subcontractorInvoices || []).filter(inv => inv.status === 'pending-approval' || inv.status === 'submitted').length || undefined, requiredPermission: 'VIEW_SUB_INVOICES' },
            ],
            requiredPermissions: ['VIEW_PRICING']
        },
        {
            title: 'Operations',
            items: [
                { href: '/schedule', label: 'Master Schedule', icon: <Calendar className="w-5 h-5" />, requiredPermission: 'VIEW_SCHEDULE' },
                { href: '/intelligence', label: 'Intelligence', icon: <Brain className="w-5 h-5" />, requiredPermission: 'VIEW_INTELLIGENCE_CENTER' },
                { href: '/materials', label: 'Materials', icon: <Truck className="w-5 h-5" />, badge: data.deliveries?.filter(d => d.status === 'scheduled' || d.status === 'arrived').length || 0, requiredPermission: 'VIEW_MATERIALS' },
                { href: '/inventory', label: 'Inventory', icon: <Package className="w-5 h-5" />, requiredPermission: 'VIEW_MATERIALS' },
                { href: '/vendors', label: 'Vendors', icon: <Store className="w-5 h-5" />, requiredPermission: 'VIEW_MATERIALS' },
            ]
        },
        {
            title: 'Team',
            items: [
                { href: '/team', label: 'Team Members', icon: <Users className="w-5 h-5" />, requiredPermission: 'MANAGE_USERS' },
            ],
            requiredPermissions: ['MANAGE_USERS']
        },
        {
            title: 'Communication',
            items: [
                { href: '/messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, badge: getUnreadMessageCount() },
            ]
        }
    ];

    // Filter sections based on permissions
    const filteredSections = navSections.filter(section => {
        if (!section.requiredPermissions) return true;
        return canAny(section.requiredPermissions);
    }).map(section => ({
        ...section,
        items: section.items.filter(item => {
            if (!item.requiredPermission) return true;
            return can(item.requiredPermission);
        })
    })).filter(section => section.items.length > 0);

    const roleInfo = getCurrentRoleInfo();
    const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

    return (
        <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-lg font-bold shadow-lg">
                    <Home className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight">FloorOps Pro</h1>
                    <p className="text-xs text-sidebar-foreground/60">Enterprise</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
                {filteredSections.map((section) => (
                    <div key={section.title} className="mb-6">
                        <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                            {section.title}
                        </div>
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const isActive = pathname === item.href ||
                                    (item.href !== '/' && pathname.startsWith(item.href));

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                            isActive
                                                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                                                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                                        )}
                                    >
                                        <span className={cn(
                                            'transition-colors',
                                            isActive ? 'text-primary' : 'text-sidebar-foreground/50'
                                        )}>
                                            {item.icon}
                                        </span>
                                        <span className="flex-1">{item.label}</span>
                                        {item.badge !== undefined && item.badge > 0 && (
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    'ml-auto text-xs px-2 py-0.5 min-w-[1.5rem] justify-center',
                                                    isActive ? 'bg-primary/20 text-primary' : 'bg-sidebar-accent text-sidebar-foreground/60'
                                                )}
                                            >
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-sidebar-border">
                <div className="flex items-center gap-3">
                    <div
                        className="flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold"
                        style={{ backgroundColor: roleInfo?.color || 'hsl(var(--chart-1))' }}
                    >
                        {isLoaded && currentUser ? getInitials(currentUser.name) : '...'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">
                            {isLoaded && currentUser ? currentUser.name : 'Loading...'}
                        </div>
                        <div
                            className="text-xs truncate"
                            style={{ color: roleInfo?.color || 'inherit' }}
                        >
                            {roleInfo?.icon} {roleInfo?.label || 'Loading...'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function Sidebar() {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 flex-shrink-0 border-r border-sidebar-border">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-background shadow-lg">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}

