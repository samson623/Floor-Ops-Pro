'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CrewMember } from '@/lib/data';
import { User, Phone, DollarSign, Award, Plus, X } from 'lucide-react';

interface CrewMemberModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    crewId: string;
    crewName: string;
    member?: CrewMember;
    onSave: (crewId: string, member: CrewMember) => void;
}

const CERTIFICATION_OPTIONS = [
    'LVP', 'Tile', 'Hardwood', 'Carpet', 'Epoxy', 'Vinyl Sheet', 'General', 'Lead Safe', 'OSHA 10', 'OSHA 30'
];

export function CrewMemberModal({
    open,
    onOpenChange,
    crewId,
    crewName,
    member,
    onSave
}: CrewMemberModalProps) {
    const isEditing = !!member;

    const [name, setName] = useState('');
    const [role, setRole] = useState<CrewMember['role']>('installer');
    const [phone, setPhone] = useState('');
    const [hourlyRate, setHourlyRate] = useState(40);
    const [certifications, setCertifications] = useState<string[]>([]);
    const [newCertification, setNewCertification] = useState('');

    useEffect(() => {
        if (member) {
            setName(member.name);
            setRole(member.role);
            setPhone(member.phone || '');
            setHourlyRate(member.hourlyRate);
            setCertifications(member.certifications || []);
        } else {
            setName('');
            setRole('installer');
            setPhone('');
            setHourlyRate(40);
            setCertifications([]);
        }
    }, [member, open]);

    const handleAddCertification = (cert: string) => {
        if (cert && !certifications.includes(cert)) {
            setCertifications([...certifications, cert]);
        }
        setNewCertification('');
    };

    const handleRemoveCertification = (cert: string) => {
        setCertifications(certifications.filter(c => c !== cert));
    };

    const handleSave = () => {
        if (!name.trim()) {
            toast.error('Please enter a name');
            return;
        }

        const newMember: CrewMember = {
            id: member?.id || Date.now(),
            name: name.trim(),
            role,
            phone: phone.trim() || undefined,
            hourlyRate,
            certifications
        };

        onSave(crewId, newMember);
        toast.success(isEditing ? 'Team member updated' : 'Team member added');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        {isEditing ? 'Edit Team Member' : 'Add Team Member'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing ? `Editing ${member.name}` : `Adding to ${crewName}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter name"
                        />
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <Label>Role *</Label>
                        <Select value={role} onValueChange={(v) => setRole(v as CrewMember['role'])}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="lead">Lead</SelectItem>
                                <SelectItem value="installer">Installer</SelectItem>
                                <SelectItem value="helper">Helper</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Phone
                        </Label>
                        <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(555) 123-4567"
                        />
                    </div>

                    {/* Hourly Rate */}
                    <div className="space-y-2">
                        <Label htmlFor="rate" className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Hourly Rate
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                                id="rate"
                                type="number"
                                value={hourlyRate}
                                onChange={(e) => setHourlyRate(Number(e.target.value))}
                                className="pl-7"
                                min={0}
                            />
                        </div>
                    </div>

                    {/* Certifications */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Certifications
                        </Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {certifications.map((cert) => (
                                <Badge key={cert} variant="secondary" className="gap-1">
                                    {cert}
                                    <button
                                        onClick={() => handleRemoveCertification(cert)}
                                        className="ml-1 hover:text-destructive"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <Select
                            value={newCertification}
                            onValueChange={(v) => handleAddCertification(v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Add certification..." />
                            </SelectTrigger>
                            <SelectContent>
                                {CERTIFICATION_OPTIONS.filter(c => !certifications.includes(c)).map((cert) => (
                                    <SelectItem key={cert} value={cert}>
                                        <span className="flex items-center gap-2">
                                            <Plus className="w-3 h-3" />
                                            {cert}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        {isEditing ? 'Save Changes' : 'Add Member'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
