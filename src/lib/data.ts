// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════

export interface Milestone {
    id: number;
    title: string;
    date: string;
    status: 'completed' | 'current' | 'upcoming';
}

export interface PunchItem {
    id: number;
    text: string;
    priority: 'high' | 'medium' | 'low';
    reporter: string;
    due: string;
    completed: boolean;
}

export interface DailyLog {
    id: number;
    date: string;
    crew: number;
    hours: number;
    weather: string;
    sqft: number;
    notes: string;
    // Enhanced fields for field production
    siteConditions?: string;
    blockers?: string;
    temperature?: number;
}

// Photo with semantic labels for field documentation
export type PhotoLabel = 'before' | 'during' | 'after' | 'issue' | 'subfloor' | 'moisture';

export interface PhotoCapture {
    id: number;
    url: string;
    label: PhotoLabel;
    caption?: string;
    timestamp: string;
    location?: string;
}

// QA Checklist types
export type QAChecklistType = 'prep' | 'install' | 'closeout';

export interface QAChecklistItem {
    id: number;
    text: string;
    checked: boolean;
    notes?: string;
    checkedBy?: string;
    checkedAt?: string;
}

export interface QAChecklist {
    id: number;
    projectId: number;
    type: QAChecklistType;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    items: QAChecklistItem[];
}

export interface ScheduleItem {
    id: number;
    time: string;
    title: string;
    subtitle: string;
    type: 'primary' | 'success' | 'warning' | 'muted';
    projectId?: number;
}

export interface Material {
    name: string;
    qty: number;
    unit: string;
    status: 'delivered' | 'ordered' | 'low';
}

export interface ChangeOrderHistory {
    action: string;
    date: string;
    by: string;
}

export interface ChangeOrder {
    id: string;
    projectId: number;
    number: number;
    desc: string;
    reason: string;
    costImpact: number;
    timeImpact: number;
    status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'executed';
    createdDate: string;
    submittedDate: string | null;
    approvedDate: string | null;
    executedDate: string | null;
    approvedBy: string | null;
    photos: string[];
    notes: string;
    history: ChangeOrderHistory[];
}

export interface ProjectFinancials {
    contract: number;
    costs: number;
    margin: number;
}

export interface Project {
    id: number;
    key: string;
    name: string;
    client: string;
    address: string;
    sqft: number;
    type: string;
    value: number;
    progress: number;
    status: 'active' | 'scheduled' | 'pending' | 'completed';
    startDate: string;
    dueDate: string;
    crew: string;
    milestones: Milestone[];
    punchList: PunchItem[];
    dailyLogs: DailyLog[];
    schedule: ScheduleItem[];
    photos: string[];
    photoCaptures: PhotoCapture[];
    materials: Material[];
    changeOrders: ChangeOrder[];
    qaChecklists: QAChecklist[];
    financials: ProjectFinancials;
}

export interface Vendor {
    id: number;
    name: string;
    type: string;
    phone: string;
    rep: string;
}

export interface InventoryItem {
    id: number;
    name: string;
    sku: string;
    stock: number;
    reserved: number;
}

export interface Message {
    id: number;
    from: string;
    preview: string;
    time: string;
    projectId: number;
    unread: boolean;
}

export interface EstimateRoom {
    id: number;
    name: string;
    width: number;
    length: number;
    sqft: number;
    material: string;
    wastePercent: number;
}

export interface EstimateMaterial {
    name: string;
    pricePerSqft?: number;
    pricePerUnit?: number;
    sqft?: number;
    qty?: number;
    total: number;
}

export interface EstimateLabor {
    type: string;
    hours?: number;
    rate?: number;
    sqft?: number;
    ratePerSqft?: number;
    trips?: number;
    total: number;
}

export interface EstimateTotals {
    materialsCost: number;
    laborCost: number;
    subtotal: number;
    margin: number;
    total: number;
}

