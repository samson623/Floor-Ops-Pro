'use client';

import { useState } from 'react';
import { TopBar } from '@/components/top-bar';
import { usePermissions } from '@/components/permission-context';
import { getRoleInfo, getAllRoles, UserRole, User } from '@/lib/permissions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit2, Shield, Mail, Phone, Users, CheckCircle2 } from 'lucide-react';

export default function TeamPage() {
    const { getAllUsers, addUser, updateUser, can, currentUser } = usePermissions();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'installer' as UserRole });

    const users = getAllUsers();
    const roles = getAllRoles();
    const canManage = can('MANAGE_USERS');

    // If user doesn't have permission, redirect or show message
    if (!canManage) {
        return (
            <>
                <TopBar title="Team" breadcrumb="Access Denied" showNewProject={false} />
                <div className="flex-1 flex items-center justify-center p-6">
                    <Card className="max-w-md">
                        <CardContent className="pt-6 text-center">
                            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
                            <p className="text-muted-foreground">You don&apos;t have permission to manage team members. Contact your administrator for access.</p>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    const handleAddUser = () => {
        if (!formData.name || !formData.email) {
            toast.error('Please fill in name and email');
            return;
        }
        addUser({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || undefined,
            role: formData.role,
            assignedProjectIds: [],
            assignedCrewIds: [],
            active: true
        });
        toast.success(`Added ${formData.name} as ${getRoleInfo(formData.role).label}`);
        setFormData({ name: '', email: '', phone: '', role: 'installer' });
        setShowAddModal(false);
    };

    const handleUpdateUser = () => {
        if (!editingUser) return;
        updateUser(editingUser.id, {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || undefined,
            role: formData.role
        });
        toast.success(`Updated ${formData.name}`);
        setEditingUser(null);
    };

    const openEditModal = (user: User) => {
        setFormData({ name: user.name, email: user.email, phone: user.phone || '', role: user.role });
        setEditingUser(user);
    };

    const getRoleBadgeStyle = (role: UserRole) => {
        const info = getRoleInfo(role);
        return { backgroundColor: `${info.color}20`, color: info.color, borderColor: `${info.color}40` };
    };

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <>
            <TopBar title="Team Management" breadcrumb="Manage your flooring crew" showNewProject={false} />

            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                {/* Header with Add Button */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Team Members</h2>
                        <p className="text-muted-foreground">{users.length} members across {roles.length} roles</p>
                    </div>
                    <Button onClick={() => setShowAddModal(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Member
                    </Button>
                </div>

                {/* Role Legend */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Role Permissions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {roles.map(role => (
                                <div key={role.role} className="p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{role.icon}</span>
                                        <span className="font-medium text-sm">{role.label}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{role.description}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Team Members Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map(user => {
                        const roleInfo = getRoleInfo(user.role);
                        const isCurrentUser = user.id === currentUser?.id;

                        return (
                            <Card key={user.id} className={`relative overflow-hidden ${!user.active ? 'opacity-60' : ''}`}>
                                {isCurrentUser && (
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">You</Badge>
                                    </div>
                                )}
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex items-center justify-center w-14 h-14 rounded-full text-white text-lg font-bold shrink-0"
                                            style={{ backgroundColor: roleInfo.color }}>
                                            {getInitials(user.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">{user.name}</h3>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className="text-lg">{roleInfo.icon}</span>
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={getRoleBadgeStyle(user.role)}>
                                                    {roleInfo.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail className="w-4 h-4" />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                        {user.phone && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Phone className="w-4 h-4" />
                                                <span>{user.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Users className="w-4 h-4" />
                                            <span>{user.assignedProjectIds.length} assigned projects</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t flex justify-end">
                                        <Button variant="ghost" size="sm" onClick={() => openEditModal(user)} className="gap-1">
                                            <Edit2 className="w-3 h-3" />
                                            Edit
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Add/Edit User Modal */}
            <Dialog open={showAddModal || !!editingUser} onOpenChange={(open) => { if (!open) { setShowAddModal(false); setEditingUser(null); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
                        <DialogDescription>
                            {editingUser ? 'Update member details and role assignment.' : 'Add a new member to your flooring team.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="John Smith" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="john@company.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone (optional)</Label>
                            <Input id="phone" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="(555) 123-4567" />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={formData.role} onValueChange={(v: UserRole) => setFormData(p => ({ ...p, role: v }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map(role => (
                                        <SelectItem key={role.role} value={role.role}>
                                            <span className="flex items-center gap-2">
                                                <span>{role.icon}</span>
                                                <span>{role.label}</span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">{getRoleInfo(formData.role).description}</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowAddModal(false); setEditingUser(null); }}>Cancel</Button>
                        <Button onClick={editingUser ? handleUpdateUser : handleAddUser}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {editingUser ? 'Save Changes' : 'Add Member'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
