// ══════════════════════════════════════════════════════════════════
// WAREHOUSE MANAGEMENT SYSTEM TYPES
// Enterprise-grade inventory control, tracking, and automation
// ══════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// LOCATION HIERARCHY
// Warehouse → Zone → Aisle → Bay → Shelf → Bin
// ─────────────────────────────────────────────────────────────────

export type LocationType =
    | 'warehouse'      // Main warehouse building
    | 'zone'           // Section of warehouse (A, B, C, etc.)
    | 'aisle'          // Row within zone
    | 'bay'            // Column within aisle
    | 'shelf'          // Vertical position
    | 'bin'            // Individual storage location
    | 'truck'          // Delivery truck
    | 'jobsite'        // Project location
    | 'staging'        // Pre-staging area for jobs
    | 'damage_hold'    // Damaged goods quarantine
    | 'returns'        // Returns processing area
    | 'quarantine';    // Quality hold area

export interface WarehouseLocation {
    id: string;
    code: string;           // Short code (e.g., "A-01-03-B")
    name: string;           // Display name (e.g., "Zone A, Aisle 1, Bay 3, Shelf B")
    type: LocationType;
    parentId?: string;      // Parent location ID

    // Physical attributes
    capacity?: number;      // Max units or sqft
    currentUtilization?: number; // Current % full

    // Flags
    isActive: boolean;
    isPickable: boolean;    // Can pick from this location
    isReceivable: boolean;  // Can receive into this location

    // For trucks
    vehicleId?: string;
    licensePlate?: string;
    driverName?: string;

    // For jobsites
    projectId?: number;
    projectName?: string;
    address?: string;

    // Metadata
    createdAt: string;
    updatedAt?: string;
    notes?: string;
}

// ─────────────────────────────────────────────────────────────────
// INVENTORY TRANSACTIONS
// Complete audit trail for all stock movements
// ─────────────────────────────────────────────────────────────────

export type TransactionType =
    | 'receive'        // Incoming from vendor
    | 'transfer_out'   // Moving out of location
    | 'transfer_in'    // Moving into location
    | 'allocate'       // Reserve for job
    | 'deallocate'     // Release reservation
    | 'issue'          // Issue to job (consume)
    | 'return'         // Return from job
    | 'adjust_up'      // Positive adjustment
    | 'adjust_down'    // Negative adjustment
    | 'damage'         // Mark as damaged
    | 'scrap'          // Write off
    | 'cycle_count';   // Physical count adjustment

export interface InventoryTransaction {
    id: string;
    timestamp: string;
    type: TransactionType;

    // What
    itemId: number;
    itemName: string;
    sku: string;
    quantity: number;
    unit: string;

    // Where
    locationId: string;
    locationCode: string;

    // Lot tracking
    lotNumber?: string;
    dyeLot?: string;

    // Reference
    referenceType?: 'po' | 'transfer' | 'job' | 'daily_log' | 'cycle_count' | 'manual';
    referenceId?: string;

    // For transfers
    toLocationId?: string;
    toLocationCode?: string;

    // For job-related transactions
    projectId?: number;
    projectName?: string;

    // Financial
    unitCost?: number;
    totalCost?: number;

    // Audit
    performedBy: string;
    performedByUserId: number;
    reason?: string;
    notes?: string;

    // Running totals after transaction
    balanceAfter: number;
}

// ─────────────────────────────────────────────────────────────────
// STOCK RESERVATIONS
// Lock stock for specific jobs before issuing
// ─────────────────────────────────────────────────────────────────

export type ReservationStatus = 'active' | 'partial_issued' | 'fully_issued' | 'cancelled' | 'expired';

export interface StockReservation {
    id: string;

    // What's reserved
    itemId: number;
    itemName: string;
    sku: string;
    quantity: number;
    unit: string;

    // Lot preference
    preferredLotNumber?: string;
    preferredDyeLot?: string;

    // Where reserved from
    locationId: string;
    locationCode: string;

    // For which job
    projectId: number;
    projectName: string;
    jobStartDate: string;

    // Status
    status: ReservationStatus;
    quantityIssued: number;

    // Timeline
    reservedAt: string;
    reservedBy: string;
    reservedByUserId: number;
    expiresAt?: string;

    // Updates
    issuedAt?: string;
    cancelledAt?: string;
    cancelReason?: string;
}

// ─────────────────────────────────────────────────────────────────
// STOCK TRANSFERS
// Move materials between locations
// ─────────────────────────────────────────────────────────────────

export type TransferStatus =
    | 'draft'          // Being prepared
    | 'pending'        // Awaiting approval
    | 'approved'       // Ready to pick
    | 'picking'        // Being picked
    | 'in_transit'     // On the way
    | 'delivered'      // Arrived at destination
    | 'received'       // Confirmed receipt
    | 'cancelled';     // Cancelled

