'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Project, InventoryItem, MoistureTest, MoistureTestReading, MoistureTestType, MOISTURE_LIMITS } from '@/lib/data';
import { useData } from '@/components/data-provider';
import { Plus, Trash2, Droplets } from 'lucide-react';

// ============================================================================
// NEW PROJECT MODAL
// ============================================================================

interface NewProjectModalProps {
    open: boolean;
    onClose: () => void;
    onCreate?: (project: Omit<Project, 'id'>) => void;
}

export function NewProjectModal({ open, onClose, onCreate }: NewProjectModalProps) {
    const { data } = useData();

    const [name, setName] = useState('');
    const [client, setClient] = useState('');
    const [address, setAddress] = useState('');
    const [sqft, setSqft] = useState('');
    const [type, setType] = useState('LVP');
    const [crew, setCrew] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [value, setValue] = useState('');

    const resetForm = () => {
        setName('');
        setClient('');
        setAddress('');
        setSqft('');
        setType('LVP');
        setCrew('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        setValue('');
    };

    const handleCreate = () => {
        if (!name.trim()) {
            toast.error('Please enter a project name');
            return;
        }
        if (!client.trim()) {
            toast.error('Please enter a client name');
            return;
        }
        if (!address.trim()) {
            toast.error('Please enter an address');
            return;
        }

        const projectValue = parseFloat(value) || 0;
        const projectSqft = parseInt(sqft) || 0;

        const newProject: Omit<Project, 'id'> = {
            key: name.toLowerCase().replace(/\s+/g, '-'),
            name: name.trim(),
            client: client.trim(),
            address: address.trim(),
            sqft: projectSqft,
            type,
            value: projectValue,
            progress: 0,
            status: 'pending',
            startDate,
            dueDate,
            crew: crew.trim() || 'TBD',
            milestones: [
                { id: 1, title: 'Project Created', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), status: 'completed' },
                { id: 2, title: 'Material Order', date: 'TBD', status: 'upcoming' },
                { id: 3, title: 'Project Start', date: startDate, status: 'upcoming' }
            ],
            punchList: [],
            dailyLogs: [],
            schedule: [],
            photos: [],
            photoCaptures: [],
            materials: [],
            changeOrders: [],
            qaChecklists: [],
            financials: {
                contract: projectValue,
                costs: 0,
                margin: 35
            },
            moistureTests: [],
            subfloorTests: [],
            siteConditions: [],
            safetyIncidents: [],
            complianceChecklists: [],
            // System of Record - initialized empty for new projects
            schedulePhases: [],
            materialDeliveries: [],
            phasePhotos: []
        };

        onCreate?.(newProject);
        resetForm();
        onClose();
        toast.success(`Project "${name}" created successfully!`);
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Fill in the details to create a new flooring project.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="name">Project Name *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Downtown Office Renovation"
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="client">Client Name *</Label>
                            <Input
                                id="client"
                                value={client}
                                onChange={(e) => setClient(e.target.value)}
                                placeholder="ABC Properties Inc"
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="address">Address *</Label>
                            <Input
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="123 Main Street, Suite 100"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sqft">Square Footage</Label>
                            <Input
                                id="sqft"
                                type="number"
                                value={sqft}
                                onChange={(e) => setSqft(e.target.value)}
                                placeholder="2500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Flooring Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LVP">LVP</SelectItem>
                                    <SelectItem value="Hardwood">Hardwood</SelectItem>
                                    <SelectItem value="Tile">Tile</SelectItem>
                                    <SelectItem value="Carpet">Carpet</SelectItem>
                                    <SelectItem value="Laminate">Laminate</SelectItem>
                                    <SelectItem value="Epoxy">Epoxy</SelectItem>
                                    <SelectItem value="Mixed">Mixed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="value">Project Value ($)</Label>
                            <Input
                                id="value"
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="45000"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="crew">Assigned Crew</Label>
                            <Input
                                id="crew"
                                value={crew}
                                onChange={(e) => setCrew(e.target.value)}
                                placeholder="Team A"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleCreate}>Create Project</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// ADD INVENTORY ITEM MODAL
// ============================================================================

interface AddInventoryModalProps {
    open: boolean;
    onClose: () => void;
    onCreate?: (item: Omit<InventoryItem, 'id'>) => void;
}

export function AddInventoryModal({ open, onClose, onCreate }: AddInventoryModalProps) {
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [stock, setStock] = useState('');
    const [reserved, setReserved] = useState('0');
    const [category, setCategory] = useState('flooring');

    const resetForm = () => {
        setName('');
        setSku('');
        setStock('');
        setReserved('0');
        setCategory('flooring');
    };

    const handleCreate = () => {
        if (!name.trim()) {
            toast.error('Please enter an item name');
            return;
        }
        if (!sku.trim()) {
            toast.error('Please enter a SKU');
            return;
        }
        if (!stock) {
            toast.error('Please enter stock quantity');
            return;
        }

        const newItem: Omit<InventoryItem, 'id'> = {
            name: name.trim(),
            sku: sku.trim().toUpperCase(),
            stock: parseInt(stock) || 0,
            reserved: parseInt(reserved) || 0
        };

        onCreate?.(newItem);
        resetForm();
        onClose();
        toast.success(`"${name}" added to inventory!`);
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Inventory Item</DialogTitle>
                    <DialogDescription>
                        Add a new item to the global inventory.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="itemName">Item Name *</Label>
                        <Input
                            id="itemName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Shaw Endura LVP - Oak"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sku">SKU *</Label>
                        <Input
                            id="sku"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            placeholder="SH-END-001"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock Quantity *</Label>
                            <Input
                                id="stock"
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder="100"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reserved">Reserved</Label>
                            <Input
                                id="reserved"
                                type="number"
                                value={reserved}
                                onChange={(e) => setReserved(e.target.value)}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="flooring">Flooring Material</SelectItem>
                                <SelectItem value="underlayment">Underlayment</SelectItem>
                                <SelectItem value="adhesive">Adhesive</SelectItem>
                                <SelectItem value="trim">Trim & Transitions</SelectItem>
                                <SelectItem value="tools">Tools</SelectItem>
                                <SelectItem value="accessories">Accessories</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleCreate}>Add Item</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// ADD MOISTURE TEST MODAL
// ============================================================================

interface AddMoistureTestModalProps {
    open: boolean;
    onClose: () => void;
    projectId: number;
    onCreate?: (test: Omit<MoistureTest, 'id'>) => void;
}

export function AddMoistureTestModal({ open, onClose, projectId, onCreate }: AddMoistureTestModalProps) {
    const [testType, setTestType] = useState<MoistureTestType>('rh-probe');
    const [readings, setReadings] = useState<Omit<MoistureTestReading, 'probeId'>[]>([
        { location: '', value: 0, depth: 1.2 }
    ]);
    const [ambientTemp, setAmbientTemp] = useState('68');
    const [ambientRH, setAmbientRH] = useState('45');
    const [manufacturerLimit, setManufacturerLimit] = useState('80');
    const [manufacturerName, setManufacturerName] = useState('');
    const [productName, setProductName] = useState('');
    const [notes, setNotes] = useState('');
    const [testedBy, setTestedBy] = useState('');

    const resetForm = () => {
        setTestType('rh-probe');
        setReadings([{ location: '', value: 0, depth: 1.2 }]);
        setAmbientTemp('68');
        setAmbientRH('45');
        setManufacturerLimit('80');
        setManufacturerName('');
        setProductName('');
        setNotes('');
        setTestedBy('');
    };

    const addReading = () => {
        setReadings([...readings, { location: '', value: 0, depth: 1.2 }]);
    };

    const removeReading = (index: number) => {
        if (readings.length > 1) {
            setReadings(readings.filter((_, i) => i !== index));
        }
    };

    const updateReading = (index: number, field: keyof Omit<MoistureTestReading, 'probeId'>, value: string | number) => {
        const newReadings = [...readings];
        newReadings[index] = { ...newReadings[index], [field]: value };
        setReadings(newReadings);
    };

    const handleCreate = () => {
        // Validate readings
        const validReadings = readings.filter(r => r.location.trim() && r.value > 0);
        if (validReadings.length === 0) {
            toast.error('Please add at least one valid reading');
            return;
        }
        if (!testedBy.trim()) {
            toast.error('Please enter who performed the test');
            return;
        }

        const limit = parseFloat(manufacturerLimit) || 80;
        const readingsWithProbes: MoistureTestReading[] = validReadings.map((r, idx) => ({
            ...r,
            probeId: `RH-${Date.now()}-${idx}`
        }));

        const highestReading = Math.max(...readingsWithProbes.map(r => r.value));
        const averageReading = readingsWithProbes.reduce((sum, r) => sum + r.value, 0) / readingsWithProbes.length;
        const passed = highestReading <= limit;

        const newTest: Omit<MoistureTest, 'id'> = {
            projectId,
            testDate: new Date().toISOString().split('T')[0],
            testType,
            readings: readingsWithProbes,
            ambientTemp: parseFloat(ambientTemp) || 68,
            ambientRH: parseFloat(ambientRH) || 45,
            manufacturerLimit: limit,
            manufacturerName: manufacturerName.trim() || undefined,
            productName: productName.trim() || undefined,
            passed,
            highestReading,
            averageReading,
            photos: [],
            notes: notes.trim() || undefined,
            testedBy: testedBy.trim(),
            retestRequired: !passed,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        onCreate?.(newTest);
        resetForm();
        onClose();
        toast.success(passed
            ? `Moisture test passed! (${highestReading}% RH)`
            : `Moisture test failed. Highest reading: ${highestReading}% RH (limit: ${limit}%)`
        );
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-blue-500" />
                        Add Moisture Test
                    </DialogTitle>
                    <DialogDescription>
                        Record moisture test results for this project. Tests are compared against manufacturer limits.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Test Type */}
                    <div className="space-y-2">
                        <Label>Test Type</Label>
                        <Select value={testType} onValueChange={(v) => setTestType(v as MoistureTestType)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="rh-probe">RH Probe (ASTM F2170)</SelectItem>
                                <SelectItem value="calcium-chloride">Calcium Chloride (ASTM F1869)</SelectItem>
                                <SelectItem value="pin-meter">Pin Meter</SelectItem>
                                <SelectItem value="tramex">Tramex (Surface)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Environmental Conditions */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ambientTemp">Ambient Temp (°F)</Label>
                            <Input
                                id="ambientTemp"
                                type="number"
                                value={ambientTemp}
                                onChange={(e) => setAmbientTemp(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ambientRH">Ambient RH (%)</Label>
                            <Input
                                id="ambientRH"
                                type="number"
                                value={ambientRH}
                                onChange={(e) => setAmbientRH(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="limit">Manufacturer Limit (% RH)</Label>
                            <Input
                                id="limit"
                                type="number"
                                value={manufacturerLimit}
                                onChange={(e) => setManufacturerLimit(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Manufacturer Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="manufacturerName">Manufacturer (optional)</Label>
                            <Input
                                id="manufacturerName"
                                value={manufacturerName}
                                onChange={(e) => setManufacturerName(e.target.value)}
                                placeholder="Shaw Flooring"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="productName">Product Name (optional)</Label>
                            <Input
                                id="productName"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="Endura LVP"
                            />
                        </div>
                    </div>

                    {/* Test Readings */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Test Readings</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addReading}>
                                <Plus className="w-4 h-4 mr-1" /> Add Location
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {readings.map((reading, index) => (
                                <div key={index} className="flex gap-3 items-end p-3 bg-muted/30 rounded-lg">
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-xs">Location</Label>
                                        <Input
                                            value={reading.location}
                                            onChange={(e) => updateReading(index, 'location', e.target.value)}
                                            placeholder="Main Lobby - Center"
                                        />
                                    </div>
                                    <div className="w-24 space-y-1">
                                        <Label className="text-xs">Reading (% RH)</Label>
                                        <Input
                                            type="number"
                                            value={reading.value || ''}
                                            onChange={(e) => updateReading(index, 'value', parseFloat(e.target.value) || 0)}
                                            placeholder="75"
                                        />
                                    </div>
                                    <div className="w-20 space-y-1">
                                        <Label className="text-xs">Depth (in)</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={reading.depth || ''}
                                            onChange={(e) => updateReading(index, 'depth', parseFloat(e.target.value) || 1.2)}
                                            placeholder="1.2"
                                        />
                                    </div>
                                    {readings.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive shrink-0"
                                            onClick={() => removeReading(index)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tester Info */}
                    <div className="space-y-2">
                        <Label htmlFor="testedBy">Tested By *</Label>
                        <Input
                            id="testedBy"
                            value={testedBy}
                            onChange={(e) => setTestedBy(e.target.value)}
                            placeholder="Mike Rodriguez"
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any observations or notes about the test..."
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleCreate}>Record Test</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
