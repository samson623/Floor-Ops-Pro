// ══════════════════════════════════════════════════════════════════
// WAREHOUSE MANAGEMENT SYSTEM - MOCK DATA
// Comprehensive realistic data for immediate demonstration
// ══════════════════════════════════════════════════════════════════

import type {
    WarehouseLocation,
    InventoryTransaction,
    StockReservation,
    StockTransfer,
    EnhancedMaterialLot,
    CycleCount,
    ReorderSuggestion,
    WarehouseMetrics
} from './warehouse-types';

// ─────────────────────────────────────────────────────────────────
// WAREHOUSE LOCATIONS
// Complete hierarchy: Main → Zones → Aisles → Bays → Shelves
// Plus trucks and active jobsites
// ─────────────────────────────────────────────────────────────────

export const MOCK_WAREHOUSE_LOCATIONS: WarehouseLocation[] = [
    // Main Warehouse
    {
        id: 'wh-main',
        code: 'MAIN',
        name: 'Main Warehouse',
        type: 'warehouse',
        capacity: 50000,
        currentUtilization: 68,
        isActive: true,
        isPickable: false,
        isReceivable: true,
        createdAt: '2024-01-01T00:00:00Z',
        notes: 'Primary storage facility - 15,000 sqft'
    },

    // Zone A - Flooring Materials
    {
        id: 'zone-a',
        code: 'A',
        name: 'Zone A - Flooring Materials',
        type: 'zone',
        parentId: 'wh-main',
        capacity: 15000,
        currentUtilization: 72,
        isActive: true,
        isPickable: false,
        isReceivable: true,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'a-01',
        code: 'A-01',
        name: 'Aisle 1 (LVP)',
        type: 'aisle',
        parentId: 'zone-a',
        isActive: true,
        isPickable: true,
        isReceivable: true,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'a-01-01',
        code: 'A-01-01',
        name: 'Bay 1',
        type: 'bay',
        parentId: 'a-01',
        capacity: 500,
        currentUtilization: 85,
        isActive: true,
        isPickable: true,
        isReceivable: true,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'a-01-02',
        code: 'A-01-02',
        name: 'Bay 2',
        type: 'bay',
        parentId: 'a-01',
        capacity: 500,
        currentUtilization: 60,
        isActive: true,
        isPickable: true,
        isReceivable: true,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'a-02',
        code: 'A-02',
        name: 'Aisle 2 (Hardwood)',
        type: 'aisle',
        parentId: 'zone-a',
        isActive: true,
        isPickable: true,
        isReceivable: true,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'a-02-01',
        code: 'A-02-01',
        name: 'Bay 1',
        type: 'bay',
        parentId: 'a-02',
        capacity: 400,
        currentUtilization: 90,
        isActive: true,
        isPickable: true,
        isReceivable: true,
        createdAt: '2024-01-01T00:00:00Z'
    },

    // Zone B - Accessories & Supplies
    {
        id: 'zone-b',
        code: 'B',
        name: 'Zone B - Accessories & Supplies',
        type: 'zone',
        parentId: 'wh-main',
        capacity: 8000,
        currentUtilization: 55,
        isActive: true,
        isPickable: false,
        isReceivable: true,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'b-01',
        code: 'B-01',
        name: 'Aisle 1 (Underlayment)',
        type: 'aisle',
        parentId: 'zone-b',
        isActive: true,
        isPickable: true,
        isReceivable: true,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'b-02',
        code: 'B-02',
        name: 'Aisle 2 (Adhesives)',
        type: 'aisle',
        parentId: 'zone-b',
        isActive: true,
        isPickable: true,
        isReceivable: true,
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'b-03',
        code: 'B-03',
        name: 'Aisle 3 (Transitions)',
        type: 'aisle',
        parentId: 'zone-b',
        isActive: true,
        isPickable: true,
        isReceivable: true,
        createdAt: '2024-01-01T00:00:00Z'
    },

    // Staging Area
    {
        id: 'staging',
        code: 'STAGE',
        name: 'Staging Area',
        type: 'staging',
        parentId: 'wh-main',
        capacity: 2000,
        currentUtilization: 40,
        isActive: true,
        isPickable: true,
        isReceivable: true,
        createdAt: '2024-01-01T00:00:00Z',
        notes: 'Pre-staging for scheduled deliveries'
    },

    // Damage Hold
    {
        id: 'damage-hold',
        code: 'DMG',
        name: 'Damage Hold',
        type: 'damage_hold',
        parentId: 'wh-main',
        isActive: true,
        isPickable: false,
        isReceivable: true,
        createdAt: '2024-01-01T00:00:00Z',
        notes: 'Damaged materials pending inspection/return'
    },

    // Trucks
    {
        id: 'truck-1',
        code: 'TRK-01',
        name: 'Truck #1 - Ford Transit',
        type: 'truck',
        isActive: true,
        isPickable: true,
        isReceivable: false,
        vehicleId: 'VEH-001',
        licensePlate: 'ABC-1234',
        driverName: 'Mike Rodriguez',
        createdAt: '2024-01-01T00:00:00Z'
    },
    {
        id: 'truck-2',
        code: 'TRK-02',
        name: 'Truck #2 - Sprinter Van',
        type: 'truck',
        isActive: true,
        isPickable: true,
        isReceivable: false,
        vehicleId: 'VEH-002',
        licensePlate: 'XYZ-5678',
        driverName: 'Carlos Garcia',
        createdAt: '2024-01-01T00:00:00Z'
    },

    // Active Jobsites
    {
        id: 'jobsite-1',
        code: 'JS-ASH',
        name: 'Ashford Residence',
        type: 'jobsite',
        projectId: 1,
        projectName: 'Ashford Residence',
        address: '2847 Willow Creek Dr',
        isActive: true,
        isPickable: true,
        isReceivable: true,
        createdAt: '2024-12-01T00:00:00Z'
    },
    {
        id: 'jobsite-2',
        code: 'JS-HES',
        name: 'Harmony Estates',
        type: 'jobsite',
        projectId: 2,
        projectName: 'Harmony Estates - Building C',
        address: '1500 Harmony Blvd',
        isActive: true,
        isPickable: true,
        isReceivable: true,
        createdAt: '2024-12-05T00:00:00Z'
    },
    {
        id: 'jobsite-3',
        code: 'JS-LAK',
        name: 'Lakeside Commons',
        type: 'jobsite',
        projectId: 3,
        projectName: 'Lakeside Commons',
        address: '890 Lake Shore Drive',
        isActive: true,
        isPickable: true,
        isReceivable: true,
        createdAt: '2024-12-10T00:00:00Z'
    }
];

