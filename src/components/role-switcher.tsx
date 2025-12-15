'use client';

import { useState } from 'react';
import { usePermissions } from './permission-context';
import { getRoleInfo, UserRole } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Shield, Check, Users } from 'lucide-react';

interface RoleSwitcherProps {
    onManageUsersClick?: () => void;
    compact?: boolean;
}

export function RoleSwitcher({ onManageUsersClick, compact = false }: RoleSwitcherProps) {
    const { currentUser, switchUser, getAllUsers, can, getCurrentRoleInfo, isLoaded } = usePermissions();
    const [open, setOpen] = useState(false);

    if (!isLoaded || !currentUser) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="hidden sm:block">
                    <div className="w-20 h-4 bg-muted rounded mb-1" />
                    <div className="w-16 h-3 bg-muted rounded" />
                </div>
            </div>
        );
    }

    const roleInfo = getCurrentRoleInfo();
    const users = getAllUsers().filter(u => u.active);
    const canManageUsers = can('MANAGE_USERS');

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const getRoleBadgeStyle = (role: UserRole) => {
        const info = getRoleInfo(role);
        return { backgroundColor: `${info.color}20`, color: info.color, borderColor: `${info.color}40` };
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={cn("flex items-center gap-2 h-auto py-1.5 px-2 hover:bg-accent/50", compact && "px-1.5")}>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold shadow-md" style={{ backgroundColor: roleInfo?.color || 'hsl(var(--primary))' }}>
                        {getInitials(currentUser.name)}
                    </div>
                    {!compact && (
                        <div className="hidden sm:flex flex-col items-start min-w-0">
                            <span className="text-sm font-medium truncate max-w-[120px]">{currentUser.name}</span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={getRoleBadgeStyle(currentUser.role)}>{roleInfo?.label}</span>
                        </div>
                    )}
                    <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-2">
                <DropdownMenuLabel className="flex items-center gap-2 p-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Switch User</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[320px] overflow-y-auto py-1">
                    {users.map(user => {
                        const userRoleInfo = getRoleInfo(user.role);
                        const isCurrentUser = user.id === currentUser.id;
                        return (
                            <DropdownMenuItem key={user.id} onClick={() => { if (!isCurrentUser) switchUser(user.id); setOpen(false); }}
                                className={cn("flex items-center gap-3 p-2.5 rounded-lg cursor-pointer", isCurrentUser && "bg-primary/10 border border-primary/20")}>
                                <div className="flex items-center justify-center w-9 h-9 rounded-full text-white text-xs font-bold shrink-0" style={{ backgroundColor: userRoleInfo.color }}>
                                    {getInitials(user.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium truncate">{user.name}</span>
                                        {isCurrentUser && <Check className="w-4 h-4 text-primary shrink-0" />}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-lg">{userRoleInfo.icon}</span>
                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={getRoleBadgeStyle(user.role)}>{userRoleInfo.label}</span>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        );
                    })}
                </div>
                {canManageUsers && onManageUsersClick && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => { onManageUsersClick(); setOpen(false); }} className="flex items-center gap-2 p-2 text-primary cursor-pointer">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">Manage Team</span>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
