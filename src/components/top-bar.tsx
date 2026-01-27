'use client';

import { useTheme } from './theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePermissions } from './permission-context';
import { RoleSwitcher } from '@/components/role-switcher';
import { Sun, Moon, Plus, Search, ShieldAlert, LogOut } from 'lucide-react';

function DemoMiniBanner() {
    const { isDemoMode, signOut } = usePermissions();
    if (!isDemoMode) return null;

    return (
        <div className="hidden md:flex items-center pl-3 pr-2 py-1.5 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/25 group hover:shadow-purple-500/40 transition-all duration-300 select-none">
            <div className="flex items-center gap-2 mr-3 border-r border-white/20 pr-3">
                <ShieldAlert className="w-4 h-4 animate-pulse fill-white/20" />
                <span className="text-xs font-bold uppercase tracking-wider">Demo Mode</span>
            </div>

            <span className="text-xs font-medium text-white/90 mr-4 tracking-tight hidden lg:inline-block">Viewing Sample Data</span>

            <button
                onClick={signOut}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/25 active:bg-white/30 text-[10px] font-bold uppercase tracking-wide transition-colors border border-white/10"
            >
                <LogOut className="w-3 h-3" />
                Exit
            </button>
        </div>
    );
}

interface TopBarProps {
    title: string;
    breadcrumb: string;
    showNewProject?: boolean;
    onNewProject?: () => void;
    children?: React.ReactNode;
}

export function TopBar({
    title,
    breadcrumb,
    showNewProject = true,
    onNewProject,
    children
}: TopBarProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="flex items-center justify-between gap-4 p-4 lg:p-6">
                {/* Left: Title & Breadcrumb */}
                <div className="flex-1 min-w-0 lg:pl-0 pl-14">
                    <h1 className="text-xl lg:text-2xl font-bold tracking-tight truncate">{title}</h1>
                    <p className="text-sm text-muted-foreground truncate">{breadcrumb}</p>
                </div>

                {/* Demo Mode Badge - Compact & Always Visible */}
                {/* Demo Mini-Banner - Premium & Persistent */}
                <DemoMiniBanner />

                {/* Center: Children (optional project selector, etc.) */}
                {children}

                {/* Right: Search, Role Switcher, Theme, Actions */}
                <div className="flex items-center gap-2 lg:gap-3">
                    {/* Search - Hidden on mobile */}
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search..."
                            className="w-48 lg:w-64 pl-9 bg-muted/50 border-0 focus-visible:ring-1"
                        />
                    </div>

                    {/* Role Switcher */}
                    <RoleSwitcher />

                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-full"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? (
                            <Sun className="h-5 w-5 text-yellow-500" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </Button>

                    {/* New Project Button */}
                    {showNewProject && (
                        <Button
                            onClick={onNewProject}
                            className="hidden sm:flex gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden lg:inline">New Project</span>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}

