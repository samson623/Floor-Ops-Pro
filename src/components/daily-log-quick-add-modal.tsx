'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useData } from '@/components/data-provider';
import { cn } from '@/lib/utils';
import {
    Sun, Cloud, CloudRain, Snowflake, Wind, Thermometer,
    Clock, Users, Hammer, Camera, AlertTriangle, Plus, X,
    CheckCircle2, FileText, ChevronDown, ChevronUp, Package
} from 'lucide-react';
import {
    DailyLog, WeatherCondition, DelayType, CrewMemberLog,
    DailyLogDelay, DailyLogPhoto, PhaseType, MaterialUsageLog
} from '@/lib/data';

interface DailyLogQuickAddModalProps {
    open: boolean;
    onClose: () => void;
    projectId: number;
    projectName: string;
    initialData?: DailyLog;
}

const WEATHER_OPTIONS: { value: WeatherCondition; icon: React.ReactNode; label: string }[] = [
    { value: 'sunny', icon: <Sun className="h-5 w-5 text-yellow-500" />, label: 'Sunny' },
    { value: 'cloudy', icon: <Cloud className="h-5 w-5 text-gray-400" />, label: 'Cloudy' },
    { value: 'rain', icon: <CloudRain className="h-5 w-5 text-blue-500" />, label: 'Rain' },
    { value: 'snow', icon: <Snowflake className="h-5 w-5 text-cyan-300" />, label: 'Snow' },
    { value: 'windy', icon: <Wind className="h-5 w-5 text-gray-500" />, label: 'Windy' },
    { value: 'extreme-heat', icon: <Thermometer className="h-5 w-5 text-red-500" />, label: 'Hot' },
    { value: 'extreme-cold', icon: <Thermometer className="h-5 w-5 text-blue-300" />, label: 'Cold' },
];

const DELAY_TYPES: { value: DelayType; label: string; icon: string }[] = [
    { value: 'weather', label: 'Weather', icon: '🌧️' },
    { value: 'material-delay', label: 'Material Delay', icon: '📦' },
    { value: 'material-defect', label: 'Material Defect', icon: '❌' },
    { value: 'access-restriction', label: 'Access Issue', icon: '🚫' },
    { value: 'client-delay', label: 'Client Delay', icon: '👤' },
    { value: 'subcontractor-delay', label: 'Sub Delay', icon: '🤝' },
    { value: 'equipment-failure', label: 'Equipment', icon: '🔧' },
    { value: 'site-condition', label: 'Site Issue', icon: '🏗️' },
    { value: 'inspection-required', label: 'Inspection', icon: '📋' },
    { value: 'labor-shortage', label: 'Labor', icon: '👷' },
    { value: 'other', label: 'Other', icon: '❓' },
];

const RESPONSIBLE_PARTIES = [
    { value: 'client', label: 'Client' },
    { value: 'supplier', label: 'Supplier/Vendor' },
    { value: 'weather', label: 'Weather' },
    { value: 'subcontractor', label: 'Subcontractor' },
    { value: 'internal', label: 'Internal' },
    { value: 'gc', label: 'General Contractor' },
    { value: 'other', label: 'Other' },
];

const PHASES: { value: PhaseType; label: string }[] = [
    { value: 'demo', label: 'Demo' },
    { value: 'prep', label: 'Prep' },
    { value: 'acclimation', label: 'Acclimation' },
    { value: 'install', label: 'Install' },
    { value: 'cure', label: 'Cure' },
    { value: 'punch', label: 'Punch' },
    { value: 'closeout', label: 'Closeout' },
];