// ─────────────────────────────────────────────────────────────────
// ENHANCED MATERIAL LOTS
// Complete lineage tracking with dye lots
// ─────────────────────────────────────────────────────────────────

export const MOCK_ENHANCED_LOTS: EnhancedMaterialLot[] = [
    // LVP - Oak Natural (high-volume item)
    {
        id: 'lot-001',
        itemId: 1,
        itemName: 'LVP - Oak Natural',
        sku: 'LVP-OAK-001',
        lotNumber: 'SH-2024-1203',
        dyeLot: 'DL-2024-A15',
        manufacturerLot: 'SHAW-LVP-2024-1203',
        originalQuantity: 800,
        currentQuantity: 620,
        unit: 'sqft',
        locations: [
            { locationId: 'a-01-01', locationCode: 'A-01-01', quantity: 500 },
            { locationId: 'staging', locationCode: 'STAGE', quantity: 120 }
        ],
        allocations: [
            { projectId: 1, projectName: 'Ashford Residence', quantity: 180, allocatedAt: '2024-12-10T09:00:00Z', allocatedBy: 'Sarah Chen' }
        ],
        vendorId: 1,
        vendorName: 'Shaw Flooring',
        deliveryId: 'del-001',
        poNumber: 'PO-2024-0234',
        receivedDate: '2024-12-03T10:30:00Z',
        expirationDate: '2026-12-03T00:00:00Z',
        qcStatus: 'passed',
        qcTestedAt: '2024-12-03T11:00:00Z',
        qcTestedBy: 'Mike Rodriguez',
        status: 'active',
        unitCost: 3.85,
        totalCost: 3080,
        createdAt: '2024-12-03T10:30:00Z'
    },
    {
        id: 'lot-002',
        itemId: 1,
        itemName: 'LVP - Oak Natural',
        sku: 'LVP-OAK-001',
        lotNumber: 'SH-2024-1210',
        dyeLot: 'DL-2024-A16', // Different dye lot - could cause issues!
        manufacturerLot: 'SHAW-LVP-2024-1210',
        originalQuantity: 600,
        currentQuantity: 600,
        unit: 'sqft',
        locations: [
            { locationId: 'a-01-02', locationCode: 'A-01-02', quantity: 600 }
        ],
        allocations: [],
        vendorId: 1,
        vendorName: 'Shaw Flooring',
        deliveryId: 'del-005',
        poNumber: 'PO-2024-0251',
        receivedDate: '2024-12-10T14:00:00Z',
        qcStatus: 'passed',
        status: 'active',
        unitCost: 3.85,
        totalCost: 2310,
        createdAt: '2024-12-10T14:00:00Z'
    },

    // Hardwood - Maple
    {
        id: 'lot-003',
        itemId: 2,
        itemName: 'Hardwood - Maple',
        sku: 'HW-MAP-002',
        lotNumber: 'MSR-2024-0890',
        dyeLot: 'ML-N-2024-12',
        originalQuantity: 450,
        currentQuantity: 380,
        unit: 'sqft',
        locations: [
            { locationId: 'a-02-01', locationCode: 'A-02-01', quantity: 380 }
        ],
        allocations: [
            { projectId: 2, projectName: 'Harmony Estates', quantity: 70, allocatedAt: '2024-12-08T10:00:00Z', allocatedBy: 'Sarah Chen' }
        ],
        vendorId: 2,
        vendorName: 'MSI Surfaces',
        receivedDate: '2024-11-28T09:00:00Z',
        qcStatus: 'passed',
        status: 'active',
        unitCost: 5.50,
        totalCost: 2090,
        createdAt: '2024-11-28T09:00:00Z'
    },

    // Underlayment
    {
        id: 'lot-004',
        itemId: 5,
        itemName: 'Underlayment - Premium',
        sku: 'UL-PREM-001',
        lotNumber: 'FL-UL-2024-445',
        originalQuantity: 2000,
        currentQuantity: 1650,
        unit: 'sqft',
        locations: [
            { locationId: 'b-01', locationCode: 'B-01', quantity: 1400 },
            { locationId: 'jobsite-1', locationCode: 'JS-ASH', quantity: 250 }
        ],
        allocations: [],
        vendorId: 3,
        vendorName: 'Floor Supply Co',
        receivedDate: '2024-12-01T11:00:00Z',
        qcStatus: 'passed',
        status: 'active',
        unitCost: 0.45,
        totalCost: 742.50,
        createdAt: '2024-12-01T11:00:00Z'
    },

    // Damaged lot in quarantine
    {
        id: 'lot-005',
        itemId: 1,
        itemName: 'LVP - Oak Natural',
        sku: 'LVP-OAK-001',
        lotNumber: 'SH-2024-1115',
        dyeLot: 'DL-2024-A12',
        originalQuantity: 200,
        currentQuantity: 200,
        unit: 'sqft',
        locations: [
            { locationId: 'damage-hold', locationCode: 'DMG', quantity: 200 }
        ],
        allocations: [],
        vendorId: 1,
        vendorName: 'Shaw Flooring',
        receivedDate: '2024-11-15T10:00:00Z',
        qcStatus: 'failed',
        qcTestedAt: '2024-11-15T11:00:00Z',
        qcTestedBy: 'Mike Rodriguez',
        qcNotes: 'Water damage visible on 30% of cartons. Return initiated.',
        status: 'damaged',
        unitCost: 3.85,
        totalCost: 770,
        createdAt: '2024-11-15T10:00:00Z',
        notes: 'Awaiting vendor return pickup'
    },

    // ═══ Tile Adhesive - FlexBond (Item 3) ═══
    {
        id: 'lot-006',
        itemId: 3,
        itemName: 'Tile Adhesive - FlexBond',
        sku: 'ADH-FB-001',
        lotNumber: 'FB-2024-1205',
        originalQuantity: 48,
        currentQuantity: 42,
        unit: 'bags',
        locations: [
            { locationId: 'b-02', locationCode: 'B-02', quantity: 42 }
        ],
        allocations: [
            { projectId: 1, projectName: 'Downtown Lobby Renovation', quantity: 6, allocatedAt: '2024-12-05T10:00:00Z', allocatedBy: 'Sarah Chen' }
        ],
        vendorId: 3,
        vendorName: 'Floor Supply Co',
        receivedDate: '2024-12-05T09:00:00Z',
        qcStatus: 'passed',
        status: 'active',
        unitCost: 28.50,
        totalCost: 1197,
        createdAt: '2024-12-05T09:00:00Z'
    },

    // ═══ T-Molding - Oak (Item 4) ═══
    {
        id: 'lot-007',
        itemId: 4,
        itemName: 'T-Molding - Oak',
        sku: 'TM-OAK-001',
        lotNumber: 'TM-2024-1128',
        originalQuantity: 30,
        currentQuantity: 22,
        unit: 'pcs',
        locations: [
            { locationId: 'b-03', locationCode: 'B-03', quantity: 22 }
        ],
        allocations: [],
        vendorId: 1,
        vendorName: 'Shaw Flooring',
        receivedDate: '2024-11-28T14:00:00Z',
        qcStatus: 'passed',
        status: 'active',
        unitCost: 24.00,
        totalCost: 528,
        createdAt: '2024-11-28T14:00:00Z'
    },

    // ═══ Grout - Charcoal (Item 6) ═══
    {
        id: 'lot-008',
        itemId: 6,
        itemName: 'Grout - Charcoal',
        sku: 'GRT-CHR-001',
        lotNumber: 'GRT-2024-1201',
        originalQuantity: 24,
        currentQuantity: 18,
        unit: 'bags',
        locations: [
            { locationId: 'b-02', locationCode: 'B-02', quantity: 18 }
        ],
        allocations: [
            { projectId: 2, projectName: 'Harmony Estates', quantity: 4, allocatedAt: '2024-12-08T11:00:00Z', allocatedBy: 'Sarah Chen' }
        ],
        vendorId: 2,
        vendorName: 'Tile Distributors Inc',
        receivedDate: '2024-12-01T10:00:00Z',
        qcStatus: 'passed',
        status: 'active',
        unitCost: 18.00,
        totalCost: 324,
        createdAt: '2024-12-01T10:00:00Z'
    },

    // ═══ Reducer - Oak (Item 7) ═══
    {
        id: 'lot-009',
        itemId: 7,
        itemName: 'Reducer - Oak',
        sku: 'RED-OAK-001',
        lotNumber: 'RED-2024-1122',
        originalQuantity: 18,
        currentQuantity: 12,
        unit: 'pcs',
        locations: [
            { locationId: 'b-03', locationCode: 'B-03', quantity: 12 }
        ],
        allocations: [],
        vendorId: 1,
        vendorName: 'Shaw Flooring',
        receivedDate: '2024-11-22T09:00:00Z',
        qcStatus: 'passed',
        status: 'active',
        unitCost: 32.00,
        totalCost: 384,
        createdAt: '2024-11-22T09:00:00Z'
    },

    // ═══ Carpet Pad - 8lb (Item 8) - LOW STOCK ═══
    {
        id: 'lot-010',
        itemId: 8,
        itemName: 'Carpet Pad - 8lb',
        sku: 'CPD-8LB-001',
        lotNumber: 'CPD-2024-1115',
        originalQuantity: 10,
        currentQuantity: 2,
        unit: 'rolls',
        locations: [
            { locationId: 'zone-b', locationCode: 'B', quantity: 2 }
        ],
        allocations: [],
        vendorId: 3,
        vendorName: 'Floor Supply Co',
        receivedDate: '2024-11-15T11:00:00Z',
        qcStatus: 'passed',
        status: 'active',
        unitCost: 85.00,
        totalCost: 170,
        createdAt: '2024-11-15T11:00:00Z',
        notes: 'Low stock - reorder needed'
    },

    // ═══ Porcelain Tile - 24x24 (Item 9) ═══
    {
        id: 'lot-011',
        itemId: 9,
        itemName: 'Porcelain Tile - 24x24',
        sku: 'PT-24-001',
        lotNumber: 'PT-2024-1208',
        dyeLot: 'GRAY-A12',
        originalQuantity: 500,
        currentQuantity: 450,
        unit: 'sqft',
        locations: [
            { locationId: 'a-02-01', locationCode: 'A-02-01', quantity: 300 },
            { locationId: 'staging', locationCode: 'STAGE', quantity: 150 }
        ],
        allocations: [
            { projectId: 1, projectName: 'Downtown Lobby Renovation', quantity: 150, allocatedAt: '2024-12-10T08:00:00Z', allocatedBy: 'Sarah Chen' }
        ],
        vendorId: 2,
        vendorName: 'Tile Distributors Inc',
        receivedDate: '2024-12-08T10:00:00Z',
        qcStatus: 'passed',
        status: 'active',
        unitCost: 6.75,
        totalCost: 3037.50,
        createdAt: '2024-12-08T10:00:00Z'
    },

    // ═══ Carpet Tile - Commercial (Item 10) ═══
    {
        id: 'lot-012',
        itemId: 10,
        itemName: 'Carpet Tile - Commercial',
        sku: 'CT-COM-001',
        lotNumber: 'CT-2024-1128',
        dyeLot: 'BLU-2024-12',
        originalQuantity: 500,
        currentQuantity: 320,
        unit: 'sqft',
        locations: [
            { locationId: 'a-01-01', locationCode: 'A-01-01', quantity: 200 },
            { locationId: 'jobsite-1', locationCode: 'JS-ASH', quantity: 120 }
        ],
        allocations: [
            { projectId: 1, projectName: 'Downtown Lobby Renovation', quantity: 180, allocatedAt: '2024-12-01T09:00:00Z', allocatedBy: 'Sarah Chen' }
        ],
        vendorId: 1,
        vendorName: 'Shaw Flooring',
        receivedDate: '2024-11-28T10:00:00Z',
        qcStatus: 'passed',
        status: 'active',
        unitCost: 3.25,
        totalCost: 1040,
        createdAt: '2024-11-28T10:00:00Z'
    },

    // ═══ Shaw Endura LVP - Walnut (Item 11) ═══
    {
        id: 'lot-013',
        itemId: 11,
        itemName: 'Shaw Endura LVP - Walnut',
        sku: 'SH-END-002',
        lotNumber: 'SH-2024-1212',
        dyeLot: 'WAL-2024-B08',
        originalQuantity: 700,
        currentQuantity: 580,
        unit: 'sqft',
        locations: [
            { locationId: 'a-01-02', locationCode: 'A-01-02', quantity: 400 },
            { locationId: 'staging', locationCode: 'STAGE', quantity: 180 }
        ],
        allocations: [
            { projectId: 3, projectName: 'Lakeside Commons', quantity: 120, allocatedAt: '2024-12-12T10:00:00Z', allocatedBy: 'Sarah Chen' }
        ],
        vendorId: 1,
        vendorName: 'Shaw Flooring',
        receivedDate: '2024-12-12T14:00:00Z',
        qcStatus: 'passed',
        status: 'active',
        unitCost: 4.50,
        totalCost: 2610,
        createdAt: '2024-12-12T14:00:00Z'
    },

    // ═══ Mapei Ultraflex 2 (Item 12) ═══
    {
        id: 'lot-014',
        itemId: 12,
        itemName: 'Mapei Ultraflex 2',
        sku: 'MP-UF2-50',
        lotNumber: 'MAP-2024-1130',
        originalQuantity: 50,
        currentQuantity: 35,
        unit: 'bags',
        locations: [
            { locationId: 'b-02', locationCode: 'B-02', quantity: 25 },
            { locationId: 'truck-1', locationCode: 'TRK-01', quantity: 10 }
        ],
        allocations: [
            { projectId: 1, projectName: 'Downtown Lobby Renovation', quantity: 10, allocatedAt: '2024-12-05T08:00:00Z', allocatedBy: 'Sarah Chen' }
        ],
        vendorId: 2,
        vendorName: 'Tile Distributors Inc',
        receivedDate: '2024-11-30T09:00:00Z',
        qcStatus: 'passed',
        status: 'active',
        unitCost: 35.00,
        totalCost: 1225,
        createdAt: '2024-11-30T09:00:00Z'
    },

    // ═══ Schluter DITRA (Item 13) ═══
    {
        id: 'lot-015',
        itemId: 13,
        itemName: 'Schluter DITRA',
        sku: 'SC-DIT-150',
        lotNumber: 'SCH-2024-1125',
        originalQuantity: 40,
        currentQuantity: 28,
        unit: 'sqft',
        locations: [
            { locationId: 'b-01', locationCode: 'B-01', quantity: 28 }
        ],
        allocations: [
            { projectId: 1, projectName: 'Downtown Lobby Renovation', quantity: 12, allocatedAt: '2024-12-06T09:00:00Z', allocatedBy: 'Sarah Chen' }
        ],
        vendorId: 3,
        vendorName: 'Floor Supply Co',
        receivedDate: '2024-11-25T10:00:00Z',
        qcStatus: 'passed',
        status: 'active',
        unitCost: 75.00,
        totalCost: 2100,
        createdAt: '2024-11-25T10:00:00Z'
    },

    // ═══ Quarter Round - White (Item 14) ═══
    {
        id: 'lot-016',
        itemId: 14,
        itemName: 'Quarter Round - White',
        sku: 'QR-WHT-001',
        lotNumber: 'QR-2024-1120',
        originalQuantity: 100,
        currentQuantity: 85,
        unit: 'pcs',
        locations: [
            { locationId: 'b-03', locationCode: 'B-03', quantity: 70 },
            { locationId: 'truck-2', locationCode: 'TRK-02', quantity: 15 }
        ],
        allocations: [],
        vendorId: 1,
        vendorName: 'Shaw Flooring',
        receivedDate: '2024-11-20T11:00:00Z',
        qcStatus: 'passed',
        status: 'active',
        unitCost: 8.00,
        totalCost: 680,
        createdAt: '2024-11-20T11:00:00Z'
    },

    // ═══ Stair Nose - Oak (Item 15) ═══
    {
        id: 'lot-017',
        itemId: 15,
        itemName: 'Stair Nose - Oak',
        sku: 'SN-OAK-001',
        lotNumber: 'SN-2024-1118',
        originalQuantity: 24,
        currentQuantity: 18,
        unit: 'pcs',
        locations: [
            { locationId: 'b-03', locationCode: 'B-03', quantity: 18 }
        ],
        allocations: [
            { projectId: 3, projectName: 'Lakeside Commons', quantity: 6, allocatedAt: '2024-12-11T14:00:00Z', allocatedBy: 'Sarah Chen' }
        ],
        vendorId: 1,
        vendorName: 'Shaw Flooring',
        receivedDate: '2024-11-18T09:00:00Z',
        qcStatus: 'passed',
        status: 'active',
        unitCost: 45.00,
        totalCost: 810,
        createdAt: '2024-11-18T09:00:00Z'
    }
];