export interface Estimate {
    id: number;
    client: string;
    address: string;
    contact: string;
    phone: string;
    email: string;
    status: 'draft' | 'sent' | 'approved' | 'rejected';
    createdDate: string;
    sentDate?: string;
    approvedDate?: string;
    rooms: EstimateRoom[];
    materials: EstimateMaterial[];
    labor: EstimateLabor[];
    totals: EstimateTotals;
    depositPercent: number;
    notes: string;
}

export interface Database {
    projects: Project[];
    vendors: Vendor[];
    inventory: InventoryItem[];
    globalSchedule: ScheduleItem[];
    messages: Message[];
    estimates: Estimate[];
    // Offline queue for syncing
    offlineQueue: OfflineQueueItem[];
    // Scheduling system
    crews: Crew[];
    crewAvailability: CrewAvailability[];
    scheduleEntries: ScheduleEntry[];
    blockers: ProjectBlocker[];
}

// Offline Mode Support
export interface OfflineQueueItem {
    id: string;
    action: 'create' | 'update' | 'delete';
    entity: 'dailyLog' | 'photoCapture' | 'qaChecklist' | 'punchItem';
    projectId: number;
    payload: unknown;
    timestamp: string;
    synced: boolean;
}

// ══════════════════════════════════════════════════════════════════
// SCHEDULING & CREW MANAGEMENT TYPES
// ══════════════════════════════════════════════════════════════════

// Crew Management
export interface CrewMember {
    id: number;
    name: string;
    role: 'lead' | 'installer' | 'helper';
    certifications: string[];
    hourlyRate: number;
    phone?: string;
}

export interface Crew {
    id: string;
    name: string;
    color: string; // For calendar display
    members: CrewMember[];
    homeBase: string;
    maxDailyCapacity: number; // hours
}

export interface CrewAvailability {
    crewId: string;
    date: string;
    available: boolean;
    hoursBooked: number;
    notes?: string;
}

// Job Phases with Dependencies
export type JobPhase = 'demo' | 'prep' | 'acclimation' | 'install' | 'cure' | 'punch' | 'closeout';

export interface PhaseConfig {
    phase: JobPhase;
    label: string;
    estimatedHours: number;
    requiredCrew: number;
    dependencies: JobPhase[];
    materialRequired: boolean;
    weatherSensitive: boolean;
    cureTime?: number; // hours
    acclimationTime?: number; // hours
    icon: string;
}

export const PHASE_CONFIGS: Record<JobPhase, Omit<PhaseConfig, 'phase'>> = {
    demo: { label: 'Demo', estimatedHours: 8, requiredCrew: 2, dependencies: [], materialRequired: false, weatherSensitive: false, icon: '🔨' },
    prep: { label: 'Subfloor Prep', estimatedHours: 12, requiredCrew: 2, dependencies: ['demo'], materialRequired: false, weatherSensitive: false, icon: '🧹' },
    acclimation: { label: 'Acclimation', estimatedHours: 0, requiredCrew: 0, dependencies: ['prep'], materialRequired: true, weatherSensitive: true, acclimationTime: 48, icon: '⏳' },
    install: { label: 'Installation', estimatedHours: 24, requiredCrew: 3, dependencies: ['acclimation'], materialRequired: true, weatherSensitive: true, icon: '🔧' },
    cure: { label: 'Cure Time', estimatedHours: 0, requiredCrew: 0, dependencies: ['install'], materialRequired: false, weatherSensitive: true, cureTime: 24, icon: '⏰' },
    punch: { label: 'Punch List', estimatedHours: 4, requiredCrew: 1, dependencies: ['cure'], materialRequired: false, weatherSensitive: false, icon: '✓' },
    closeout: { label: 'Closeout', estimatedHours: 2, requiredCrew: 1, dependencies: ['punch'], materialRequired: false, weatherSensitive: false, icon: '📋' }
};

