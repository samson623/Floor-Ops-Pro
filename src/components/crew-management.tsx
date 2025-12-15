'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useData } from './data-provider';
import { Crew, CrewMember } from '@/lib/data';
import { getCrewUtilization } from '@/lib/scheduling-engine';
import {
    Users,
    Phone,
    Award,
    Clock,
    TrendingUp,
    Plus,
    Edit,
    MoreHorizontal,
    Calendar,
    MapPin,
    DollarSign,
    CheckCircle2
} from 'lucide-react';

export function CrewManagement() {
    const { data } = useData();
    const [selectedCrew, setSelectedCrew] = useState<string | null>(null);

    // Calculate utilization for current week
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const startStr = weekStart.toISOString().split('T')[0];
    const endStr = weekEnd.toISOString().split('T')[0];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-chart-2 to-chart-2/80 text-white shadow-lg shadow-chart-2/30">
                        <Users className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Crew Management</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your installation teams and track performance
                        </p>
                    </div>
                </div>
                <Button className="gap-2 shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" />
                    Add Crew
                </Button>
            </div>

            {/* Crew Cards */}
            <div className="grid gap-6">
                {data.crews.map((crew) => {
                    const utilization = getCrewUtilization(
                        crew,
                        startStr,
                        endStr,
                        data.scheduleEntries
                    );

                    return (
                        <CrewCard
                            key={crew.id}
                            crew={crew}
                            utilization={utilization}
                            isExpanded={selectedCrew === crew.id}
                            onToggle={() => setSelectedCrew(
                                selectedCrew === crew.id ? null : crew.id
                            )}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function CrewCard({
    crew,
    utilization,
    isExpanded,
    onToggle
}: {
    crew: Crew;
    utilization: { totalHours: number; scheduledHours: number; utilizationPercent: number };
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const getUtilizationColor = (percent: number) => {
        if (percent >= 80) return 'text-success';
        if (percent >= 50) return 'text-warning';
        return 'text-muted-foreground';
    };

    const getRoleBadge = (role: CrewMember['role']) => {
        switch (role) {
            case 'lead': return 'bg-primary text-primary-foreground';
            case 'installer': return 'bg-chart-2 text-white';
            case 'helper': return 'bg-muted text-muted-foreground';
        }
    };

    const totalRate = crew.members.reduce((sum, m) => sum + m.hourlyRate, 0);

    return (
        <Card className="overflow-hidden transition-all hover:shadow-lg">
            <div
                className="h-1.5 w-full"
                style={{ backgroundColor: crew.color }}
            />
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
                            style={{ backgroundColor: crew.color }}
                        >
                            {crew.name.split(' ').map(w => w[0]).join('')}
                        </div>
                        <div>
                            <CardTitle className="text-xl">{crew.name}</CardTitle>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {crew.members.length} members
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {crew.homeBase}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {crew.maxDailyCapacity}h/day capacity
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Utilization Ring */}
                        <div className="relative w-16 h-16">
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    className="text-muted/30"
                                />
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeDasharray={`${utilization.utilizationPercent * 1.76} 176`}
                                    className={getUtilizationColor(utilization.utilizationPercent)}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold">{utilization.utilizationPercent}%</span>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">This Week</p>
                            <p className="text-sm font-medium">
                                {utilization.scheduledHours}h / {utilization.totalHours}h
                            </p>
                        </div>

                        <Button variant="outline" size="sm" onClick={onToggle}>
                            {isExpanded ? 'Collapse' : 'Expand'}
                        </Button>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="pt-0">
                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-4 p-4 rounded-xl bg-muted/30 mb-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-chart-2">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-2xl font-bold">{utilization.utilizationPercent}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Utilization</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{utilization.scheduledHours}h</div>
                            <p className="text-xs text-muted-foreground mt-1">Scheduled</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">${totalRate}/h</div>
                            <p className="text-xs text-muted-foreground mt-1">Total Rate</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-success">12</div>
                            <p className="text-xs text-muted-foreground mt-1">Jobs Completed</p>
                        </div>
                    </div>

                    {/* Team Members */}
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Team Members
                    </h4>
                    <div className="space-y-2">
                        {crew.members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-background border hover:border-primary/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center font-medium text-sm">
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-medium">{member.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge className={cn('text-[10px] h-5 capitalize', getRoleBadge(member.role))}>
                                                {member.role}
                                            </Badge>
                                            {member.phone && (
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {member.phone}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Certifications */}
                                    <div className="flex items-center gap-1">
                                        {member.certifications.slice(0, 3).map((cert, idx) => (
                                            <Badge
                                                key={idx}
                                                variant="outline"
                                                className="text-[10px] h-5 bg-chart-2/5 border-chart-2/30 text-chart-2"
                                            >
                                                <Award className="w-2.5 h-2.5 mr-1" />
                                                {cert}
                                            </Badge>
                                        ))}
                                        {member.certifications.length > 3 && (
                                            <Badge variant="outline" className="text-[10px] h-5">
                                                +{member.certifications.length - 3}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <p className="font-bold text-sm flex items-center gap-1">
                                            <DollarSign className="w-3.5 h-3.5 text-success" />
                                            {member.hourlyRate}/hr
                                        </p>
                                    </div>

                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Edit className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Calendar className="w-4 h-4" />
                            View Schedule
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Member
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Clock className="w-4 h-4" />
                            Set Availability
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