// ─────────────────────────────────────────────────────────────────
// INVENTORY TRANSACTIONS
// Complete audit trail for last 30 days
// ─────────────────────────────────────────────────────────────────

const now = new Date();
const today = now.toISOString();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

export const MOCK_TRANSACTIONS: InventoryTransaction[] = [
    // Recent receives
    {
        id: 'txn-001',
        timestamp: yesterday,
        type: 'receive',
        itemId: 1,
        itemName: 'LVP - Oak Natural',
        sku: 'LVP-OAK-001',
        quantity: 600,
        unit: 'sqft',
        locationId: 'a-01-02',
        locationCode: 'A-01-02',
        lotNumber: 'SH-2024-1210',
        dyeLot: 'DL-2024-A16',
        referenceType: 'po',
        referenceId: 'PO-2024-0251',
        unitCost: 3.85,
        totalCost: 2310,
        performedBy: 'Mike Rodriguez',
        performedByUserId: 3,
        notes: 'Full delivery received, no damage',
        balanceAfter: 1220
    },
    {
        id: 'txn-002',
        timestamp: fiveDaysAgo,
        type: 'receive',
        itemId: 3,
        itemName: 'Tile Adhesive - FlexBond',
        sku: 'ADH-FB-001',
        quantity: 25,
        unit: 'bags',
        locationId: 'b-02',
        locationCode: 'B-02',
        referenceType: 'po',
        referenceId: 'PO-2024-0248',
        unitCost: 28.50,
        totalCost: 712.50,
        performedBy: 'Mike Rodriguez',
        performedByUserId: 3,
        balanceAfter: 42
    },

    // Transfers to trucks
    {
        id: 'txn-003',
        timestamp: yesterday,
        type: 'transfer_out',
        itemId: 1,
        itemName: 'LVP - Oak Natural',
        sku: 'LVP-OAK-001',
        quantity: 180,
        unit: 'sqft',
        locationId: 'staging',
        locationCode: 'STAGE',
        toLocationId: 'truck-1',
        toLocationCode: 'TRK-01',
        lotNumber: 'SH-2024-1203',
        dyeLot: 'DL-2024-A15',
        referenceType: 'transfer',
        referenceId: 'TR-2024-0089',
        projectId: 1,
        projectName: 'Ashford Residence',
        performedBy: 'Mike Rodriguez',
        performedByUserId: 3,
        notes: 'Morning delivery to Ashford',
        balanceAfter: 1040
    },
    {
        id: 'txn-004',
        timestamp: yesterday,
        type: 'transfer_in',
        itemId: 1,
        itemName: 'LVP - Oak Natural',
        sku: 'LVP-OAK-001',
        quantity: 180,
        unit: 'sqft',
        locationId: 'truck-1',
        locationCode: 'TRK-01',
        lotNumber: 'SH-2024-1203',
        dyeLot: 'DL-2024-A15',
        referenceType: 'transfer',
        referenceId: 'TR-2024-0089',
        projectId: 1,
        projectName: 'Ashford Residence',
        performedBy: 'Mike Rodriguez',
        performedByUserId: 3,
        balanceAfter: 180
    },

    // Issues to jobs
    {
        id: 'txn-005',
        timestamp: twoDaysAgo,
        type: 'issue',
        itemId: 5,
        itemName: 'Underlayment - Premium',
        sku: 'UL-PREM-001',
        quantity: 250,
        unit: 'sqft',
        locationId: 'jobsite-1',
        locationCode: 'JS-ASH',
        referenceType: 'daily_log',
        referenceId: 'dl-ash-1210',
        projectId: 1,
        projectName: 'Ashford Residence',
        performedBy: 'James Wilson',
        performedByUserId: 4,
        notes: 'Installed in living room and hallway',
        balanceAfter: 0
    },
    {
        id: 'txn-006',
        timestamp: threeDaysAgo,
        type: 'issue',
        itemId: 1,
        itemName: 'LVP - Oak Natural',
        sku: 'LVP-OAK-001',
        quantity: 120,
        unit: 'sqft',
        locationId: 'jobsite-1',
        locationCode: 'JS-ASH',
        lotNumber: 'SH-2024-1203',
        dyeLot: 'DL-2024-A15',
        referenceType: 'daily_log',
        referenceId: 'dl-ash-1209',
        projectId: 1,
        projectName: 'Ashford Residence',
        performedBy: 'James Wilson',
        performedByUserId: 4,
        balanceAfter: 500
    },

    // Adjustment (cycle count correction)
    {
        id: 'txn-007',
        timestamp: oneWeekAgo,
        type: 'adjust_down',
        itemId: 4,
        itemName: 'T-Molding - Oak',
        sku: 'TM-OAK-001',
        quantity: 3,
        unit: 'pcs',
        locationId: 'b-03',
        locationCode: 'B-03',
        referenceType: 'cycle_count',
        referenceId: 'CC-2024-0023',
        performedBy: 'Emily Parker',
        performedByUserId: 5,
        reason: 'Cycle count variance - found broken pieces in bin',
        balanceAfter: 22
    },

    // Damage recorded
    {
        id: 'txn-008',
        timestamp: twoWeeksAgo,
        type: 'damage',
        itemId: 1,
        itemName: 'LVP - Oak Natural',
        sku: 'LVP-OAK-001',
        quantity: 200,
        unit: 'sqft',
        locationId: 'damage-hold',
        locationCode: 'DMG',
        lotNumber: 'SH-2024-1115',
        dyeLot: 'DL-2024-A12',
        performedBy: 'Mike Rodriguez',
        performedByUserId: 3,
        reason: 'Delivery received with water damage',
        notes: 'Vendor claim initiated - RMA pending',
        balanceAfter: 200
    },

    // Return from job
    {
        id: 'txn-009',
        timestamp: fiveDaysAgo,
        type: 'return',
        itemId: 6,
        itemName: 'Grout - Charcoal',
        sku: 'GRT-CHR-001',
        quantity: 2,
        unit: 'bags',
        locationId: 'b-02',
        locationCode: 'B-02',
        referenceType: 'job',
        referenceId: '2',
        projectId: 2,
        projectName: 'Harmony Estates',
        performedBy: 'Carlos Garcia',
        performedByUserId: 4,
        notes: 'Unused material returned - job used less than estimated',
        balanceAfter: 18
    }
];