export interface ProjectPhase {
    phase: JobPhase;
    status: 'not-started' | 'in-progress' | 'blocked' | 'completed';
    scheduledStart?: string;
    scheduledEnd?: string;
    actualStart?: string;
    actualEnd?: string;
    assignedCrewId?: string;
    estimatedHours: number;
    actualHours?: number;
    blockerIds: string[];
}

export interface ProjectBlocker {
    id: string;
    type: 'dependency' | 'material' | 'weather' | 'crew' | 'inspection' | 'other';
    description: string;
    blockingPhases: JobPhase[];
    createdAt: string;
    resolvedAt?: string;
    resolvedBy?: string;
    priority: 'high' | 'medium' | 'low';
}

// Schedule Entries
export interface ScheduleEntry {
    id: string;
    projectId: number;
    phase: JobPhase;
    crewId: string;
    date: string;
    startTime: string;
    endTime: string;
    travelMinutes: number;
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    notes?: string;
}

// Daily Planning
export interface DailyPlanItem {
    projectId: number;
    projectName: string;
    projectAddress: string;
    phase: JobPhase;
    phaseLabel: string;
    priority: 'high' | 'medium' | 'low';
    readyToStart: boolean;
    blockers: ProjectBlocker[];
    estimatedHours: number;
    requiredCrew: number;
    materialReady: boolean;
    weatherOk: boolean;
    recommendedCrewId?: string;
    travelMinutes?: number;
}

// ══════════════════════════════════════════════════════════════════
// INITIAL DATA
// ══════════════════════════════════════════════════════════════════