export interface TransferLineItem {
    id: string;
    itemId: number;
    itemName: string;
    sku: string;
    quantity: number;
    unit: string;
    lotNumber?: string;
    dyeLot?: string;

    // Picking
    pickedQuantity?: number;
    pickedAt?: string;
    pickedBy?: string;

    // Receiving
    receivedQuantity?: number;
    receivedAt?: string;
    receivedBy?: string;

    // Discrepancies
    damagedQuantity?: number;
    shortageQuantity?: number;
    notes?: string;
}

export interface StockTransfer {
    id: string;
    transferNumber: string;

    // Route
    fromLocationId: string;
    fromLocationCode: string;
    fromLocationType: LocationType;
    toLocationId: string;
    toLocationCode: string;
    toLocationType: LocationType;

    // For job-related transfers
    projectId?: number;
    projectName?: string;

    // Items
    lineItems: TransferLineItem[];
    totalItems: number;
    totalQuantity: number;

    // Status
    status: TransferStatus;

    // Timeline
    createdAt: string;
    createdBy: string;
    createdByUserId: number;

    scheduledDate?: string;
    approvedAt?: string;
    approvedBy?: string;

    pickedAt?: string;
    pickedBy?: string;

    shippedAt?: string;
    estimatedArrival?: string;

    deliveredAt?: string;
    receivedAt?: string;
    receivedBy?: string;

    // Documentation
    photos: string[];
    signature?: string;
    signedBy?: string;
    signedAt?: string;

    notes?: string;
    issues?: string;
}

// ─────────────────────────────────────────────────────────────────
// ENHANCED LOT TRACKING
// Complete lineage from delivery to consumption
// ─────────────────────────────────────────────────────────────────

export type LotStatus =
    | 'active'         // Available for use
    | 'allocated'      // Reserved for job
    | 'partial'        // Partially consumed
    | 'consumed'       // Fully used
    | 'quarantine'     // Quality hold
    | 'expired'        // Past expiration
    | 'damaged';       // Damaged, not usable

export interface LotLocation {
    locationId: string;
    locationCode: string;
    quantity: number;
}

export interface LotAllocation {
    projectId: number;
    projectName: string;
    quantity: number;
    allocatedAt: string;
    allocatedBy: string;
}

export interface EnhancedMaterialLot {
    id: string;

    // Material
    itemId: number;
    itemName: string;
    sku: string;

    // Lot identification
    lotNumber: string;
    dyeLot?: string;
    manufacturerLot?: string;

    // Quantities
    originalQuantity: number;
    currentQuantity: number;
    unit: string;

    // Locations
    locations: LotLocation[];

    // Allocations
    allocations: LotAllocation[];

    // Source
    vendorId: number;
    vendorName: string;
    deliveryId?: string;
    poNumber?: string;

    // Dates
    receivedDate: string;
    manufactureDate?: string;
    expirationDate?: string;

    // Quality
    qcStatus: 'pending' | 'passed' | 'failed';
    qcTestedAt?: string;
    qcTestedBy?: string;
    qcNotes?: string;

    // Status
    status: LotStatus;

    // Cost
    unitCost: number;
    totalCost: number;

    // Metadata
    notes?: string;
    createdAt: string;
    updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────────
// CYCLE COUNTING
// Physical inventory verification
// ─────────────────────────────────────────────────────────────────

export type CycleCountStatus = 'scheduled' | 'in_progress' | 'completed' | 'approved';

export interface CycleCountItem {
    itemId: number;
    itemName: string;
    sku: string;
    lotNumber?: string;

    // Counts
    systemQuantity: number;
    countedQuantity: number;
    variance: number;
    variancePercent: number;

    // Resolution
    adjustmentMade: boolean;
    adjustmentTransactionId?: string;
    notes?: string;
}

export interface CycleCount {
    id: string;

    // Location
    locationId: string;
    locationCode: string;

    // Count
    items: CycleCountItem[];
    totalItems: number;
    itemsWithVariance: number;

    // Status
    status: CycleCountStatus;
    accuracy: number; // Percentage

    // Timeline
    scheduledDate: string;
    startedAt?: string;
    completedAt?: string;
    approvedAt?: string;

    // Personnel
    countedBy?: string;
    countedByUserId?: number;
    approvedBy?: string;
    approvedByUserId?: number;

    notes?: string;
}

// ─────────────────────────────────────────────────────────────────
// STOCK LEVELS
// Real-time availability across all locations
// ─────────────────────────────────────────────────────────────────

export interface StockLevel {
    locationId: string;
    locationCode: string;
    locationType: LocationType;
    quantity: number;
    reserved: number;
    available: number;
    lastUpdated: string;
}

export interface ItemStockSummary {
    itemId: number;
    itemName: string;
    sku: string;

    // Totals across all locations
    totalOnHand: number;
    totalReserved: number;
    totalAvailable: number;

    // By location type
    warehouseStock: number;
    truckStock: number;
    jobsiteStock: number;
    stagingStock: number;