// ─────────────────────────────────────────────────────────────────
// STOCK RESERVATIONS
// Materials allocated to upcoming jobs
// ─────────────────────────────────────────────────────────────────

export const MOCK_RESERVATIONS: StockReservation[] = [
    {
        id: 'res-001',
        itemId: 1,
        itemName: 'LVP - Oak Natural',
        sku: 'LVP-OAK-001',
        quantity: 350,
        unit: 'sqft',
        preferredLotNumber: 'SH-2024-1203',
        preferredDyeLot: 'DL-2024-A15',
        locationId: 'a-01-01',
        locationCode: 'A-01-01',
        projectId: 1,
        projectName: 'Ashford Residence',
        jobStartDate: '2024-12-16T00:00:00Z',
        status: 'partial_issued',
        quantityIssued: 180,
        reservedAt: '2024-12-10T09:00:00Z',
        reservedBy: 'Sarah Chen',
        reservedByUserId: 2
    },
    {
        id: 'res-002',
        itemId: 2,
        itemName: 'Hardwood - Maple',
        sku: 'HW-MAP-002',
        quantity: 280,
        unit: 'sqft',
        locationId: 'a-02-01',
        locationCode: 'A-02-01',
        projectId: 2,
        projectName: 'Harmony Estates',
        jobStartDate: '2024-12-18T00:00:00Z',
        status: 'active',
        quantityIssued: 0,
        reservedAt: '2024-12-08T10:00:00Z',
        reservedBy: 'Sarah Chen',
        reservedByUserId: 2
    },
    {
        id: 'res-003',
        itemId: 5,
        itemName: 'Underlayment - Premium',
        sku: 'UL-PREM-001',
        quantity: 400,
        unit: 'sqft',
        locationId: 'b-01',
        locationCode: 'B-01',
        projectId: 3,
        projectName: 'Lakeside Commons',
        jobStartDate: '2024-12-20T00:00:00Z',
        status: 'active',
        quantityIssued: 0,
        reservedAt: '2024-12-12T14:00:00Z',
        reservedBy: 'Sarah Chen',
        reservedByUserId: 2
    }
];

