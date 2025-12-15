'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/components/data-provider';
import { toast } from 'sonner';
import { Timer, Thermometer, Droplets, MapPin, Package, Info } from 'lucide-react';
import { MaterialType, ACCLIMATION_REQUIREMENTS } from '@/lib/data';
import { cn } from '@/lib/utils';

interface AcclimationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const materialTypeLabels: Record<MaterialType, string> = {
    lvp: 'LVP (Luxury Vinyl Plank)',
    hardwood: 'Hardwood',
    engineered: 'Engineered Hardwood',
    laminate: 'Laminate',
    tile: 'Tile',
    carpet: 'Carpet',
};

export function AcclimationModal({ open, onOpenChange }: AcclimationModalProps) {
    const { data, startAcclimation } = useData();
    const [projectId, setProjectId] = useState<string>('');
    const [materialName, setMaterialName] = useState('');
    const [materialType, setMaterialType] = useState<MaterialType>('lvp');
    const [lotNumber, setLotNumber] = useState('');
    const [location, setLocation] = useState('');
    const [customHours, setCustomHours] = useState<number | null>(null);
    const [initialTemp, setInitialTemp] = useState<number>(70);
    const [initialHumidity, setInitialHumidity] = useState<number>(45);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get recent deliveries for material suggestions
    const recentMaterials = useMemo(() => {
        const lots = data.materialLots || [];
        const deliveries = data.deliveries || [];

        // Get unique materials from recent deliveries and lots
        const materials = new Set<string>();
        lots.slice(-10).forEach(l => materials.add(l.materialName));
        deliveries.forEach(d => d.lineItems.forEach(li => materials.add(li.materialName)));

        return Array.from(materials);
    }, [data.materialLots, data.deliveries]);

    // Get requirements for selected material type
    const requirements = ACCLIMATION_REQUIREMENTS[materialType];
    const requiredHours = customHours || requirements.hours;

    // Check if conditions are within range
    const tempInRange = initialTemp >= requirements.minTemp && initialTemp <= requirements.maxTemp;
    const humidityInRange = initialHumidity >= requirements.minHumidity && initialHumidity <= requirements.maxHumidity;

    const handleSubmit = async () => {
        if (!projectId) {
            toast.error('Please select a project');
            return;
        }
        if (!materialName) {
            toast.error('Please enter a material name');
            return;
        }
        if (!location) {
            toast.error('Please enter a location');
            return;
        }

        setIsSubmitting(true);

        try {
            const project = data.projects.find(p => p.id === Number(projectId));

            startAcclimation({
                materialName,
                materialType,
                lotNumber: lotNumber || undefined,
                projectId: Number(projectId),
                projectName: project?.name || 'Unknown Project',
                location,
                requiredHours,
                startTime: new Date().toISOString(),
                status: 'in-progress',
                readings: [{
                    id: `rd-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    temperature: initialTemp,
                    humidity: initialHumidity,
                    recordedBy: 'Derek Morrison', // TODO: Get from auth
                    notes: 'Initial reading at start of acclimation'
                }],
                minTemp: requirements.minTemp,
                maxTemp: requirements.maxTemp,
                minHumidity: requirements.minHumidity,
                maxHumidity: requirements.maxHumidity,
            });

            toast.success(`Acclimation timer started! Material will be ready in ${requiredHours} hours.`);
            onOpenChange(false);

            // Reset form
            setProjectId('');
            setMaterialName('');
            setMaterialType('lvp');
            setLotNumber('');
            setLocation('');
            setCustomHours(null);
            setInitialTemp(70);
            setInitialHumidity(45);
        } catch (error) {
            toast.error('Failed to start acclimation');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Timer className="w-5 h-5 text-primary" />
                        Start Material Acclimation
                    </DialogTitle>
                    <DialogDescription>
                        Track material acclimation time and environmental conditions
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    {/* Project Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="project">Project *</Label>
                        <Select value={projectId} onValueChange={setProjectId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                            <SelectContent>
                                {data.projects.map(project => (
                                    <SelectItem key={project.id} value={String(project.id)}>
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Material Info */}
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="materialName">Material Name *</Label>
                            <Input
                                id="materialName"
                                placeholder="e.g., Shaw Endura LVP - Oak"
                                value={materialName}
                                onChange={(e) => setMaterialName(e.target.value)}
                                list="recent-materials"
                            />
                            <datalist id="recent-materials">
                                {recentMaterials.map(m => (
                                    <option key={m} value={m} />
                                ))}
                            </datalist>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="materialType">Material Type</Label>
                                <Select value={materialType} onValueChange={(v) => setMaterialType(v as MaterialType)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(Object.keys(materialTypeLabels) as MaterialType[]).map(type => (
                                            <SelectItem key={type} value={type}>
                                                {materialTypeLabels[type]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lotNumber">Lot Number</Label>
                                <Input
                                    id="lotNumber"
                                    placeholder="Optional"
                                    value={lotNumber}
                                    onChange={(e) => setLotNumber(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location" className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Location *
                        </Label>
                        <Input
                            id="location"
                            placeholder="e.g., Job site - Main lobby staging area"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    {/* Acclimation Time */}
                    <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                                <Timer className="w-4 h-4" />
                                Required Acclimation Time
                            </Label>
                            <span className="text-2xl font-bold text-primary">{requiredHours}h</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Info className="w-4 h-4" />
                            <span>Default for {materialTypeLabels[materialType]}: {requirements.hours} hours</span>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Custom Hours (optional)</Label>
                            <Input
                                type="number"
                                min="1"
                                max="168"
                                placeholder={String(requirements.hours)}
                                value={customHours || ''}
                                onChange={(e) => setCustomHours(e.target.value ? Number(e.target.value) : null)}
                            />
                        </div>
                    </div>

                    {/* Initial Conditions */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Initial Conditions</Label>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="temp" className="flex items-center gap-2 text-sm">
                                    <Thermometer className="w-4 h-4 text-red-500" />
                                    Temperature (°F)
                                </Label>
                                <Input
                                    id="temp"
                                    type="number"
                                    min="40"
                                    max="100"
                                    value={initialTemp}
                                    onChange={(e) => setInitialTemp(Number(e.target.value))}
                                    className={cn(!tempInRange && "border-red-500")}
                                />
                                <p className={cn(
                                    "text-xs",
                                    tempInRange ? "text-muted-foreground" : "text-red-500"
                                )}>
                                    Range: {requirements.minTemp}°F - {requirements.maxTemp}°F
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="humidity" className="flex items-center gap-2 text-sm">
                                    <Droplets className="w-4 h-4 text-blue-500" />
                                    Humidity (%)
                                </Label>
                                <Input
                                    id="humidity"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={initialHumidity}
                                    onChange={(e) => setInitialHumidity(Number(e.target.value))}
                                    className={cn(!humidityInRange && "border-red-500")}
                                />
                                <p className={cn(
                                    "text-xs",
                                    humidityInRange ? "text-muted-foreground" : "text-red-500"
                                )}>
                                    Range: {requirements.minHumidity}% - {requirements.maxHumidity}%
                                </p>
                            </div>
                        </div>

                        {(!tempInRange || !humidityInRange) && (
                            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/50 text-yellow-600 text-sm">
                                ⚠️ Current conditions are outside the recommended range. Acclimation may not be effective.
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Starting...' : 'Start Acclimation Timer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