export const initialData: Database = {
    projects: [
        {
            id: 1, key: 'downtown', name: 'Downtown Lobby Renovation', client: 'Downtown Properties LLC',
            address: '123 Main Street', sqft: 2400, type: 'Commercial Carpet & Tile', value: 45200,
            progress: 65, status: 'active', startDate: '2024-11-15', dueDate: '2024-12-20', crew: 'Team A',
            milestones: [
                { id: 1, title: 'Contract Signed', date: 'Nov 10', status: 'completed' },
                { id: 2, title: 'Demo Complete', date: 'Nov 18', status: 'completed' },
                { id: 3, title: 'Subfloor Prep', date: 'Nov 25', status: 'completed' },
                { id: 4, title: 'Tile Installation', date: 'Dec 12', status: 'current' },
                { id: 5, title: 'Carpet Install', date: 'Dec 16', status: 'upcoming' },
                { id: 6, title: 'Final Walkthrough', date: 'Dec 19', status: 'upcoming' },
                { id: 7, title: 'Project Close', date: 'Dec 20', status: 'upcoming' }
            ],
            punchList: [
                { id: 1, text: 'Grout color mismatch near elevator', priority: 'high', reporter: 'PM', due: 'Dec 13', completed: false },
                { id: 2, text: 'Transition strip loose at hallway', priority: 'high', reporter: 'Client', due: 'Dec 14', completed: false },
                { id: 3, text: 'Minor chip on tile near entrance', priority: 'medium', reporter: 'Derek', due: 'Dec 15', completed: false },
                { id: 4, text: 'Caulk gap at reception desk', priority: 'low', reporter: 'Derek', due: 'Dec 10', completed: true }
            ],
            dailyLogs: [
                { id: 1, date: 'December 12, 2024', crew: 3, hours: 24, weather: '☀️', sqft: 320, notes: 'Completed tile installation in main lobby. Client walkthrough at 2 PM went well.' },
                { id: 2, date: 'December 11, 2024', crew: 3, hours: 24, weather: '🌧️', sqft: 280, notes: 'Good progress on subfloor leveling. Waiting on transition strips.' }
            ],
            schedule: [
                { id: 1, time: '7:00 AM', title: 'Tile Installation', subtitle: 'Main lobby area', type: 'primary' },
                { id: 2, time: '2:00 PM', title: 'Client Walkthrough', subtitle: 'Derek + PM', type: 'warning' }
            ],
            photos: ['Before', 'Subfloor', 'Layout', 'Progress', 'Moisture Test'],
            materials: [
                { name: 'Shaw Commercial Carpet Tile', qty: 2400, unit: 'sf', status: 'delivered' },
                { name: 'Ceramic Entry Tile', qty: 200, unit: 'sf', status: 'delivered' },
                { name: 'Mapei Mortar', qty: 10, unit: 'bags', status: 'low' }
            ],
            changeOrders: [
                {
                    id: 'CO-001',
                    projectId: 1,
                    number: 1,
                    desc: 'Waterproof membrane at elevator',
                    reason: 'Building inspector required additional waterproofing due to proximity to plumbing risers',
                    costImpact: 2450,
                    timeImpact: 2,
                    status: 'executed',
                    createdDate: '2024-12-05',
                    submittedDate: '2024-12-06',
                    approvedDate: '2024-12-07',
                    executedDate: '2024-12-08',
                    approvedBy: 'John Smith (Client)',
                    photos: ['Elevator Area', 'Water Damage', 'Membrane Install'],
                    notes: 'Client approved same day via email. Work completed ahead of schedule.',
                    history: [
                        { action: 'Created', date: '2024-12-05', by: 'Derek Morrison' },
                        { action: 'Submitted for Approval', date: '2024-12-06', by: 'Derek Morrison' },
                        { action: 'Approved', date: '2024-12-07', by: 'John Smith (Client)' },
                        { action: 'Executed & Applied', date: '2024-12-08', by: 'System' }
                    ]
                },
                {
                    id: 'CO-002',
                    projectId: 1,
                    number: 2,
                    desc: 'Upgrade to premium porcelain tile',
                    reason: 'Client requested higher-end finish for main entrance to match new building signage',
                    costImpact: 3800,
                    timeImpact: 1,
                    status: 'submitted',
                    createdDate: '2024-12-10',
                    submittedDate: '2024-12-11',
                    approvedDate: null,
                    executedDate: null,
                    approvedBy: null,
                    photos: ['Current Tile', 'Premium Sample'],
                    notes: 'Awaiting client decision. Follow up scheduled for Dec 14.',
                    history: [
                        { action: 'Created', date: '2024-12-10', by: 'Derek Morrison' },
                        { action: 'Submitted for Approval', date: '2024-12-11', by: 'Derek Morrison' }
                    ]
                },
                {
                    id: 'CO-003',
                    projectId: 1,
                    number: 3,
                    desc: 'Additional floor prep in break room',
                    reason: 'Discovered uneven subfloor requiring leveling compound',
                    costImpact: 875,
                    timeImpact: 0.5,
                    status: 'draft',
                    createdDate: '2024-12-12',
                    submittedDate: null,
                    approvedDate: null,
                    executedDate: null,
                    approvedBy: null,
                    photos: ['Subfloor Issue'],
                    notes: 'Documenting with photos before submitting.',
                    history: [
                        { action: 'Created', date: '2024-12-12', by: 'Derek Morrison' }
                    ]
                }
            ],
            photoCaptures: [],
            qaChecklists: [],
            financials: { contract: 45200, costs: 28450, margin: 37 }
        },
        {
            id: 2, key: 'oakridge', name: 'Oakridge Medical Remodel', client: 'Oakridge Health Systems',
            address: '456 Oak Avenue', sqft: 1800, type: 'LVP Installation', value: 28750,
            progress: 40, status: 'active', startDate: '2024-12-01', dueDate: '2024-12-28', crew: 'Team B',
            milestones: [
                { id: 1, title: 'Contract Signed', date: 'Nov 28', status: 'completed' },
                { id: 2, title: 'Material Delivery', date: 'Dec 5', status: 'completed' },
                { id: 3, title: 'Subfloor Prep', date: 'Dec 12', status: 'current' },
                { id: 4, title: 'LVP Install', date: 'Dec 20', status: 'upcoming' },
                { id: 5, title: 'Final Walkthrough', date: 'Dec 27', status: 'upcoming' }
            ],
            punchList: [
                { id: 5, text: 'Verify moisture levels in exam room', priority: 'high', reporter: 'Tony', due: 'Dec 14', completed: false }
            ],
            dailyLogs: [
                { id: 3, date: 'December 12, 2024', crew: 2, hours: 16, weather: '☀️', sqft: 150, notes: 'Subfloor prep in exam rooms. Working around patient schedule.' }
            ],
            schedule: [
                { id: 3, time: '8:00 AM', title: 'Subfloor Prep', subtitle: 'Exam rooms 1-3', type: 'success' }
            ],
            photos: ['Before', 'Subfloor'],
            materials: [
                { name: 'Shaw Endura LVP - Oak', qty: 1800, unit: 'sf', status: 'delivered' }
            ],
            changeOrders: [
                {
                    id: 'CO-004',
                    projectId: 2,
                    number: 1,
                    desc: 'Asbestos tile removal and abatement',
                    reason: 'Discovered asbestos-containing tiles during demo. Requires licensed abatement.',
                    costImpact: 5200,
                    timeImpact: 3,
                    status: 'approved',
                    createdDate: '2024-12-08',
                    submittedDate: '2024-12-08',
                    approvedDate: '2024-12-09',
                    executedDate: null,
                    approvedBy: 'Dr. Sarah Chen (Oakridge)',
                    photos: ['Tile Sample', 'Test Results', 'Affected Area'],
                    notes: 'URGENT: Health & safety issue. Client approved immediately. Scheduling abatement crew.',
                    history: [
                        { action: 'Created', date: '2024-12-08', by: 'Tony Martinez' },
                        { action: 'Submitted for Approval', date: '2024-12-08', by: 'Derek Morrison' },
                        { action: 'Approved', date: '2024-12-09', by: 'Dr. Sarah Chen (Oakridge)' }
                    ]
                }
            ],
            photoCaptures: [],
            qaChecklists: [],
            financials: { contract: 28750, costs: 16400, margin: 43 }
        },
        {
            id: 3, key: 'lakeside', name: 'Lakeside Condo Units', client: 'Lakeside HOA',
            address: '789 Lake Shore Drive', sqft: 3200, type: 'Tile & Carpet', value: 52000,
            progress: 10, status: 'scheduled', startDate: '2025-01-02', dueDate: '2025-01-15', crew: 'Team A',
            milestones: [
                { id: 1, title: 'Contract Signed', date: 'Dec 10', status: 'completed' },
                { id: 2, title: 'Material Order', date: 'Dec 15', status: 'current' },
                { id: 3, title: 'Project Start', date: 'Jan 2', status: 'upcoming' }
            ],
            punchList: [], dailyLogs: [], schedule: [], photos: [],
            photoCaptures: [],
            materials: [{ name: 'Shaw LVP Various', qty: 3200, unit: 'sf', status: 'ordered' }],
            changeOrders: [],
            qaChecklists: [],
            financials: { contract: 52000, costs: 0, margin: 35 }
        },
        {
            id: 4, key: 'warehouse', name: 'Warehouse Epoxy', client: 'Industrial Storage Co',
            address: 'Industrial Blvd, Unit 5', sqft: 5000, type: 'Epoxy Coating', value: 35500,
            progress: 0, status: 'pending', startDate: '2024-12-30', dueDate: '2025-01-05', crew: 'TBD',
            milestones: [
                { id: 1, title: 'Proposal Sent', date: 'Dec 8', status: 'completed' },
                { id: 2, title: 'Awaiting Approval', date: 'Dec 15', status: 'current' }
            ],
            punchList: [], dailyLogs: [], schedule: [], photos: [], photoCaptures: [], materials: [], changeOrders: [], qaChecklists: [],
            financials: { contract: 35500, costs: 0, margin: 32 }
        }
    ],
    vendors: [
        { id: 1, name: 'Shaw Flooring', type: 'LVP/Carpet Supplier', phone: '(800) 441-7429', rep: 'Sarah Mitchell' },
        { id: 2, name: 'Tile Distributors Inc', type: 'Tile & Setting Materials', phone: '(555) 234-5678', rep: 'Mike Johnson' },
        { id: 3, name: 'Flooring Supply Co', type: 'Tools & Accessories', phone: '(555) 345-6789', rep: 'Tom Anderson' }
    ],
    inventory: [
        { id: 1, name: 'Shaw Endura LVP - Oak', sku: 'SH-END-001', stock: 120, reserved: 48 },
        { id: 2, name: 'Mapei Ultraflex 2', sku: 'MP-UF2-50', stock: 15, reserved: 10 },
        { id: 3, name: 'Schluter DITRA', sku: 'SC-DIT-150', stock: 8, reserved: 3 }
    ],
    globalSchedule: [
        { id: 1, time: '7:00 AM', title: 'Downtown - Tile Install', subtitle: 'Team A', type: 'primary', projectId: 1 },
        { id: 2, time: '8:00 AM', title: 'Oakridge - Subfloor Prep', subtitle: 'Team B', type: 'success', projectId: 2 },
        { id: 3, time: '2:00 PM', title: 'Downtown - Client Walk', subtitle: 'Derek + PM', type: 'warning', projectId: 1 },
        { id: 4, time: '4:00 PM', title: 'Lakeside - Material Delivery', subtitle: '48 boxes LVP', type: 'muted', projectId: 3 }
    ],
    messages: [
        { id: 1, from: 'Sarah (PM)', preview: 'Client loved the progress!', time: '2h ago', projectId: 1, unread: true },
        { id: 2, from: 'Mike (Lead)', preview: 'Need more transition strips', time: '5h ago', projectId: 1, unread: true },
        { id: 3, from: 'Shaw Flooring', preview: 'Order shipped - tracking attached', time: '1d ago', projectId: 3, unread: false }
    ],
    estimates: [
        {
            id: 1,
            client: 'Riverside Apartments LLC',
            address: '555 River Road, Unit 12',
            contact: 'Jennifer Martinez',
            phone: '(555) 789-0123',
            email: 'jmartinez@riverside.com',
            status: 'draft',
            createdDate: '2024-12-10',
            rooms: [
                { id: 1, name: 'Living Room', width: 15, length: 20, sqft: 300, material: 'Oak LVP', wastePercent: 10 },
                { id: 2, name: 'Kitchen', width: 12, length: 14, sqft: 168, material: 'Porcelain Tile', wastePercent: 15 },
                { id: 3, name: 'Bedroom 1', width: 12, length: 12, sqft: 144, material: 'Oak LVP', wastePercent: 10 }
            ],
            materials: [
                { name: 'Shaw Endura LVP - Oak', pricePerSqft: 4.50, sqft: 488, total: 2196 },
                { name: 'Porcelain Tile 12x24', pricePerSqft: 6.75, sqft: 193, total: 1303 },
                { name: 'Mapei Mortar', pricePerUnit: 35, qty: 8, total: 280 },
                { name: 'Underlayment', pricePerSqft: 0.75, sqft: 488, total: 366 }
            ],
            labor: [
                { type: 'Tear-out & Demo', hours: 16, rate: 45, total: 720 },
                { type: 'Subfloor Prep', hours: 12, rate: 50, total: 600 },
                { type: 'LVP Installation', sqft: 488, ratePerSqft: 2.50, total: 1220 },
                { type: 'Tile Installation', sqft: 193, ratePerSqft: 5.00, total: 965 },
                { type: 'Transitions & Trim', hours: 6, rate: 50, total: 300 },
                { type: 'Demo Haul-away', trips: 2, rate: 150, total: 300 }
            ],
            totals: {
                materialsCost: 4145,
                laborCost: 4105,
                subtotal: 8250,
                margin: 35,
                total: 11138
            },
            depositPercent: 30,
            notes: 'Client wants to start in January. Moisture test required before install.'
        },
        {
            id: 2,
            client: 'Tech Startup Office',
            address: '100 Innovation Drive',
            contact: 'David Chen',
            phone: '(555) 234-5678',
            email: 'david@techstartup.com',
            status: 'sent',
            createdDate: '2024-12-08',
            sentDate: '2024-12-09',
            rooms: [
                { id: 1, name: 'Open Office', width: 40, length: 60, sqft: 2400, material: 'Commercial Carpet Tile', wastePercent: 5 },
                { id: 2, name: 'Conference Room', width: 20, length: 15, sqft: 300, material: 'Commercial Carpet Tile', wastePercent: 5 }
            ],
            materials: [
                { name: 'Shaw Commercial Carpet Tile', pricePerSqft: 3.25, sqft: 2835, total: 9214 },
                { name: 'Adhesive', pricePerUnit: 125, qty: 12, total: 1500 }
            ],
            labor: [
                { type: 'Furniture Moving', hours: 8, rate: 40, total: 320 },
                { type: 'Floor Prep', hours: 16, rate: 45, total: 720 },
                { type: 'Carpet Tile Install', sqft: 2835, ratePerSqft: 1.75, total: 4961 }
            ],
            totals: {
                materialsCost: 10714,
                laborCost: 6001,
                subtotal: 16715,
                margin: 30,
                total: 21730
            },
            depositPercent: 25,
            notes: 'Fast-track project. Need to complete over a weekend.'
        },
        {
            id: 3,
            client: 'Historic Home Restoration',
            address: '789 Heritage Lane',
            contact: 'Margaret Thompson',
            phone: '(555) 345-6789',
            email: 'mthompson@email.com',
            status: 'approved',
            createdDate: '2024-12-05',
            sentDate: '2024-12-06',
            approvedDate: '2024-12-07',
            rooms: [
                { id: 1, name: 'Foyer', width: 10, length: 12, sqft: 120, material: 'Marble Tile', wastePercent: 20 },
                { id: 2, name: 'Hallway', width: 4, length: 30, sqft: 120, material: 'Oak Hardwood', wastePercent: 15 }
            ],
            materials: [
                { name: 'Marble Tile 18x18', pricePerSqft: 12.50, sqft: 144, total: 1800 },
                { name: 'Oak Hardwood 3/4"', pricePerSqft: 8.75, sqft: 138, total: 1208 },
                { name: 'Premium Mortar', pricePerUnit: 45, qty: 6, total: 270 },
                { name: 'Wood Finish', pricePerUnit: 85, qty: 3, total: 255 }
            ],
            labor: [
                { type: 'Careful Demo', hours: 12, rate: 55, total: 660 },
                { type: 'Subfloor Repair', hours: 8, rate: 60, total: 480 },
                { type: 'Marble Installation', sqft: 144, ratePerSqft: 8.00, total: 1152 },
                { type: 'Hardwood Installation', sqft: 138, ratePerSqft: 6.50, total: 897 },
                { type: 'Custom Transitions', hours: 6, rate: 65, total: 390 }
            ],
            totals: {
                materialsCost: 3533,
                laborCost: 3579,
                subtotal: 7112,
                margin: 40,
                total: 9957
            },
            depositPercent: 50,
            notes: 'Historic preservation project. Extra care required. Client approved premium materials.'
        }
    ],
    offlineQueue: [],
    crews: [
        {
            id: 'crew-a',
            name: 'Team Alpha',
            color: '#6366f1',
            homeBase: 'Downtown Office',
            maxDailyCapacity: 8,
            members: [
                { id: 1, name: 'Derek Morrison', role: 'lead', certifications: ['LVP', 'Tile', 'Hardwood', 'Epoxy'], hourlyRate: 55, phone: '(555) 111-2222' },
                { id: 2, name: 'Tony Martinez', role: 'installer', certifications: ['LVP', 'Tile', 'Carpet'], hourlyRate: 45, phone: '(555) 111-3333' },
                { id: 3, name: 'James Wilson', role: 'helper', certifications: ['General'], hourlyRate: 28, phone: '(555) 111-4444' }
            ]
        },
        {
            id: 'crew-b',
            name: 'Team Bravo',
            color: '#10b981',
            homeBase: 'North Warehouse',
            maxDailyCapacity: 8,
            members: [
                { id: 4, name: 'Sarah Chen', role: 'lead', certifications: ['LVP', 'Tile', 'Carpet', 'Vinyl Sheet'], hourlyRate: 52, phone: '(555) 222-1111' },
                { id: 5, name: 'Marcus Johnson', role: 'installer', certifications: ['LVP', 'Carpet'], hourlyRate: 42, phone: '(555) 222-2222' },
                { id: 6, name: 'Kyle Patterson', role: 'helper', certifications: ['General'], hourlyRate: 26, phone: '(555) 222-3333' }
            ]
        }
    ],
    crewAvailability: [
        { crewId: 'crew-a', date: '2024-12-16', available: true, hoursBooked: 8 },
        { crewId: 'crew-a', date: '2024-12-17', available: true, hoursBooked: 6 },
        { crewId: 'crew-a', date: '2024-12-18', available: true, hoursBooked: 0 },
        { crewId: 'crew-a', date: '2024-12-19', available: true, hoursBooked: 4 },
        { crewId: 'crew-a', date: '2024-12-20', available: false, hoursBooked: 0, notes: 'Holiday - Off' },
        { crewId: 'crew-b', date: '2024-12-16', available: true, hoursBooked: 4 },
        { crewId: 'crew-b', date: '2024-12-17', available: true, hoursBooked: 8 },
        { crewId: 'crew-b', date: '2024-12-18', available: true, hoursBooked: 0 },
        { crewId: 'crew-b', date: '2024-12-19', available: true, hoursBooked: 6 },
        { crewId: 'crew-b', date: '2024-12-20', available: false, hoursBooked: 0, notes: 'Holiday - Off' }
    ],
    scheduleEntries: [
        {
            id: 'sched-001',
            projectId: 1,
            phase: 'install',
            crewId: 'crew-a',
            date: '2024-12-16',
            startTime: '07:00',
            endTime: '15:30',
            travelMinutes: 25,
            status: 'scheduled',
            notes: 'Continue tile installation in main lobby'
        },
        {
            id: 'sched-002',
            projectId: 2,
            phase: 'prep',
            crewId: 'crew-b',
            date: '2024-12-16',
            startTime: '08:00',
            endTime: '12:00',
            travelMinutes: 35,
            status: 'scheduled',
            notes: 'Subfloor prep in exam rooms'
        },
        {
            id: 'sched-003',
            projectId: 1,
            phase: 'install',
            crewId: 'crew-a',
            date: '2024-12-17',
            startTime: '07:00',
            endTime: '13:00',
            travelMinutes: 25,
            status: 'scheduled',
            notes: 'Complete carpet installation'
        },
        {
            id: 'sched-004',
            projectId: 2,
            phase: 'install',
            crewId: 'crew-b',
            date: '2024-12-17',
            startTime: '07:00',
            endTime: '15:30',
            travelMinutes: 35,
            status: 'scheduled',
            notes: 'LVP installation begins'
        }
    ],
    blockers: [
        {
            id: 'blocker-001',
            type: 'material',
            description: 'Waiting on transition strips delivery - ETA Dec 15',
            blockingPhases: ['install'],
            createdAt: '2024-12-10',
            priority: 'medium'
        },
        {
            id: 'blocker-002',
            type: 'inspection',
            description: 'Building inspector required for asbestos clearance',
            blockingPhases: ['install'],
            createdAt: '2024-12-12',
            priority: 'high'
        },
        {
            id: 'blocker-003',
            type: 'weather',
            description: 'High humidity forecast - may affect LVP acclimation',
            blockingPhases: ['acclimation', 'install'],
            createdAt: '2024-12-14',
            priority: 'low'
        }
    ]
};