// ─────────────────────────────────────────────────────────────────
// STOCK TRANSFERS
// Active and recent transfers
// ─────────────────────────────────────────────────────────────────

export const MOCK_TRANSFERS: StockTransfer[] = [
    {
        id: 'tr-001',
        transferNumber: 'TR-2024-0089',
        fromLocationId: 'staging',
        fromLocationCode: 'STAGE',
        fromLocationType: 'staging',
        toLocationId: 'jobsite-1',
        toLocationCode: 'JS-ASH',
        toLocationType: 'jobsite',
        projectId: 1,
        projectName: 'Ashford Residence',
        lineItems: [
            {
                id: 'tli-001',
                itemId: 1,
                itemName: 'LVP - Oak Natural',
                sku: 'LVP-OAK-001',
                quantity: 180,
                unit: 'sqft',
                lotNumber: 'SH-2024-1203',
                dyeLot: 'DL-2024-A15',
                pickedQuantity: 180,
                pickedAt: yesterday,
                pickedBy: 'Mike Rodriguez',
                receivedQuantity: 180,
                receivedAt: yesterday,
                receivedBy: 'James Wilson'
            },
            {
                id: 'tli-002',
                itemId: 5,
                itemName: 'Underlayment - Premium',
                sku: 'UL-PREM-001',
                quantity: 250,
                unit: 'sqft',
                pickedQuantity: 250,
                pickedAt: yesterday,
                pickedBy: 'Mike Rodriguez',
                receivedQuantity: 250,
                receivedAt: yesterday,
                receivedBy: 'James Wilson'
            }
        ],
        totalItems: 2,
        totalQuantity: 430,
        status: 'received',
        createdAt: twoDaysAgo,
        createdBy: 'Sarah Chen',
        createdByUserId: 2,
        scheduledDate: yesterday,
        pickedAt: yesterday,
        pickedBy: 'Mike Rodriguez',
        shippedAt: yesterday,
        deliveredAt: yesterday,
        receivedAt: yesterday,
        receivedBy: 'James Wilson',
        photos: [],
        signature: 'data:image/png;base64,signature_data_placeholder',
        signedBy: 'James Wilson',
        signedAt: yesterday,
        notes: 'Morning delivery - full load received'
    },
    {
        id: 'tr-002',
        transferNumber: 'TR-2024-0090',
        fromLocationId: 'a-02-01',
        fromLocationCode: 'A-02-01',
        fromLocationType: 'bay',
        toLocationId: 'staging',
        toLocationCode: 'STAGE',
        toLocationType: 'staging',
        projectId: 2,
        projectName: 'Harmony Estates',
        lineItems: [
            {
                id: 'tli-003',
                itemId: 2,
                itemName: 'Hardwood - Maple',
                sku: 'HW-MAP-002',
                quantity: 280,
                unit: 'sqft',
                lotNumber: 'MSR-2024-0890',
                dyeLot: 'ML-N-2024-12'
            }
        ],
        totalItems: 1,
        totalQuantity: 280,
        status: 'pending',
        createdAt: today,
        createdBy: 'Sarah Chen',
        createdByUserId: 2,
        scheduledDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        photos: [],
        notes: 'Stage for Harmony Estates delivery Wed'
    },
    {
        id: 'tr-003',
        transferNumber: 'TR-2024-0088',
        fromLocationId: 'jobsite-2',
        fromLocationCode: 'JS-HES',
        fromLocationType: 'jobsite',
        toLocationId: 'wh-main',
        toLocationCode: 'MAIN',
        toLocationType: 'warehouse',
        projectId: 2,
        projectName: 'Harmony Estates',
        lineItems: [
            {
                id: 'tli-004',
                itemId: 6,
                itemName: 'Grout - Charcoal',
                sku: 'GRT-CHR-001',
                quantity: 2,
                unit: 'bags',
                pickedQuantity: 2,
                receivedQuantity: 2
            }
        ],
        totalItems: 1,
        totalQuantity: 2,
        status: 'received',
        createdAt: fiveDaysAgo,
        createdBy: 'Carlos Garcia',
        createdByUserId: 4,
        receivedAt: fiveDaysAgo,
        receivedBy: 'Emily Parker',
        photos: [],
        notes: 'Return of unused materials'
    }
];

