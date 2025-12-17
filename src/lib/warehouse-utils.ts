// ══════════════════════════════════════════════════════════════════
// WAREHOUSE UTILITY FUNCTIONS
// Enterprise-grade inventory analysis and aggregation
// ══════════════════════════════════════════════════════════════════

import type { WarehouseLocation, EnhancedMaterialLot, InventoryTransaction } from './warehouse-types';
import type { InventoryItem } from './data';

// ─────────────────────────────────────────────────────────────────
// LOCATION INVENTORY SUMMARY
// Aggregates all lots at a location into item-level view
// ─────────────────────────────────────────────────────────────────

export interface LocationInventoryItem {
    itemId: number;
    itemName: string;
    sku: string;
    totalQuantity: number;
    unit: string;
    lotCount: number;
    dyeLots: string[];
    hasDyeLotVariance: boolean; // Multiple dye lots of same item (WARNING!)
    lots: EnhancedMaterialLot[];
    totalValue: number;
    oldestLotDate: string;
    newestLotDate: string;
}

export interface LocationInventorySummary {
    locationId: string;
    locationCode: string;
    locationName: string;
    uniqueItems: number;
    totalUnits: number;
    totalValue: number;
    items: LocationInventoryItem[];
    dyeLotWarnings: number; // Count of items with multiple dye lots
}

/**
 * Get comprehensive inventory summary for a location
 * Aggregates all lots by item, detects dye lot variances
 */
export function getLocationInventorySummary(
    locationId: string,
    location: WarehouseLocation | null,
    allLots: EnhancedMaterialLot[]
): LocationInventorySummary {
    if (!location) {
        return {
            locationId,
            locationCode: '',
            locationName: '',
            uniqueItems: 0,
            totalUnits: 0,
            totalValue: 0,
            items: [],
            dyeLotWarnings: 0
        };
    }

    // Get all lots at this location
    const lotsAtLocation = allLots.filter(lot =>
        lot.locations.some(loc => loc.locationId === locationId)
    );

    // Group by item ID
    const itemMap = new Map<number, LocationInventoryItem>();

    lotsAtLocation.forEach(lot => {
        const locQty = lot.locations.find(l => l.locationId === locationId);
        if (!locQty) return;

        const existing = itemMap.get(lot.itemId);
        if (existing) {
            // Add to existing item
            existing.totalQuantity += locQty.quantity;
            existing.lotCount++;
            if (lot.dyeLot && !existing.dyeLots.includes(lot.dyeLot)) {
                existing.dyeLots.push(lot.dyeLot);
            }
            existing.lots.push(lot);
            existing.totalValue += (lot.unitCost * locQty.quantity);

            // Update date range
            if (new Date(lot.receivedDate) < new Date(existing.oldestLotDate)) {
                existing.oldestLotDate = lot.receivedDate;
            }
            if (new Date(lot.receivedDate) > new Date(existing.newestLotDate)) {
                existing.newestLotDate = lot.receivedDate;
            }
        } else {
            // Create new item entry
            itemMap.set(lot.itemId, {
                itemId: lot.itemId,
                itemName: lot.itemName,
                sku: lot.sku,
                totalQuantity: locQty.quantity,
                unit: lot.unit,
                lotCount: 1,
                dyeLots: lot.dyeLot ? [lot.dyeLot] : [],
                hasDyeLotVariance: false,
                lots: [lot],
                totalValue: lot.unitCost * locQty.quantity,
                oldestLotDate: lot.receivedDate,
                newestLotDate: lot.receivedDate
            });
        }
    });

    // Detect dye lot variances
    const items = Array.from(itemMap.values()).map(item => ({
        ...item,
        hasDyeLotVariance: item.dyeLots.length > 1
    }));

    const dyeLotWarnings = items.filter(i => i.hasDyeLotVariance).length;

    return {
        locationId,
        locationCode: location.code,
        locationName: location.name,
        uniqueItems: items.length,
        totalUnits: items.reduce((sum, i) => sum + i.totalQuantity, 0),
        totalValue: items.reduce((sum, i) => sum + i.totalValue, 0),
        items: items.sort((a, b) => b.totalValue - a.totalValue), // Sort by value desc
        dyeLotWarnings
    };
}

// ─────────────────────────────────────────────────────────────────
// ITEM LOCATION DISTRIBUTION
// Show where an item exists across the warehouse
// ─────────────────────────────────────────────────────────────────

export interface ItemLocationInfo {
    locationId: string;
    locationCode: string;
    locationName: string;
    locationType: string;
    quantity: number;
    lotCount: number;
    dyeLots: string[];
    lots: EnhancedMaterialLot[];
}

/**
 * Get distribution of an item across all locations
 */
