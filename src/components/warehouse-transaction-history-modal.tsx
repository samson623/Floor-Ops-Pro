'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/components/data-provider';
import { cn } from '@/lib/utils';
import type { InventoryTransaction } from '@/lib/warehouse-types';
import {
    History,
    Package,
    ArrowUpDown,
    Truck,
    RefreshCcw,
    AlertTriangle,
    Search,
    Filter,
    Calendar,
    User,
    MapPin,
    FileText
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════════
// TRANSACTION HISTORY MODAL
// Comprehensive inventory transaction log with filters
// ══════════════════════════════════════════════════════════════════

interface TransactionHistoryModalProps {
    open: boolean;
    onClose: () => void;
    initialItemId?: number;
    initialLocationId?: string;
}

export function TransactionHistoryModal({
    open,
    onClose,
    initialItemId,
    initialLocationId
}: TransactionHistoryModalProps) {
    const { data } = useData();

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');

    // Get all transactions
    const allTransactions = useMemo(() => {
        return [...(data.inventoryTransactions || [])]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [data.inventoryTransactions]);

    // Apply filters
    const filteredTransactions = useMemo(() => {
        return allTransactions.filter(txn => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    txn.itemName.toLowerCase().includes(query) ||
                    txn.sku.toLowerCase().includes(query) ||
                    txn.locationCode.toLowerCase().includes(query) ||
                    (txn.projectName && txn.projectName.toLowerCase().includes(query)) ||
                    txn.performedBy.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }

            // Type filter
            if (typeFilter !== 'all' && txn.type !== typeFilter) return false;

            // Date filter
            if (dateFilter !== 'all') {
                const txnDate = new Date(txn.timestamp);
                const now = new Date();
                const daysDiff = Math.floor((now.getTime() - txnDate.getTime()) / (1000 * 60 * 60 * 24));

                if (dateFilter === 'today' && daysDiff > 0) return false;
                if (dateFilter === 'week' && daysDiff > 7) return false;
                if (dateFilter === 'month' && daysDiff > 30) return false;
            }

            // Initial filters
            if (initialItemId && txn.itemId !== initialItemId) return false;
            if (initialLocationId && txn.locationId !== initialLocationId && txn.toLocationId !== initialLocationId) return false;

            return true;
        });
    }, [allTransactions, searchQuery, typeFilter, dateFilter, initialItemId, initialLocationId]);

    // Transaction type styling
    const getTransactionStyle = (type: string) => {
        switch (type) {
            case 'receive':
                return { color: 'text-green-600', bg: 'bg-green-500/10', icon: Package };
            case 'transfer_out':
            case 'transfer_in':
                return { color: 'text-blue-600', bg: 'bg-blue-500/10', icon: ArrowUpDown };
            case 'issue':
                return { color: 'text-purple-600', bg: 'bg-purple-500/10', icon: Truck };
            case 'adjust_up':
            case 'adjust_down':
                return { color: 'text-yellow-600', bg: 'bg-yellow-500/10', icon: RefreshCcw };
            case 'damage':
            case 'scrap':
                return { color: 'text-red-600', bg: 'bg-red-500/10', icon: AlertTriangle };
            case 'return':
                return { color: 'text-cyan-600', bg: 'bg-cyan-500/10', icon: ArrowUpDown };
            default:
                return { color: 'text-gray-600', bg: 'bg-gray-500/10', icon: History };
        }
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const transactionTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'receive', label: 'Receive' },
        { value: 'transfer_out', label: 'Transfer Out' },
        { value: 'transfer_in', label: 'Transfer In' },
        { value: 'issue', label: 'Issue' },
        { value: 'return', label: 'Return' },
        { value: 'adjust_up', label: 'Adjust Up' },
        { value: 'adjust_down', label: 'Adjust Down' },
        { value: 'damage', label: 'Damage' },
        { value: 'scrap', label: 'Scrap' }
    ];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10">
                            <History className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Inventory Transaction History</DialogTitle>
                            <DialogDescription>
                                Complete audit trail of all inventory movements
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Filters */}
                <div className="shrink-0 flex flex-wrap items-center gap-3 py-4 border-b">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by item, SKU, location, project..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[150px]">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {transactionTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="w-[130px]">
                            <Calendar className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">Last 7 Days</SelectItem>
                            <SelectItem value="month">Last 30 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Results Count */}
                <div className="shrink-0 text-sm text-muted-foreground py-2">
                    Showing {filteredTransactions.length} of {allTransactions.length} transactions
                </div>

                {/* Transaction List */}
                <div className="flex-1 overflow-y-auto -mx-6 px-6">
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No transactions found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredTransactions.map((txn) => {
                                const style = getTransactionStyle(txn.type);
                                const IconComponent = style.icon;
                                return (
                                    <div key={txn.id} className="p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className={cn("p-2 rounded-lg shrink-0", style.bg)}>
                                                <IconComponent className={cn("w-4 h-4", style.color)} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium">{txn.itemName}</span>
                                                    <Badge variant="outline" className={cn("text-xs", style.bg, style.color)}>
                                                        {txn.type.replace('_', ' ')}
                                                    </Badge>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {txn.quantity > 0 ? '+' : ''}{txn.quantity} {txn.unit}
                                                    </Badge>
                                                </div>
                                                <div className="mt-1 text-sm text-muted-foreground">
                                                    <code className="text-xs bg-muted px-1 rounded">{txn.sku}</code>
                                                </div>
                                                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {txn.locationCode}
                                                        {txn.toLocationCode && (
                                                            <> → {txn.toLocationCode}</>
                                                        )}
                                                    </span>
                                                    {txn.projectName && (
                                                        <span className="flex items-center gap-1">
                                                            <FileText className="w-3 h-3" />
                                                            {txn.projectName}
                                                        </span>
                                                    )}
                                                    {txn.lotNumber && (
                                                        <span>Lot: {txn.lotNumber}</span>
                                                    )}
                                                    {txn.dyeLot && (
                                                        <span>Dye: {txn.dyeLot}</span>
                                                    )}
                                                </div>
                                                {txn.reason && (
                                                    <div className="mt-2 text-sm text-muted-foreground italic">
                                                        Reason: {txn.reason}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-sm text-muted-foreground">
                                                    {formatDate(txn.timestamp)}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                    <User className="w-3 h-3" />
                                                    {txn.performedBy}
                                                </div>
                                                {txn.referenceId && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        Ref: {txn.referenceId}
                                                    </div>
                                                )}
                                                <div className="mt-2 text-xs">
                                                    Balance: <span className="font-medium">{txn.balanceAfter}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {txn.notes && (
                                            <div className="mt-2 text-sm text-muted-foreground border-t pt-2">
                                                {txn.notes}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 flex items-center justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