// ─────────────────────────────────────────────────────────────────
// CYCLE COUNTS
// Recent physical inventory verification
// ─────────────────────────────────────────────────────────────────

export const MOCK_CYCLE_COUNTS: CycleCount[] = [
    {
        id: 'cc-001',
        locationId: 'b-03',
        locationCode: 'B-03',
        items: [
            {
                itemId: 4,
                itemName: 'T-Molding - Oak',
                sku: 'TM-OAK-001',
                systemQuantity: 25,
                countedQuantity: 22,
                variance: -3,
                variancePercent: -12,
                adjustmentMade: true,
                adjustmentTransactionId: 'txn-007',
                notes: 'Found 3 broken pieces in back of bin'
            },
            {
                itemId: 7,
                itemName: 'Reducer - Oak',
                sku: 'RED-OAK-001',
                systemQuantity: 18,
                countedQuantity: 18,
                variance: 0,
                variancePercent: 0,
                adjustmentMade: false
            }
        ],
        totalItems: 2,
        itemsWithVariance: 1,
        status: 'completed',
        accuracy: 94,
        scheduledDate: oneWeekAgo,
        startedAt: oneWeekAgo,
        completedAt: oneWeekAgo,
        countedBy: 'Emily Parker',
        countedByUserId: 5,
        approvedAt: oneWeekAgo,
        approvedBy: 'Sarah Chen',
        approvedByUserId: 2
    },
    {
        id: 'cc-002',
        locationId: 'a-01-01',
        locationCode: 'A-01-01',
        items: [
            {
                itemId: 1,
                itemName: 'LVP - Oak Natural',
                sku: 'LVP-OAK-001',
                systemQuantity: 500,
                countedQuantity: 500,
                variance: 0,
                variancePercent: 0,
                adjustmentMade: false
            }
        ],
        totalItems: 1,
        itemsWithVariance: 0,
        status: 'completed',
        accuracy: 100,
        scheduledDate: threeDaysAgo,
        startedAt: threeDaysAgo,
        completedAt: threeDaysAgo,
        countedBy: 'Mike Rodriguez',
        countedByUserId: 3,
        approvedAt: threeDaysAgo,
        approvedBy: 'Sarah Chen',
        approvedByUserId: 2,
        notes: 'Quarterly count of high-value zone'
    }
];

