'use client';

import { useState } from 'react';
import { TopBar } from '@/components/top-bar';
import { useData } from '@/components/data-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Plus, Package, AlertTriangle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AddInventoryModal } from '@/components/project-modals';
import { PurchaseOrderModal } from '@/components/purchase-order-modal';
import { InventoryItem } from '@/lib/data';

export default function InventoryPage() {
    const { data, addInventoryItem, isLoaded } = useData();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPOModal, setShowPOModal] = useState(false);
    const [selectedItemForOrder, setSelectedItemForOrder] = useState<InventoryItem | null>(null);

    // Ensure inventory data exists with safe defaults
    const inventory = data?.inventory || [];
    const totalStock = inventory.reduce((s, i) => s + (i?.stock || 0), 0);
    const totalReserved = inventory.reduce((s, i) => s + (i?.reserved || 0), 0);
    const lowStockItems = inventory.filter(i => (i?.stock || 0) - (i?.reserved || 0) < 5);

    // Loading state
    if (!isLoaded) {
        return (
            <>
                <TopBar
                    title="Inventory"
                    breadcrumb="Global Stock"
                    showNewProject={false}
                />
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground">Loading inventory...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <TopBar
                title="Inventory"
                breadcrumb="Global Stock"
                showNewProject={false}
            >
                <Button onClick={() => setShowAddModal(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                </Button>
            </TopBar>

            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-primary/10">
                                    <Package className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{inventory.length}</div>
                                    <div className="text-sm text-muted-foreground">Items</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{totalStock}</div>
                            <div className="text-sm text-muted-foreground">Total Units</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-warning">{totalReserved}</div>
                            <div className="text-sm text-muted-foreground">Reserved</div>
                        </CardContent>
                    </Card>
                    <Card className={lowStockItems.length > 0 ? 'border-warning/50 bg-warning/5' : ''}>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                {lowStockItems.length > 0 && (
                                    <AlertTriangle className="w-5 h-5 text-warning" />
                                )}
                                <div>
                                    <div className="text-2xl font-bold">{lowStockItems.length}</div>
                                    <div className="text-sm text-muted-foreground">Low Stock</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search inventory..." className="pl-9" />
                </div>

                {/* Inventory Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Inventory Items</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left p-4 font-semibold">Item</th>
                                        <th className="text-left p-4 font-semibold">SKU</th>
                                        <th className="text-left p-4 font-semibold">Stock</th>
                                        <th className="text-left p-4 font-semibold">Reserved</th>
                                        <th className="text-left p-4 font-semibold">Available</th>
                                        <th className="text-left p-4 font-semibold">Status</th>
                                        <th className="text-left p-4 font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.map(item => {
                                        const available = (item?.stock || 0) - (item?.reserved || 0);
                                        const isLow = available < 5;
                                        const percentage = item?.stock ? (available / item.stock) * 100 : 0;

                                        return (
                                            <tr key={item?.id || Math.random()} className="border-b last:border-0 hover:bg-muted/30">
                                                <td className="p-4">
                                                    <div className="font-medium">{item?.name || 'Unknown'}</div>
                                                </td>
                                                <td className="p-4 text-muted-foreground font-mono text-sm">{item?.sku || '-'}</td>
                                                <td className="p-4">{item?.stock || 0}</td>
                                                <td className="p-4 text-warning">{item?.reserved || 0}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className={cn('font-semibold', isLow && 'text-warning')}>
                                                            {available}
                                                        </span>
                                                        <Progress
                                                            value={percentage}
                                                            className={cn('w-20 h-2', isLow && '[&>div]:bg-warning')}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge className={cn(
                                                        isLow ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                                                    )}>
                                                        {isLow ? 'Low Stock' : 'In Stock'}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <Button size="sm" variant="secondary" onClick={() => {
                                                        setSelectedItemForOrder(item);
                                                        setShowPOModal(true);
                                                    }}>
                                                        Order
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Inventory Modal */}
            <AddInventoryModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                onCreate={(item) => {
                    addInventoryItem(item);
                }}
            />

            {/* Purchase Order Modal */}
            <PurchaseOrderModal
                open={showPOModal}
                onOpenChange={(open) => {
                    setShowPOModal(open);
                    if (!open) setSelectedItemForOrder(null);
                }}
                initialItem={selectedItemForOrder}
            />
        </>
    );
}