export function DailyLogQuickAddModal({ open, onClose, projectId, projectName, initialData }: DailyLogQuickAddModalProps) {
    const { addDailyLog, updateDailyLog, getTeamMembers } = useData();
    const teamMembers = getTeamMembers();

    const today = new Date().toISOString().split('T')[0];

    // Form state
    const [date, setDate] = useState(today);
    const [weather, setWeather] = useState<WeatherCondition>('sunny');
    const [temperature, setTemperature] = useState<number>(70);
    const [phase, setPhase] = useState<PhaseType>('install');
    const [workCompleted, setWorkCompleted] = useState('');
    const [sqftCompleted, setSqftCompleted] = useState<number>(0);
    const [areasWorked, setAreasWorked] = useState('');

    // Crew state
    const [crewMembers, setCrewMembers] = useState<CrewMemberLog[]>([]);
    const [showCrewSection, setShowCrewSection] = useState(true);

    // Delay state
    const [delays, setDelays] = useState<DailyLogDelay[]>([]);
    const [showDelaySection, setShowDelaySection] = useState(false);
    const [newDelayType, setNewDelayType] = useState<DelayType>('material-delay');
    const [newDelayDescription, setNewDelayDescription] = useState('');
    const [newDelayDuration, setNewDelayDuration] = useState(30);
    const [newDelayResponsible, setNewDelayResponsible] = useState<'client' | 'supplier' | 'weather' | 'subcontractor' | 'internal' | 'gc' | 'other'>('supplier');

    // Material state
    const [materials, setMaterials] = useState<MaterialUsageLog[]>([]);
    const [showMaterialSection, setShowMaterialSection] = useState(false);
    const [newMaterialName, setNewMaterialName] = useState('');
    const [newMaterialQty, setNewMaterialQty] = useState(0);
    const [newMaterialUnit, setNewMaterialUnit] = useState('units');

    // Additional
    const [clientOnSite, setClientOnSite] = useState(false);
    const [safetyNotes, setSafetyNotes] = useState('');
    const [siteConditions, setSiteConditions] = useState('');

    // Load initial data if provided
    useMemo(() => {
        if (open && initialData) {
            setDate(initialData.date);
            setWeather(initialData.weather);
            setTemperature(initialData.temperature || 70);
            setPhase(initialData.phase || 'install');
            setWorkCompleted(initialData.workCompleted || initialData.notes || '');
            setSqftCompleted(initialData.sqftCompleted || 0);
            setAreasWorked(initialData.areasWorked?.join(', ') || '');
            setCrewMembers(initialData.crewMembers || []);
            setDelays(initialData.delays || []);
            setMaterials(initialData.materialsUsed || []);
            setClientOnSite(initialData.clientOnSite || false);
            setSafetyNotes(initialData.safetyNotes || '');
            setSiteConditions(initialData.siteConditions || '');
            setShowDelaySection((initialData.delays?.length || 0) > 0);
            setShowMaterialSection((initialData.materialsUsed?.length || 0) > 0);
        } else if (open && !initialData) {
            // Reset to defaults if opening fresh
            setDate(today);
            setWeather('sunny');
            setTemperature(70);
            setPhase('install');
            setWorkCompleted('');
            setSqftCompleted(0);
            setAreasWorked('');
            setCrewMembers([]);
            setDelays([]);
            setMaterials([]);
            setClientOnSite(false);
            setSafetyNotes('');
            setSiteConditions('');
            setShowDelaySection(false);
            setShowMaterialSection(false);
        }
    }, [open, initialData, today]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate totals
    const totalHours = useMemo(() =>
        crewMembers.reduce((sum, cm) => sum + cm.hoursWorked, 0),
        [crewMembers]
    );

    const addCrewMember = () => {
        const newMember: CrewMemberLog = {
            id: `cm-${Date.now()}`,
            userId: 0,
            name: '',
            role: 'installer',
            hoursWorked: 8,
        };
        setCrewMembers([...crewMembers, newMember]);
    };

    const updateCrewMember = (index: number, updates: Partial<CrewMemberLog>) => {
        const newCrewMembers = [...crewMembers];
        newCrewMembers[index] = { ...newCrewMembers[index], ...updates };
        setCrewMembers(newCrewMembers);
    };

    const removeCrewMember = (index: number) => {
        setCrewMembers(crewMembers.filter((_, i) => i !== index));
    };

    const addDelay = () => {
        if (!newDelayDescription.trim()) return;

        const delay: DailyLogDelay = {
            id: `delay-${Date.now()}`,
            type: newDelayType,
            description: newDelayDescription,
            duration: newDelayDuration,
            responsibleParty: newDelayResponsible,
            documentedAt: new Date().toISOString(),
        };
        setDelays([...delays, delay]);
        setNewDelayDescription('');
        setNewDelayDuration(30);
    };

    const removeDelay = (index: number) => {
        setDelays(delays.filter((_, i) => i !== index));
    };

    const addMaterial = () => {
        if (!newMaterialName.trim()) return;
        const material: MaterialUsageLog = {
            materialName: newMaterialName,
            quantityUsed: newMaterialQty,
            unit: newMaterialUnit
        };
        setMaterials([...materials, material]);
        setNewMaterialName('');
        setNewMaterialQty(0);
    };

    const removeMaterial = (index: number) => {
        setMaterials(materials.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const now = new Date().toISOString();
            const areasArray = areasWorked.split(',').map(a => a.trim()).filter(Boolean);

            const logData: Omit<DailyLog, 'id'> = {
                projectId,
                date,
                crewMembers,
                totalCrewCount: crewMembers.length,
                totalHours,
                workCompleted: workCompleted || 'Daily work completed',
                sqftCompleted,
                phase,
                areasWorked: areasArray.length > 0 ? areasArray : ['General'],
                weather,
                temperature,
                delays,
                hasDelays: delays.length > 0,
                totalDelayMinutes: delays.reduce((sum, d) => sum + d.duration, 0),
                photos: initialData?.photos || [],
                materialsUsed: materials,
                incidentReported: initialData?.incidentReported || false,
                clientOnSite,
                safetyNotes: safetyNotes || undefined,
                siteConditions: siteConditions || undefined,
                signedBy: initialData?.signedBy || 'Current User', // TODO: Get from auth
                signedAt: initialData?.signedAt || now,
                createdBy: initialData?.createdBy || 'Current User', // TODO: Get from auth
                createdByUserId: initialData?.createdByUserId || 0,
                createdAt: initialData?.createdAt || now,
                submittedOffline: initialData?.submittedOffline || false,
                // Legacy compat
                crew: crewMembers.length,
                hours: totalHours,
                notes: workCompleted,
            };

            if (initialData) {
                updateDailyLog(projectId, initialData.id, logData);
            } else {
                addDailyLog(projectId, logData);
            }
            onClose();

            // Reset form
            setWorkCompleted('');
            setSqftCompleted(0);
            setAreasWorked('');
            setCrewMembers([]);
            setDelays([]);
            setClientOnSite(false);
            setSafetyNotes('');
            setSiteConditions('');

        } catch (error) {
            console.error('Error submitting daily log:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={() => onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] sm:max-h-[90vh] h-[100dvh] sm:h-auto overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        {initialData ? 'Edit Daily Log' : 'New Daily Log'}
                    </DialogTitle>
                    <DialogDescription>
                        {projectName} • {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Date & Phase Row - Stack on mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                max={today}
                            />
                        </div>
                        <div>
                            <Label>Phase</Label>
                            <Select value={phase} onValueChange={(v) => setPhase(v as PhaseType)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PHASES.map((p) => (
                                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Weather Selection */}
                    <div>
                        <Label className="mb-2 block">Weather</Label>
                        <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-2">
                            {WEATHER_OPTIONS.map((w) => (
                                <button
                                    key={w.value}
                                    type="button"
                                    onClick={() => setWeather(w.value)}
                                    className={cn(
                                        "flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-3 sm:py-2 rounded-lg border transition-all min-h-[48px] touch-target-sm",
                                        weather === w.value
                                            ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                                            : "border-border hover:bg-accent active:scale-95"
                                    )}
                                >
                                    {w.icon}
                                    <span className="text-xs sm:text-sm">{w.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <Thermometer className="h-4 w-4 text-muted-foreground" />
                            <Input
                                type="number"
                                value={temperature}
                                onChange={(e) => setTemperature(Number(e.target.value))}
                                className="w-20"
                            />
                            <span className="text-sm text-muted-foreground">°F</span>
                        </div>
                    </div>

                    {/* Work Completed */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Label>Work Completed</Label>
                            <Textarea
                                placeholder="Describe today's work..."
                                value={workCompleted}
                                onChange={(e) => setWorkCompleted(e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div>
                            <Label>Sq Ft Completed</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={sqftCompleted || ''}
                                onChange={(e) => setSqftCompleted(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <Label>Areas Worked</Label>
                            <Input
                                placeholder="Lobby, Hallway, Room 101..."
                                value={areasWorked}
                                onChange={(e) => setAreasWorked(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Crew Section */}
                    <Card className="p-4">
                        <button
                            type="button"
                            onClick={() => setShowCrewSection(!showCrewSection)}
                            className="w-full flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                <span className="font-medium">Crew ({crewMembers.length})</span>
                                {totalHours > 0 && (
                                    <Badge variant="secondary">{totalHours} hrs</Badge>
                                )}
                            </div>
                            {showCrewSection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>

                        {showCrewSection && (
                            <div className="mt-4 space-y-3">
                                {crewMembers.map((member, idx) => (
                                    <div key={member.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 sm:p-0 bg-muted/30 sm:bg-transparent rounded-lg sm:rounded-none">
                                        <Input
                                            placeholder="Name"
                                            value={member.name}
                                            onChange={(e) => updateCrewMember(idx, { name: e.target.value })}
                                            className="flex-1 h-12 sm:h-9"
                                        />
                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={member.role}
                                                onValueChange={(v) => updateCrewMember(idx, { role: v as CrewMemberLog['role'] })}
                                            >
                                                <SelectTrigger className="flex-1 sm:w-32 h-12 sm:h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="lead">Lead</SelectItem>
                                                    <SelectItem value="installer">Installer</SelectItem>
                                                    <SelectItem value="helper">Helper</SelectItem>
                                                    <SelectItem value="apprentice">Apprentice</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="number"
                                                value={member.hoursWorked}
                                                onChange={(e) => updateCrewMember(idx, { hoursWorked: Number(e.target.value) })}
                                                className="w-20 h-12 sm:h-9"
                                            />
                                            <span className="text-sm text-muted-foreground">hrs</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-12 w-12 sm:h-9 sm:w-9"
                                                onClick={() => removeCrewMember(idx)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addCrewMember}
                                    className="w-full h-12 sm:h-9"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Crew Member
                                </Button>
                            </div>
                        )}
                    </Card>

                    {/* Delays Section */}
                    <Card className={cn("p-4", delays.length > 0 && "border-amber-500/50 bg-amber-500/5")}>
                        <button
                            type="button"
                            onClick={() => setShowDelaySection(!showDelaySection)}
                            className="w-full flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <AlertTriangle className={cn("h-5 w-5", delays.length > 0 ? "text-amber-500" : "text-muted-foreground")} />
                                <span className="font-medium">Delays & Blockers</span>
                                {delays.length > 0 && (
                                    <Badge variant="outline" className="border-amber-500 text-amber-600">
                                        {delays.length} delay{delays.length !== 1 ? 's' : ''}
                                    </Badge>
                                )}
                            </div>
                            {showDelaySection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>

                        {showDelaySection && (
                            <div className="mt-4 space-y-3">
                                {/* Existing delays */}
                                {delays.map((delay, idx) => (
                                    <div key={delay.id} className="flex items-start gap-2 p-2 bg-background rounded border">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span>{DELAY_TYPES.find(d => d.value === delay.type)?.icon}</span>
                                                <span className="font-medium text-sm">{DELAY_TYPES.find(d => d.value === delay.type)?.label}</span>
                                                <Badge variant="outline" className="text-xs">{delay.duration} min</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{delay.description}</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeDelay(idx)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}

                                {/* Add new delay */}
                                <div className="space-y-2 pt-2 border-t">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <Select value={newDelayType} onValueChange={(v) => setNewDelayType(v as DelayType)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DELAY_TYPES.map((d) => (
                                                    <SelectItem key={d.value} value={d.value}>
                                                        <span className="flex items-center gap-2">
                                                            <span>{d.icon}</span>
                                                            <span>{d.label}</span>
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                value={newDelayDuration}
                                                onChange={(e) => setNewDelayDuration(Number(e.target.value))}
                                                className="w-20"
                                            />
                                            <span className="text-sm text-muted-foreground">mins</span>
                                        </div>
                                    </div>
                                    <Textarea
                                        placeholder="Describe the delay..."
                                        value={newDelayDescription}
                                        onChange={(e) => setNewDelayDescription(e.target.value)}
                                        rows={1}
                                    />
                                    <div className="flex items-center gap-2">
                                        <Select value={newDelayResponsible} onValueChange={(v) => setNewDelayResponsible(v as typeof newDelayResponsible)}>
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Responsible party" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {RESPONSIBLE_PARTIES.map((p) => (
                                                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            onClick={addDelay}
                                            disabled={!newDelayDescription.trim()}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Quick toggles */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setClientOnSite(!clientOnSite)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm",
                                clientOnSite
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:bg-accent"
                            )}
                        >
                            <Users className="h-4 w-4" />
                            Client on site
                            {clientOnSite && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        </button>
                    </div>

                    {/* Additional notes */}
                    <div>
                        <Label>Site Conditions / Safety Notes (Optional)</Label>
                        <Textarea
                            placeholder="Any site issues, safety concerns, or notes for the record..."
                            value={siteConditions}
                            onChange={(e) => setSiteConditions(e.target.value)}
                            rows={2}
                        />
                    </div>
                </div>

                {/* Footer */}
                {/* Footer - Sticky on mobile for thumb access */}
                <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t sticky bottom-0 bg-background pb-safe">
                    <div className="text-sm text-muted-foreground text-center sm:text-left">
                        {crewMembers.length > 0 && (
                            <span>{crewMembers.length} crew • {totalHours} hours</span>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={onClose} className="h-12 sm:h-9 order-2 sm:order-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="min-w-[120px] h-12 sm:h-9 order-1 sm:order-2"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin">⏳</span>
                                    Saving...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {initialData ? 'Update Log' : 'Save Log'}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