    // Breakdown
    stockLevels: StockLevel[];

    // Lot info
    lotCount: number;
    dyeLotCount: number;

    // Reorder
    reorderPoint: number;
    safetyStock: number;
    needsReorder: boolean;
    suggestedOrderQty: number;

    lastUpdated: string;
}

// ─────────────────────────────────────────────────────────────────
// REORDER MANAGEMENT
// Automated restocking triggers
// ─────────────────────────────────────────────────────────────────

export interface ReorderSuggestion {
    itemId: number;
    itemName: string;
    sku: string;

    // Current state
    currentStock: number;
    reorderPoint: number;
    safetyStock: number;

    // Suggestion
    suggestedQuantity: number;
    preferredVendorId: number;
    preferredVendorName: string;
    estimatedCost: number;
    leadTimeDays: number;

    // Urgency
    priority: 'low' | 'medium' | 'high' | 'critical';
    daysUntilStockout: number;

    // Jobs at risk
    jobsAffected: { projectId: number; projectName: string; needsBy: string }[];

    reason: string;
    createdAt: string;
}

// ─────────────────────────────────────────────────────────────────
// JOB MATERIAL REQUIREMENTS
// What materials each job needs
// ─────────────────────────────────────────────────────────────────

export type MaterialReadiness = 'ready' | 'partial' | 'missing' | 'on_order';

export interface JobMaterialRequirement {
    projectId: number;
    projectName: string;
    jobStartDate: string;

    itemId: number;
    itemName: string;
    sku: string;

    // Quantities
    requiredQuantity: number;
    allocatedQuantity: number;
    issuedQuantity: number;
    remainingQuantity: number;

    // Lot preference
    preferredDyeLot?: string;
    assignedLots: string[];

    // Status
    readiness: MaterialReadiness;

    // Availability
    availableInWarehouse: number;
    availableInTruck: number;
    onOrder: number;
    expectedDeliveryDate?: string;

    // Flags
    isShortage: boolean;
    shortageQuantity: number;

    notes?: string;
}

export interface JobMaterialSummary {
    projectId: number;
    projectName: string;
    jobStartDate: string;

    // Overall status
    isReady: boolean;
    readinessPercent: number;

    // Counts
    totalMaterials: number;
    readyCount: number;
    partialCount: number;
    missingCount: number;

    // Items
    requirements: JobMaterialRequirement[];

    // Risks
    risks: string[];
    lotMismatchWarnings: string[];
}

// ─────────────────────────────────────────────────────────────────
// AI / PREDICTIVE TYPES
// Forecasting and anomaly detection
// ─────────────────────────────────────────────────────────────────

export interface DemandForecast {
    itemId: number;
    itemName: string;

    // Forecast
    forecastPeriodDays: number;
    estimatedDemand: number;
    confidenceLevel: number;

    // Based on
    basedOnJobCount: number;
    jobIds: number[];

    // Recommendation
    recommendedStock: number;
    currentStock: number;
    shortfall: number;

    generatedAt: string;
}

export interface ConsumptionAnomaly {
    id: string;
    projectId: number;
    projectName: string;
    itemId: number;
    itemName: string;

    // What was expected vs actual
    estimatedUsage: number;
    actualUsage: number;
    variance: number;
    variancePercent: number;

    // Assessment
    severity: 'low' | 'medium' | 'high';
    anomalyType: 'over_consumption' | 'under_consumption' | 'unusual_pattern';

    // Recommendation
    recommendation: string;
    requiresReview: boolean;

    detectedAt: string;
}

export interface MaterialRiskScore {
    projectId: number;
    projectName: string;

    // Overall score (0-100, higher = more risk)
    score: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';

    // Risk factors
    factors: {
        factor: string;
        impact: number;
        description: string;
    }[];

    // Recommendations
    recommendations: string[];

    // Timeline
    jobStartDate: string;
    daysUntilStart: number;

    generatedAt: string;
}

// ─────────────────────────────────────────────────────────────────
// WAREHOUSE METRICS
// KPIs and performance tracking
// ─────────────────────────────────────────────────────────────────

export interface WarehouseMetrics {
    // Inventory
    totalSKUs: number;
    totalUnits: number;
    totalValue: number;

    // Stock health
    lowStockCount: number;
    outOfStockCount: number;
    overstockCount: number;

    // Turnover
    avgInventoryTurnover: number;
    avgDaysOnHand: number;

    // Accuracy
    inventoryAccuracy: number;
    cycleCountAccuracy: number;

    // Activity
    receivesThisWeek: number;
    transfersThisWeek: number;
    issuesThisWeek: number;

    // Jobs
    jobsScheduledThisWeek: number;
    jobsReadyForMaterials: number;
    jobsWithShortages: number;

    // Alerts
    pendingReorderCount: number;
    lotMismatchWarnings: number;
    expiringLotsCount: number;

    asOf: string;
}
