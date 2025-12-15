'use client';

import { useTheme } from './theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleSwitcher } from '@/components/role-switcher';
import { Sun, Moon, Plus, Search } from 'lucide-react';

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