export function getItemLocationDistribution(
    itemId: number,
    allLots: EnhancedMaterialLot[],
    allLocations: WarehouseLocation[]
): ItemLocationInfo[] {
    // Get all lots for this item
    const itemLots = allLots.filter(lot => lot.itemId === itemId);

    // Build location map
    const locationMap = new Map<string, ItemLocationInfo>();

    itemLots.forEach(lot => {
        lot.locations.forEach(lotLoc => {
            const location = allLocations.find(l => l.id === lotLoc.locationId);
            if (!location) return;

            const existing = locationMap.get(lotLoc.locationId);
            if (existing) {
                existing.quantity += lotLoc.quantity;
                existing.lotCount++;
                if (lot.dyeLot && !existing.dyeLots.includes(lot.dyeLot)) {
                    existing.dyeLots.push(lot.dyeLot);
                }
                existing.lots.push(lot);
            } else {
                locationMap.set(lotLoc.locationId, {
                    locationId: lotLoc.locationId,
                    locationCode: lotLoc.locationCode,
                    locationName: location.name,
                    locationType: location.type,
                    quantity: lotLoc.quantity,
                    lotCount: 1,
                    dyeLots: lot.dyeLot ? [lot.dyeLot] : [],
                    lots: [lot]
                });
            }
        });
    });

    return Array.from(locationMap.values()).sort((a, b) => b.quantity - a.quantity);
}

// ─────────────────────────────────────────────────────────────────
// DYE LOT ANALYSIS
// Critical for flooring - prevent mixing dye lots on same job
// ─────────────────────────────────────────────────────────────────

export interface DyeLotVarianceWarning {
    itemId: number;
    itemName: string;
    sku: string;
    dyeLots: string[];
    lotCount: number;
    severity: 'info' | 'warning' | 'critical';
    message: string;
}

/**
 * Check for dye lot variances at a location
 * Returns warnings for items with multiple dye lots
 */
export function checkDyeLotVariances(
    locationId: string,
    allLots: EnhancedMaterialLot[]
): DyeLotVarianceWarning[] {
    const summary = getLocationInventorySummary(locationId, null, allLots);

    return summary.items
        .filter(item => item.hasDyeLotVariance)
        .map(item => ({
            itemId: item.itemId,
            itemName: item.itemName,
            sku: item.sku,
            dyeLots: item.dyeLots,
            lotCount: item.lotCount,
            severity: item.dyeLots.length > 2 ? 'critical' : 'warning' as const,
            message: `${item.lotCount} lots with ${item.dyeLots.length} different dye lots at this location. Verify compatibility before issuing to same project.`
        }));
}

// ─────────────────────────────────────────────────────────────────
// LOCATION VALUE CALCULATION
// Financial visibility into inventory distribution
// ─────────────────────────────────────────────────────────────────

/**
 * Calculate total inventory value at a location
 */
export function calculateLocationValue(
    locationId: string,
    allLots: EnhancedMaterialLot[]
): number {
    const lotsAtLocation = allLots.filter(lot =>
        lot.locations.some(loc => loc.locationId === locationId)
    );

    return lotsAtLocation.reduce((total, lot) => {
        const locQty = lot.locations.find(l => l.locationId === locationId);
        return total + (lot.unitCost * (locQty?.quantity || 0));
    }, 0);
}

// ─────────────────────────────────────────────────────────────────
// TRANSACTION ANALYSIS
// Activity metrics for locations
// ─────────────────────────────────────────────────────────────────

export interface LocationActivityMetrics {
    receives: number;
    transfers: number;
    issues: number;
    lastActivity?: string;
    topItems: { itemName: string; count: number }[];
}

/**
 * Analyze transaction activity for a location
 */
export function getLocationActivityMetrics(
    locationId: string,
    allTransactions: InventoryTransaction[],
    dayRange: number = 30
): LocationActivityMetrics {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - dayRange);

    const locationTxns = allTransactions.filter(txn => {
        const txnDate = new Date(txn.timestamp);
        return txnDate >= cutoffDate && (
            txn.locationId === locationId ||
            txn.toLocationId === locationId
        );
    });

    const receives = locationTxns.filter(t => t.type === 'receive' || t.type === 'transfer_in').length;
    const transfers = locationTxns.filter(t => t.type === 'transfer_out').length;
    const issues = locationTxns.filter(t => t.type === 'issue').length;

    // Get top items by transaction count
    const itemCounts = new Map<string, number>();
    locationTxns.forEach(txn => {
        itemCounts.set(txn.itemName, (itemCounts.get(txn.itemName) || 0) + 1);
    });

    const topItems = Array.from(itemCounts.entries())
        .map(([itemName, count]) => ({ itemName, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const lastActivity = locationTxns.length > 0
        ? locationTxns.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0].timestamp
        : undefined;

    return {
        receives,
        transfers,
        issues,
        lastActivity,
        topItems
    };
}