// ─────────────────────────────────────────────────────────────────
// REORDER SUGGESTIONS
// AI-generated restocking recommendations
// ─────────────────────────────────────────────────────────────────

export const MOCK_REORDER_SUGGESTIONS: ReorderSuggestion[] = [
    {
        itemId: 3,
        itemName: 'Tile Adhesive - FlexBond',
        sku: 'ADH-FB-001',
        currentStock: 42,
        reorderPoint: 50,
        safetyStock: 25,
        suggestedQuantity: 50,
        preferredVendorId: 3,
        preferredVendorName: 'Floor Supply Co',
        estimatedCost: 1425.00,
        leadTimeDays: 5,
        priority: 'medium',
        daysUntilStockout: 8,
        jobsAffected: [
            { projectId: 3, projectName: 'Lakeside Commons', needsBy: '2024-12-20' }
        ],
        reason: 'Current stock below reorder point. Lakeside Commons project needs 20 bags in 5 days.',
        createdAt: today
    },
    {
        itemId: 7,
        itemName: 'Reducer - Oak',
        sku: 'RED-OAK-001',
        currentStock: 12,
        reorderPoint: 15,
        safetyStock: 8,
        suggestedQuantity: 25,
        preferredVendorId: 1,
        preferredVendorName: 'Shaw Flooring',
        estimatedCost: 562.50,
        leadTimeDays: 7,
        priority: 'low',
        daysUntilStockout: 14,
        jobsAffected: [],
        reason: 'Approaching reorder point. No immediate job demands but leads time is 7 days.',
        createdAt: today
    },
    {
        itemId: 8,
        itemName: 'Carpet Pad - 8lb',
        sku: 'CPD-8LB-001',
        currentStock: 2,
        reorderPoint: 20,
        safetyStock: 10,
        suggestedQuantity: 50,
        preferredVendorId: 4,
        preferredVendorName: 'Carpet World',
        estimatedCost: 1125.00,
        leadTimeDays: 3,
        priority: 'critical',
        daysUntilStockout: 2,
        jobsAffected: [
            { projectId: 3, projectName: 'Lakeside Commons', needsBy: '2024-12-20' }
        ],
        reason: 'CRITICAL: Only 2 units remaining. Lakeside Commons needs 45 units in 4 days. Will stockout.',
        createdAt: today
    }
];

// ─────────────────────────────────────────────────────────────────
// WAREHOUSE METRICS
// Real-time KPI calculations
// ─────────────────────────────────────────────────────────────────

export function calculateWarehouseMetrics(): WarehouseMetrics {
    return {
        totalSKUs: 12,
        totalUnits: 4850,
        totalValue: 45680.00,

        lowStockCount: 3,
        outOfStockCount: 0,
        overstockCount: 1,

        avgInventoryTurnover: 8.2,
        avgDaysOnHand: 45,

        inventoryAccuracy: 97.5,
        cycleCountAccuracy: 96.2,

        receivesThisWeek: 4,
        transfersThisWeek: 8,
        issuesThisWeek: 12,

        jobsScheduledThisWeek: 3,
        jobsReadyForMaterials: 2,
        jobsWithShortages: 1,

        pendingReorderCount: 3,
        lotMismatchWarnings: 1,
        expiringLotsCount: 0,

        asOf: new Date().toISOString()
    };
}
