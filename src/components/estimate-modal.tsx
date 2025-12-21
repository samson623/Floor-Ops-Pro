'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/components/data-provider';
import { Estimate, EstimateRoom, EstimateMaterial, EstimateLabor, EstimateTotals } from '@/lib/data';
import { toast } from 'sonner';
import { Plus, Trash2, Calculator } from 'lucide-react';

interface CreateEstimateModalProps {
    open: boolean;
    onClose: () => void;
    onCreated?: (estimateId: number) => void;
}

const MATERIAL_OPTIONS = [
    { value: 'LVP', label: 'Luxury Vinyl Plank', pricePerSqft: 4.50 },
    { value: 'Hardwood', label: 'Hardwood', pricePerSqft: 8.00 },
    { value: 'Laminate', label: 'Laminate', pricePerSqft: 3.00 },
    { value: 'Carpet', label: 'Carpet', pricePerSqft: 2.50 },
    { value: 'Tile', label: 'Tile', pricePerSqft: 6.00 },
    { value: 'Engineered', label: 'Engineered Hardwood', pricePerSqft: 7.00 },
];

const LABOR_RATE_PER_SQFT = 2.50; // Default labor rate

export function CreateEstimateModal({ open, onClose, onCreated }: CreateEstimateModalProps) {
    const { addEstimate } = useData();

    // Client Info
    const [client, setClient] = useState('');
    const [address, setAddress] = useState('');
    const [contact, setContact] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    // Rooms
    const [rooms, setRooms] = useState<Array<{
        name: string;
        width: number;
        length: number;
        material: string;
        wastePercent: number;
    }>>([
        { name: 'Living Room', width: 15, length: 20, material: 'LVP', wastePercent: 10 }
    ]);

    // Settings
    const [depositPercent, setDepositPercent] = useState(50);
    const [marginPercent, setMarginPercent] = useState(25);
    const [notes, setNotes] = useState('');

    const addRoom = () => {
        setRooms([...rooms, { name: '', width: 0, length: 0, material: 'LVP', wastePercent: 10 }]);
    };

    const updateRoom = (index: number, field: string, value: string | number) => {
        const newRooms = [...rooms];
        (newRooms[index] as Record<string, string | number>)[field] = value;
        setRooms(newRooms);
    };

    const removeRoom = (index: number) => {
        if (rooms.length > 1) {
            setRooms(rooms.filter((_, i) => i !== index));
        }
    };

    // Calculate totals
    const calculateTotals = () => {
        let materialsCost = 0;
        let laborCost = 0;
        let totalSqft = 0;

        rooms.forEach(room => {
            const sqft = room.width * room.length;
            totalSqft += sqft;
            const sqftWithWaste = sqft * (1 + room.wastePercent / 100);

            const material = MATERIAL_OPTIONS.find(m => m.value === room.material);
            const pricePerSqft = material?.pricePerSqft || 4.50;

            materialsCost += sqftWithWaste * pricePerSqft;
            laborCost += sqft * LABOR_RATE_PER_SQFT;
        });

        const subtotal = materialsCost + laborCost;
        const total = subtotal * (1 + marginPercent / 100);

        return {
            totalSqft: Math.round(totalSqft),
            materialsCost: Math.round(materialsCost),
            laborCost: Math.round(laborCost),
            subtotal: Math.round(subtotal),
            total: Math.round(total)
        };
    };

    const totals = calculateTotals();

    const handleSubmit = () => {
        // Validation
        if (!client.trim()) {
            toast.error('Please enter a client name');
            return;
        }
        if (!address.trim()) {
            toast.error('Please enter an address');
            return;
        }
        if (!contact.trim()) {
            toast.error('Please enter a contact name');
            return;
        }
        if (!email.trim()) {
            toast.error('Please enter an email');
            return;
        }
        if (rooms.some(r => !r.name.trim() || r.width <= 0 || r.length <= 0)) {
            toast.error('Please fill in all room details');
            return;
        }

        // Build estimate data
        const estimateRooms: EstimateRoom[] = rooms.map((r, i) => ({
            id: i + 1,
            name: r.name,
            width: r.width,
            length: r.length,
            sqft: r.width * r.length,
            material: r.material,
            wastePercent: r.wastePercent
        }));

        // Build materials list (aggregated by type)
        const materialsByType: Record<string, { sqft: number; pricePerSqft: number }> = {};
        rooms.forEach(room => {
            const sqftWithWaste = room.width * room.length * (1 + room.wastePercent / 100);
            if (!materialsByType[room.material]) {
                const material = MATERIAL_OPTIONS.find(m => m.value === room.material);
                materialsByType[room.material] = { sqft: 0, pricePerSqft: material?.pricePerSqft || 4.50 };
            }
            materialsByType[room.material].sqft += sqftWithWaste;
        });

        const materials: EstimateMaterial[] = Object.entries(materialsByType).map(([name, data]) => ({
            name,
            sqft: Math.round(data.sqft),
            pricePerSqft: data.pricePerSqft,
            total: Math.round(data.sqft * data.pricePerSqft)
        }));

        // Build labor list
        const labor: EstimateLabor[] = [
            {
                type: 'Installation',
                sqft: totals.totalSqft,
                ratePerSqft: LABOR_RATE_PER_SQFT,
                total: totals.laborCost
            }
        ];

        const estimateTotals: EstimateTotals = {
            materialsCost: totals.materialsCost,
            laborCost: totals.laborCost,
            subtotal: totals.subtotal,
            margin: marginPercent,
            total: totals.total
        };

        const estimate: Omit<Estimate, 'id'> = {
            client,
            address,
            contact,
            phone,
            email,
            status: 'draft',
            createdDate: new Date().toISOString().split('T')[0],
            rooms: estimateRooms,
            materials,
            labor,
            totals: estimateTotals,
            depositPercent,
            notes
        };

        const newId = addEstimate(estimate);
        toast.success('Estimate created successfully!');

        // Reset form
        setClient('');
        setAddress('');
        setContact('');
        setPhone('');
        setEmail('');
        setRooms([{ name: 'Living Room', width: 15, length: 20, material: 'LVP', wastePercent: 10 }]);
        setDepositPercent(50);
        setMarginPercent(25);
        setNotes('');

        onClose();
        if (onCreated) {
            onCreated(newId);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        Create New Estimate
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Client Information */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Client Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="client">Client Name *</Label>
                                <Input
                                    id="client"
                                    value={client}
                                    onChange={(e) => setClient(e.target.value)}
                                    placeholder="Enter client or company name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact">Contact Person *</Label>
                                <Input
                                    id="contact"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    placeholder="Primary contact name"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">Address *</Label>
                                <Input
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Project address"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(555) 123-4567"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="client@example.com"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Room Measurements */}
                    <Card>
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Room Measurements</CardTitle>
                            <Button variant="outline" size="sm" onClick={addRoom}>
                                <Plus className="w-4 h-4 mr-1" />
                                Add Room
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {rooms.map((room, index) => (
                                <div key={index} className="flex flex-wrap gap-3 items-end p-3 bg-muted/50 rounded-lg">
                                    <div className="flex-1 min-w-[150px] space-y-1">
                                        <Label className="text-xs">Room Name</Label>
                                        <Input
                                            value={room.name}
                                            onChange={(e) => updateRoom(index, 'name', e.target.value)}
                                            placeholder="Room name"
                                        />
                                    </div>
                                    <div className="w-20 space-y-1">
                                        <Label className="text-xs">Width (ft)</Label>
                                        <Input
                                            type="number"
                                            value={room.width || ''}
                                            onChange={(e) => updateRoom(index, 'width', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="w-20 space-y-1">
                                        <Label className="text-xs">Length (ft)</Label>
                                        <Input
                                            type="number"
                                            value={room.length || ''}
                                            onChange={(e) => updateRoom(index, 'length', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="w-36 space-y-1">
                                        <Label className="text-xs">Material</Label>
                                        <Select value={room.material} onValueChange={(v) => updateRoom(index, 'material', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {MATERIAL_OPTIONS.map(m => (
                                                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-20 space-y-1">
                                        <Label className="text-xs">Waste %</Label>
                                        <Input
                                            type="number"
                                            value={room.wastePercent}
                                            onChange={(e) => updateRoom(index, 'wastePercent', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="text-sm font-medium text-muted-foreground w-20">
                                        {room.width * room.length} sqft
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => removeRoom(index)}
                                        disabled={rooms.length <= 1}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Pricing Settings */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Pricing</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="margin">Margin %</Label>
                                <Input
                                    id="margin"
                                    type="number"
                                    value={marginPercent}
                                    onChange={(e) => setMarginPercent(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deposit">Deposit %</Label>
                                <Input
                                    id="deposit"
                                    type="number"
                                    value={depositPercent}
                                    onChange={(e) => setDepositPercent(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Additional notes..."
                                    rows={2}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary */}
                    <Card className="bg-gradient-to-br from-primary/5 to-transparent">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Estimate Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                                <div className="p-3 rounded-lg bg-background/50">
                                    <div className="text-2xl font-bold">{totals.totalSqft.toLocaleString()}</div>
                                    <div className="text-xs text-muted-foreground">Total Sq Ft</div>
                                </div>
                                <div className="p-3 rounded-lg bg-background/50">
                                    <div className="text-2xl font-bold text-success">${totals.materialsCost.toLocaleString()}</div>
                                    <div className="text-xs text-muted-foreground">Materials</div>
                                </div>
                                <div className="p-3 rounded-lg bg-background/50">
                                    <div className="text-2xl font-bold text-primary">${totals.laborCost.toLocaleString()}</div>
                                    <div className="text-xs text-muted-foreground">Labor</div>
                                </div>
                                <div className="p-3 rounded-lg bg-background/50">
                                    <div className="text-2xl font-bold">{marginPercent}%</div>
                                    <div className="text-xs text-muted-foreground">Margin</div>
                                </div>
                                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                                    <div className="text-2xl font-bold text-success">${totals.total.toLocaleString()}</div>
                                    <div className="text-xs text-muted-foreground">Total</div>
                                </div>
                            </div>
                            <div className="mt-4 text-sm text-muted-foreground">
                                Deposit required: <span className="font-semibold">${Math.round(totals.total * depositPercent / 100).toLocaleString()}</span> ({depositPercent}%)
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>
                        Create Estimate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
