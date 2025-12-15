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
    // Enhanced fields for walkthrough & sign-off
    assignedTo?: string;
    assignedDate?: string;
    location?: string; // Room/area within project
    photos?: string[]; // Photo documentation of the issue
    notes?: string;
    completedBy?: string;
    completedDate?: string;
    walkthroughSessionId?: string; // Link to walkthrough session
    category?: 'flooring' | 'transition' | 'grout' | 'baseboard' | 'damage' | 'installation' | 'other';
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

// ══════════════════════════════════════════════════════════════════
// WALKTHROUGH & SIGN-OFF TYPES
// ══════════════════════════════════════════════════════════════════

export type WalkthroughType = 'pre-install' | 'mid-project' | 'final' | 'punch';

export interface WalkthroughAttendee {
    name: string;
    role: 'client' | 'pm' | 'installer' | 'lead' | 'gc' | 'architect' | 'other';
    email?: string;
    phone?: string;
}

export interface WalkthroughSession {
    id: string;
    projectId: number;
    type: WalkthroughType;
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    scheduledDate: string;
    scheduledTime?: string;
    startedAt?: string;
    completedAt?: string;
    attendees: WalkthroughAttendee[];
    punchItemsCreated: number[]; // IDs of punch items created during session
    notes?: string;
    overallRating?: 1 | 2 | 3 | 4 | 5;
    clientFeedback?: string;
    areasReviewed: string[]; // List of areas/rooms reviewed
    createdBy: string;
    weather?: string;
    photos: string[];
}

export interface SignatureData {
    signature: string; // Base64 PNG data
    signedBy: string;
    signedAt: string;
    title?: string;
    ipAddress?: string;
}

export interface CompletionCertificate {
    id: string;
    projectId: number;
    projectName: string;
    clientName: string;
    clientAddress: string;
    contractValue: number;
    changeOrdersTotal: number;
    finalValue: number;
    completionDate: string;
    generatedDate: string;

    // Sign-off data
    clientSignature?: SignatureData;
    contractorSignature?: SignatureData;

    // Completion checklist
    allPunchItemsClosed: boolean;
    finalWalkthroughComplete: boolean;
    qaChecklistsComplete: boolean;
    photosDocumented: boolean;

    // Outstanding items (if any)
    outstandingItems: string[];
    warrantyStartDate: string;
    warrantyEndDate: string;
    warrantyTerms?: string;

    // Additional info
    notes?: string;
    status: 'draft' | 'pending-signature' | 'client-signed' | 'fully-executed';
}

// Team members for assignment
export interface TeamMember {
    id: number;
    name: string;
    role: 'lead' | 'installer' | 'helper' | 'pm' | 'apprentice';
    phone?: string;
    email?: string;
    avatar?: string;
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
    // Materials & Vendor Tracking
    purchaseOrders: PurchaseOrder[];
    deliveries: Delivery[];
    materialLots: MaterialLot[];
    acclimationEntries: AcclimationEntry[];
    // Budgeting & Job Costing
    laborEntries: LaborEntry[];
    subcontractors: Subcontractor[];
    subcontractorInvoices: SubcontractorInvoice[];
    projectBudgets: ProjectBudget[];
    profitLeakAlerts: ProfitLeakAlert[];
    // Walkthrough & Sign-Off
    walkthroughSessions: WalkthroughSession[];
    completionCertificates: CompletionCertificate[];
    teamMembers: TeamMember[];
    // Client Invoicing & Payments
    clientInvoices: ClientInvoice[];
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
// MATERIALS & VENDOR TRACKING TYPES
// ══════════════════════════════════════════════════════════════════

// Purchase Order Types
export type POStatus = 'draft' | 'submitted' | 'confirmed' | 'partial' | 'received' | 'cancelled';

export interface POLineItem {
    id: string;
    materialName: string;
    sku?: string;
    quantity: number;
    unit: string;
    unitCost: number;
    total: number;
    lotNumber?: string;
    receivedQty?: number;
    damagedQty?: number;
}

export interface PurchaseOrder {
    id: string;
    poNumber: string;
    vendorId: number;
    vendorName: string;
    projectId?: number;
    projectName?: string;
    status: POStatus;
    lineItems: POLineItem[];
    subtotal: number;
    tax: number;
    total: number;
    createdDate: string;
    submittedDate?: string;
    confirmedDate?: string;
    expectedDeliveryDate?: string;
    notes: string;
}

// Delivery Tracking Types
export type DeliveryStatus = 'scheduled' | 'in-transit' | 'arrived' | 'checked-in' | 'issues';

export interface DeliveryPhoto {
    id: string;
    type: 'pallet' | 'damage' | 'label' | 'other';
    url: string; // base64 or URL
    caption?: string;
    timestamp: string;
}

export interface DeliveryLineItem {
    poLineItemId: string;
    materialName: string;
    orderedQty: number;
    receivedQty: number;
    damagedQty: number;
    lotNumber?: string;
    unit: string;
}

export interface Delivery {
    id: string;
    poId: string;
    poNumber: string;
    vendorId: number;
    vendorName: string;
    projectId?: number;
    projectName?: string;
    status: DeliveryStatus;
    scheduledDate: string;
    estimatedTime?: string;
    actualArrival?: string;
    checkedInAt?: string;
    checkedInBy?: string;
    lineItems: DeliveryLineItem[];
    photos: DeliveryPhoto[];
    notes?: string;
    issues?: string;
}

// Lot/Dye Tracking Types
export interface MaterialLot {
    id: string;
    materialName: string;
    lotNumber: string;
    dyeLot?: string;
    quantity: number;
    unit: string;
    vendorId: number;
    vendorName: string;
    projectId?: number;
    projectName?: string;
    deliveryId?: string;
    receivedDate: string;
    expirationDate?: string;
    notes?: string;
}

export interface LotWarning {
    projectId: number;
    projectName: string;
    materialName: string;
    lots: { lotNumber: string; quantity: number }[];
    severity: 'warning' | 'critical';
    message: string;
}

// Acclimation Tracking Types
export type AcclimationStatus = 'not-started' | 'in-progress' | 'ready' | 'expired';
export type MaterialType = 'lvp' | 'hardwood' | 'engineered' | 'laminate' | 'tile' | 'carpet';

export const ACCLIMATION_REQUIREMENTS: Record<MaterialType, { hours: number; minTemp: number; maxTemp: number; minHumidity: number; maxHumidity: number }> = {
    lvp: { hours: 48, minTemp: 65, maxTemp: 85, minHumidity: 30, maxHumidity: 60 },
    hardwood: { hours: 72, minTemp: 60, maxTemp: 80, minHumidity: 35, maxHumidity: 55 },
    engineered: { hours: 48, minTemp: 65, maxTemp: 85, minHumidity: 30, maxHumidity: 60 },
    laminate: { hours: 48, minTemp: 65, maxTemp: 85, minHumidity: 35, maxHumidity: 65 },
    tile: { hours: 24, minTemp: 50, maxTemp: 100, minHumidity: 20, maxHumidity: 80 },
    carpet: { hours: 24, minTemp: 65, maxTemp: 85, minHumidity: 30, maxHumidity: 65 },
};

export interface AcclimationReading {
    id: string;
    timestamp: string;
    temperature: number;
    humidity: number;
    notes?: string;
    recordedBy?: string;
}

export interface AcclimationEntry {
    id: string;
    materialName: string;
    materialType: MaterialType;
    lotNumber?: string;
    projectId: number;
    projectName: string;
    location: string;
    requiredHours: number;
    startTime: string;
    endTime?: string;
    status: AcclimationStatus;
    readings: AcclimationReading[];
    minTemp: number;
    maxTemp: number;
    minHumidity: number;
    maxHumidity: number;
}

// ══════════════════════════════════════════════════════════════════
// BUDGETING & JOB COSTING TYPES
// ══════════════════════════════════════════════════════════════════

// Labor Tracking
export type WorkerRole = 'lead' | 'installer' | 'helper' | 'apprentice';

export interface LaborEntry {
    id: string;
    projectId: number;
    workerId: number;
    workerName: string;
    role: WorkerRole;
    phase: JobPhase;
    date: string;
    regularHours: number;
    overtimeHours: number;
    regularRate: number;
    overtimeRate: number;
    totalCost: number;
    notes?: string;
    approvedBy?: string;
    approvedAt?: string;
}

export interface LaborSummary {
    projectId: number;
    totalHours: number;
    regularHours: number;
    overtimeHours: number;
    totalCost: number;
    byPhase: Record<JobPhase, { hours: number; cost: number }>;
    byWorker: Record<number, { name: string; hours: number; cost: number }>;
    byRole: Record<WorkerRole, { hours: number; cost: number }>;
}

// Budget Categories
export type CostCategory = 'labor' | 'materials' | 'subcontractor' | 'equipment' | 'overhead' | 'other';

export interface BudgetLineItem {
    id: string;
    category: CostCategory;
    description: string;
    estimatedQty: number;
    estimatedRate: number;
    estimatedTotal: number;
    actualQty: number;
    actualRate: number;
    actualTotal: number;
    variance: number;
    variancePercent: number;
    notes?: string;
}

export interface PhaseBudget {
    phase: JobPhase;
    estimatedLabor: number;
    estimatedMaterials: number;
    estimatedSubcontractors: number;
    estimatedOther: number;
    estimatedTotal: number;
    actualLabor: number;
    actualMaterials: number;
    actualSubcontractors: number;
    actualOther: number;
    actualTotal: number;
    variance: number;
    variancePercent: number;
    status: 'on-budget' | 'warning' | 'over-budget';
}

export interface ProjectBudget {
    projectId: number;
    contractValue: number;
    approvedCOs: number;
    totalRevenue: number;
    estimatedCost: number;
    actualCost: number;
    projectedCost: number;
    currentMargin: number;
    projectedMargin: number;
    targetMargin: number;
    phaseBudgets: PhaseBudget[];
    lineItems: BudgetLineItem[];
    lastUpdated: string;
}

// Subcontractor Management
export interface Subcontractor {
    id: number;
    name: string;
    company: string;
    trade: string;
    phone: string;
    email: string;
    address?: string;
    hourlyRate?: number;
    notes?: string;
    rating: number;
    totalJobsCompleted: number;
    insuranceExpiry?: string;
    licenseNumber?: string;
}

export type InvoiceStatus = 'draft' | 'submitted' | 'pending-approval' | 'approved' | 'rejected' | 'paid' | 'disputed';

export interface SubcontractorInvoiceItem {
    id: string;
    description: string;
    quantity: number;
    rate: number;
    total: number;
    phase?: JobPhase;
}

export interface SubcontractorInvoice {
    id: string;
    invoiceNumber: string;
    subcontractorId: number;
    subcontractorName: string;
    projectId: number;
    projectName: string;
    status: InvoiceStatus;
    items: SubcontractorInvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
    invoiceDate: string;
    dueDate: string;
    submittedDate?: string;
    approvedDate?: string;
    approvedBy?: string;
    paidDate?: string;
    notes?: string;
    attachments?: string[];
    disputeReason?: string;
}

// Profit Leak Detection
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertType = 'labor-overrun' | 'material-overrun' | 'sub-overrun' | 'margin-erosion' | 'schedule-delay' | 'change-order-pending';

export interface ProfitLeakAlert {
    id: string;
    projectId: number;
    projectName: string;
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    description: string;
    impact: number;
    impactPercent: number;
    phase?: JobPhase;
    recommendation: string;
    createdAt: string;
    acknowledgedAt?: string;
    acknowledgedBy?: string;
    resolvedAt?: string;
}

export interface MarginAnalysis {
    projectId: number;
    contractValue: number;
    approvedChangeOrders: number;
    totalRevenue: number;
    laborCost: number;
    materialCost: number;
    subcontractorCost: number;
    overheadCost: number;
    totalCost: number;
    grossProfit: number;
    grossMargin: number;
    targetMargin: number;
    marginVariance: number;
    profitLeakAlerts: ProfitLeakAlert[];
    trend: 'improving' | 'stable' | 'declining';
    projectedFinalMargin: number;
}

// ══════════════════════════════════════════════════════════════════
// CLIENT INVOICING & PAYMENTS TYPES
// ══════════════════════════════════════════════════════════════════

export type ClientInvoiceType = 'deposit' | 'progress' | 'final' | 'change-order';
export type ClientInvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'void';
export type PaymentMethod = 'check' | 'ach' | 'credit-card' | 'wire' | 'cash' | 'other';

export interface InvoiceLineItem {
    id: string;
    description: string;
    quantity: number;
    rate: number;
    total: number;
    phase?: JobPhase;
}

export interface PaymentRecord {
    id: string;
    date: string;
    amount: number;
    method: PaymentMethod;
    reference?: string; // Check number, transaction ID, etc.
    notes?: string;
    recordedBy?: string;
    recordedAt?: string;
}

export interface ClientInvoice {
    id: string;
    invoiceNumber: string;
    projectId: number;
    projectName: string;
    type: ClientInvoiceType;
    status: ClientInvoiceStatus;

    // Client info
    clientName: string;
    clientAddress: string;
    clientEmail?: string;
    clientPhone?: string;

    // Invoice details
    lineItems: InvoiceLineItem[];
    subtotal: number;
    taxRate: number;
    tax: number;

    // Retainage (for commercial projects)
    retainagePercent: number;
    retainageAmount: number;
    retainageReleased: boolean; // True for final invoices that release retainage

    // Totals
    total: number;
    amountPaid: number;
    balance: number;

    // Dates
    invoiceDate: string;
    dueDate: string;
    sentDate?: string;
    viewedDate?: string;
    paidDate?: string;

    // Payment tracking
    payments: PaymentRecord[];

    // Related documents
    relatedCOIds?: string[]; // Change orders included in this invoice
    notes?: string;
    terms?: string; // Payment terms (e.g., "Net 30")

    // Metadata
    createdBy?: string;
    createdAt?: string;
    lastModified?: string;
}

export interface ProjectInvoiceSummary {
    projectId: number;
    contractValue: number;
    approvedChangeOrders: number;
    totalContractValue: number;

    totalInvoiced: number;
    totalPaid: number;
    totalOutstanding: number;

    retainageHeld: number;
    retainageReleased: number;
    retainageBalance: number;

    percentInvoiced: number;
    percentCollected: number;

    invoiceCount: number;
    overdueCount: number;
    overdueAmount: number;

    depositInvoice?: ClientInvoice;
    progressInvoices: ClientInvoice[];
    finalInvoice?: ClientInvoice;

    nextInvoiceNumber: string;
    suggestedNextInvoice?: {
        type: ClientInvoiceType;
        reason: string;
        estimatedAmount: number;
    };
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
    ],
    // Materials & Vendor Tracking Sample Data
    purchaseOrders: [
        {
            id: 'PO-001',
            poNumber: 'PO-2024-001',
            vendorId: 1,
            vendorName: 'Shaw Flooring',
            projectId: 1,
            projectName: 'Downtown Lobby Renovation',
            status: 'received',
            lineItems: [
                { id: 'li-001', materialName: 'Shaw Commercial Carpet Tile', sku: 'SH-CCT-2400', quantity: 2400, unit: 'sf', unitCost: 3.25, total: 7800, lotNumber: 'DL-2024-1215-A', receivedQty: 2400, damagedQty: 0 },
                { id: 'li-002', materialName: 'Carpet Tile Adhesive', sku: 'ADH-CT-5GAL', quantity: 8, unit: 'bucket', unitCost: 125, total: 1000, receivedQty: 8, damagedQty: 0 }
            ],
            subtotal: 8800,
            tax: 726,
            total: 9526,
            createdDate: '2024-11-20',
            submittedDate: '2024-11-20',
            confirmedDate: '2024-11-21',
            expectedDeliveryDate: '2024-11-28',
            notes: 'Rush order for Downtown project'
        },
        {
            id: 'PO-002',
            poNumber: 'PO-2024-002',
            vendorId: 1,
            vendorName: 'Shaw Flooring',
            projectId: 2,
            projectName: 'Oakridge Medical Remodel',
            status: 'confirmed',
            lineItems: [
                { id: 'li-003', materialName: 'Shaw Endura LVP - Oak', sku: 'SH-END-001', quantity: 1800, unit: 'sf', unitCost: 4.50, total: 8100, lotNumber: 'LVP-2024-1210-B' },
                { id: 'li-004', materialName: 'LVP Underlayment', sku: 'UND-LVP-200', quantity: 1800, unit: 'sf', unitCost: 0.75, total: 1350 },
                { id: 'li-005', materialName: 'T-Molding Transitions', sku: 'TM-OAK-8FT', quantity: 12, unit: 'pcs', unitCost: 24, total: 288 }
            ],
            subtotal: 9738,
            tax: 803,
            total: 10541,
            createdDate: '2024-12-05',
            submittedDate: '2024-12-05',
            confirmedDate: '2024-12-06',
            expectedDeliveryDate: '2024-12-16',
            notes: 'Medical facility - need low-VOC materials'
        },
        {
            id: 'PO-003',
            poNumber: 'PO-2024-003',
            vendorId: 2,
            vendorName: 'Tile Distributors Inc',
            projectId: 1,
            projectName: 'Downtown Lobby Renovation',
            status: 'partial',
            lineItems: [
                { id: 'li-006', materialName: 'Ceramic Entry Tile 12x24', sku: 'CET-1224-GRY', quantity: 200, unit: 'sf', unitCost: 6.75, total: 1350, lotNumber: 'TL-2024-A12', receivedQty: 150, damagedQty: 5 },
                { id: 'li-007', materialName: 'Mapei Ultraflex 2 Mortar', sku: 'MP-UF2-50', quantity: 10, unit: 'bag', unitCost: 35, total: 350, receivedQty: 10, damagedQty: 0 },
                { id: 'li-008', materialName: 'Unsanded Grout - Gray', sku: 'GRT-UNS-25', quantity: 4, unit: 'bag', unitCost: 18, total: 72, receivedQty: 4, damagedQty: 0 }
            ],
            subtotal: 1772,
            tax: 146,
            total: 1918,
            createdDate: '2024-11-25',
            submittedDate: '2024-11-25',
            confirmedDate: '2024-11-26',
            expectedDeliveryDate: '2024-12-01',
            notes: 'Partial shipment - backorder on 50sf tile. ETA Dec 18.'
        },
        {
            id: 'PO-004',
            poNumber: 'PO-2024-004',
            vendorId: 1,
            vendorName: 'Shaw Flooring',
            projectId: 3,
            projectName: 'Lakeside Condo Units',
            status: 'submitted',
            lineItems: [
                { id: 'li-009', materialName: 'Shaw LVP Various (Mixed)', sku: 'SH-LVP-MIX', quantity: 3200, unit: 'sf', unitCost: 4.25, total: 13600 },
                { id: 'li-010', materialName: 'Quarter Round Trim', sku: 'QR-OAK-8FT', quantity: 48, unit: 'pcs', unitCost: 8, total: 384 }
            ],
            subtotal: 13984,
            tax: 1154,
            total: 15138,
            createdDate: '2024-12-12',
            submittedDate: '2024-12-12',
            expectedDeliveryDate: '2024-12-28',
            notes: 'Scheduled for Jan 2 start'
        }
    ],
    deliveries: [
        {
            id: 'DEL-001',
            poId: 'PO-001',
            poNumber: 'PO-2024-001',
            vendorId: 1,
            vendorName: 'Shaw Flooring',
            projectId: 1,
            projectName: 'Downtown Lobby Renovation',
            status: 'checked-in',
            scheduledDate: '2024-11-28',
            estimatedTime: '10:00 AM',
            actualArrival: '2024-11-28T10:15:00',
            checkedInAt: '2024-11-28T10:45:00',
            checkedInBy: 'Derek Morrison',
            lineItems: [
                { poLineItemId: 'li-001', materialName: 'Shaw Commercial Carpet Tile', orderedQty: 2400, receivedQty: 2400, damagedQty: 0, lotNumber: 'DL-2024-1215-A', unit: 'sf' },
                { poLineItemId: 'li-002', materialName: 'Carpet Tile Adhesive', orderedQty: 8, receivedQty: 8, damagedQty: 0, unit: 'bucket' }
            ],
            photos: [
                { id: 'ph-001', type: 'pallet', url: '/placeholder-pallet.jpg', caption: 'Carpet tile pallet - good condition', timestamp: '2024-11-28T10:20:00' }
            ],
            notes: 'All materials received in good condition'
        },
        {
            id: 'DEL-002',
            poId: 'PO-002',
            poNumber: 'PO-2024-002',
            vendorId: 1,
            vendorName: 'Shaw Flooring',
            projectId: 2,
            projectName: 'Oakridge Medical Remodel',
            status: 'scheduled',
            scheduledDate: '2024-12-16',
            estimatedTime: '2:00 PM',
            lineItems: [
                { poLineItemId: 'li-003', materialName: 'Shaw Endura LVP - Oak', orderedQty: 1800, receivedQty: 0, damagedQty: 0, lotNumber: 'LVP-2024-1210-B', unit: 'sf' },
                { poLineItemId: 'li-004', materialName: 'LVP Underlayment', orderedQty: 1800, receivedQty: 0, damagedQty: 0, unit: 'sf' },
                { poLineItemId: 'li-005', materialName: 'T-Molding Transitions', orderedQty: 12, receivedQty: 0, damagedQty: 0, unit: 'pcs' }
            ],
            photos: [],
            notes: 'Delivery to job site - Oakridge Medical'
        },
        {
            id: 'DEL-003',
            poId: 'PO-003',
            poNumber: 'PO-2024-003',
            vendorId: 2,
            vendorName: 'Tile Distributors Inc',
            projectId: 1,
            projectName: 'Downtown Lobby Renovation',
            status: 'issues',
            scheduledDate: '2024-12-01',
            estimatedTime: '9:00 AM',
            actualArrival: '2024-12-01T09:30:00',
            checkedInAt: '2024-12-01T10:00:00',
            checkedInBy: 'Tony Martinez',
            lineItems: [
                { poLineItemId: 'li-006', materialName: 'Ceramic Entry Tile 12x24', orderedQty: 200, receivedQty: 150, damagedQty: 5, lotNumber: 'TL-2024-A12', unit: 'sf' },
                { poLineItemId: 'li-007', materialName: 'Mapei Ultraflex 2 Mortar', orderedQty: 10, receivedQty: 10, damagedQty: 0, unit: 'bag' },
                { poLineItemId: 'li-008', materialName: 'Unsanded Grout - Gray', orderedQty: 4, receivedQty: 4, damagedQty: 0, unit: 'bag' }
            ],
            photos: [
                { id: 'ph-002', type: 'damage', url: '/placeholder-damage.jpg', caption: '5 tiles cracked in transit', timestamp: '2024-12-01T09:45:00' },
                { id: 'ph-003', type: 'pallet', url: '/placeholder-pallet2.jpg', caption: 'Partial shipment received', timestamp: '2024-12-01T09:40:00' }
            ],
            notes: 'Partial delivery - 50sf backordered',
            issues: '5 tiles damaged in transit. 50sf backordered - ETA Dec 18. Filed damage claim with vendor.'
        }
    ],
    materialLots: [
        {
            id: 'LOT-001',
            materialName: 'Shaw Commercial Carpet Tile',
            lotNumber: 'DL-2024-1215-A',
            dyeLot: 'DYE-BLU-2024-12',
            quantity: 2400,
            unit: 'sf',
            vendorId: 1,
            vendorName: 'Shaw Flooring',
            projectId: 1,
            projectName: 'Downtown Lobby Renovation',
            deliveryId: 'DEL-001',
            receivedDate: '2024-11-28',
            notes: 'Main carpet tile for lobby - verify dye lot match on any reorders'
        },
        {
            id: 'LOT-002',
            materialName: 'Shaw Endura LVP - Oak',
            lotNumber: 'LVP-2024-1210-B',
            quantity: 1800,
            unit: 'sf',
            vendorId: 1,
            vendorName: 'Shaw Flooring',
            projectId: 2,
            projectName: 'Oakridge Medical Remodel',
            receivedDate: '2024-12-16',
            notes: '48hr acclimation required'
        },
        {
            id: 'LOT-003',
            materialName: 'Ceramic Entry Tile 12x24',
            lotNumber: 'TL-2024-A12',
            dyeLot: 'DYE-GRY-A12',
            quantity: 145,
            unit: 'sf',
            vendorId: 2,
            vendorName: 'Tile Distributors Inc',
            projectId: 1,
            projectName: 'Downtown Lobby Renovation',
            deliveryId: 'DEL-003',
            receivedDate: '2024-12-01',
            notes: '5sf damaged - awaiting backorder with SAME lot number'
        }
    ],
    acclimationEntries: [
        {
            id: 'ACC-001',
            materialName: 'Shaw Commercial Carpet Tile',
            materialType: 'carpet',
            lotNumber: 'DL-2024-1215-A',
            projectId: 1,
            projectName: 'Downtown Lobby Renovation',
            location: 'Job site - Main lobby staging area',
            requiredHours: 24,
            startTime: '2024-11-28T11:00:00',
            endTime: '2024-11-29T11:00:00',
            status: 'ready',
            readings: [
                { id: 'rd-001', timestamp: '2024-11-28T11:00:00', temperature: 68, humidity: 42, recordedBy: 'Derek Morrison' },
                { id: 'rd-002', timestamp: '2024-11-28T17:00:00', temperature: 70, humidity: 44, recordedBy: 'Tony Martinez' },
                { id: 'rd-003', timestamp: '2024-11-29T08:00:00', temperature: 69, humidity: 43, recordedBy: 'Derek Morrison' }
            ],
            minTemp: 65,
            maxTemp: 85,
            minHumidity: 30,
            maxHumidity: 65
        },
        {
            id: 'ACC-002',
            materialName: 'Shaw Endura LVP - Oak',
            materialType: 'lvp',
            lotNumber: 'LVP-2024-1210-B',
            projectId: 2,
            projectName: 'Oakridge Medical Remodel',
            location: 'Oakridge Medical - Storage Room 101',
            requiredHours: 48,
            startTime: '2024-12-16T14:00:00',
            status: 'in-progress',
            readings: [
                { id: 'rd-004', timestamp: '2024-12-16T14:00:00', temperature: 72, humidity: 48, recordedBy: 'Sarah Chen', notes: 'Initial reading after delivery' }
            ],
            minTemp: 65,
            maxTemp: 85,
            minHumidity: 30,
            maxHumidity: 60
        }
    ],
    // ═══════════════════════════════════════════════════════════════════════
    // BUDGETING & JOB COSTING SAMPLE DATA
    // ═══════════════════════════════════════════════════════════════════════
    laborEntries: [
        // Downtown Lobby Renovation - Recent labor entries
        { id: 'LE-001', projectId: 1, workerId: 1, workerName: 'Derek Morrison', role: 'lead', phase: 'install', date: '2024-12-12', regularHours: 8, overtimeHours: 0, regularRate: 55, overtimeRate: 82.5, totalCost: 440, notes: 'Tile installation in main lobby', approvedBy: 'System', approvedAt: '2024-12-12' },
        { id: 'LE-002', projectId: 1, workerId: 2, workerName: 'Tony Martinez', role: 'installer', phase: 'install', date: '2024-12-12', regularHours: 8, overtimeHours: 2, regularRate: 45, overtimeRate: 67.5, totalCost: 495, notes: 'Tile installation - stayed late to finish section' },
        { id: 'LE-003', projectId: 1, workerId: 3, workerName: 'James Wilson', role: 'helper', phase: 'install', date: '2024-12-12', regularHours: 8, overtimeHours: 0, regularRate: 28, overtimeRate: 42, totalCost: 224, notes: 'Material handling and cleanup' },
        { id: 'LE-004', projectId: 1, workerId: 1, workerName: 'Derek Morrison', role: 'lead', phase: 'install', date: '2024-12-11', regularHours: 8, overtimeHours: 0, regularRate: 55, overtimeRate: 82.5, totalCost: 440, notes: 'Subfloor leveling complete' },
        { id: 'LE-005', projectId: 1, workerId: 2, workerName: 'Tony Martinez', role: 'installer', phase: 'install', date: '2024-12-11', regularHours: 8, overtimeHours: 0, regularRate: 45, overtimeRate: 67.5, totalCost: 360, notes: 'Subfloor prep and leveling' },
        { id: 'LE-006', projectId: 1, workerId: 3, workerName: 'James Wilson', role: 'helper', phase: 'prep', date: '2024-12-11', regularHours: 8, overtimeHours: 0, regularRate: 28, overtimeRate: 42, totalCost: 224, notes: 'Demo cleanup and prep work' },
        // Oakridge Medical - Labor
        { id: 'LE-007', projectId: 2, workerId: 4, workerName: 'Sarah Chen', role: 'lead', phase: 'prep', date: '2024-12-12', regularHours: 6, overtimeHours: 0, regularRate: 52, overtimeRate: 78, totalCost: 312, notes: 'Subfloor assessment in exam rooms' },
        { id: 'LE-008', projectId: 2, workerId: 5, workerName: 'Marcus Johnson', role: 'installer', phase: 'prep', date: '2024-12-12', regularHours: 6, overtimeHours: 0, regularRate: 42, overtimeRate: 63, totalCost: 252, notes: 'Moisture testing completed' },
        { id: 'LE-009', projectId: 2, workerId: 6, workerName: 'Kyle Patterson', role: 'helper', phase: 'prep', date: '2024-12-12', regularHours: 4, overtimeHours: 0, regularRate: 26, overtimeRate: 39, totalCost: 104, notes: 'Clearing furniture from work area' },
        { id: 'LE-010', projectId: 2, workerId: 4, workerName: 'Sarah Chen', role: 'lead', phase: 'demo', date: '2024-12-10', regularHours: 8, overtimeHours: 1, regularRate: 52, overtimeRate: 78, totalCost: 494, notes: 'Discovered asbestos tile - halted work' }
    ],
    subcontractors: [
        { id: 1, name: 'Mike Rodriguez', company: 'Rodriguez Heavy Demo', trade: 'Demolition', phone: '(555) 444-1111', email: 'mike@rodriguezdemo.com', hourlyRate: 85, rating: 4.5, totalJobsCompleted: 12, insuranceExpiry: '2025-06-15', licenseNumber: 'DEM-2024-1122', notes: 'Excellent for large demo jobs, has own dumpsters' },
        { id: 2, name: 'Lisa Chang', company: 'Premium Floor Prep LLC', trade: 'Subfloor Prep', phone: '(555) 444-2222', email: 'lisa@premiumfloorprep.com', hourlyRate: 75, rating: 4.8, totalJobsCompleted: 28, insuranceExpiry: '2025-03-20', licenseNumber: 'PREP-2023-5544', notes: 'Specializes in commercial concrete prep, self-leveling' },
        { id: 3, name: 'Environmental Solutions Inc', company: 'Environmental Solutions Inc', trade: 'Asbestos Abatement', phone: '(555) 444-3333', email: 'ops@envsolutions.com', hourlyRate: 150, rating: 5.0, totalJobsCompleted: 8, insuranceExpiry: '2025-08-01', licenseNumber: 'HAZ-2024-0099', notes: 'Licensed for asbestos, lead, mold - REQUIRED for hazmat' },
        { id: 4, name: 'Carlos Gutierrez', company: 'CG Tile Masters', trade: 'Tile Installation', phone: '(555) 444-4444', email: 'carlos@cgtile.com', hourlyRate: 65, rating: 4.2, totalJobsCompleted: 6, insuranceExpiry: '2025-01-30', licenseNumber: 'TILE-2024-7788' }
    ],
    subcontractorInvoices: [
        {
            id: 'INV-001',
            invoiceNumber: 'RHD-2024-0089',
            subcontractorId: 1,
            subcontractorName: 'Rodriguez Heavy Demo',
            projectId: 1,
            projectName: 'Downtown Lobby Renovation',
            status: 'paid',
            items: [
                { id: 'item-001', description: 'Carpet removal - 2400sf', quantity: 2400, rate: 0.75, total: 1800, phase: 'demo' },
                { id: 'item-002', description: 'Tile demo - lobby entrance', quantity: 200, rate: 2.50, total: 500, phase: 'demo' },
                { id: 'item-003', description: 'Dumpster rental (2x)', quantity: 2, rate: 450, total: 900, phase: 'demo' },
                { id: 'item-004', description: 'Haul-away labor', quantity: 8, rate: 85, total: 680, phase: 'demo' }
            ],
            subtotal: 3880,
            tax: 0,
            total: 3880,
            invoiceDate: '2024-11-20',
            dueDate: '2024-12-05',
            submittedDate: '2024-11-20',
            approvedDate: '2024-11-21',
            approvedBy: 'Derek Morrison',
            paidDate: '2024-12-01',
            notes: 'Demo completed on schedule'
        },
        {
            id: 'INV-002',
            invoiceNumber: 'ENV-2024-0034',
            subcontractorId: 3,
            subcontractorName: 'Environmental Solutions Inc',
            projectId: 2,
            projectName: 'Oakridge Medical Remodel',
            status: 'approved',
            items: [
                { id: 'item-005', description: 'Asbestos testing & assessment', quantity: 1, rate: 850, total: 850, phase: 'demo' },
                { id: 'item-006', description: 'Asbestos tile removal - 400sf', quantity: 400, rate: 8.50, total: 3400, phase: 'demo' },
                { id: 'item-007', description: 'Hazmat disposal & certification', quantity: 1, rate: 1200, total: 1200, phase: 'demo' },
                { id: 'item-008', description: 'Clearance testing', quantity: 1, rate: 450, total: 450, phase: 'demo' }
            ],
            subtotal: 5900,
            tax: 0,
            total: 5900,
            invoiceDate: '2024-12-11',
            dueDate: '2024-12-26',
            submittedDate: '2024-12-11',
            approvedDate: '2024-12-12',
            approvedBy: 'Derek Morrison',
            notes: 'Urgent - asbestos abatement for Oakridge'
        },
        {
            id: 'INV-003',
            invoiceNumber: 'PFP-2024-0156',
            subcontractorId: 2,
            subcontractorName: 'Premium Floor Prep LLC',
            projectId: 1,
            projectName: 'Downtown Lobby Renovation',
            status: 'pending-approval',
            items: [
                { id: 'item-009', description: 'Concrete grinding - lobby', quantity: 800, rate: 1.25, total: 1000, phase: 'prep' },
                { id: 'item-010', description: 'Self-leveling compound', quantity: 25, rate: 45, total: 1125, phase: 'prep' },
                { id: 'item-011', description: 'Application labor', quantity: 12, rate: 75, total: 900, phase: 'prep' }
            ],
            subtotal: 3025,
            tax: 0,
            total: 3025,
            invoiceDate: '2024-12-13',
            dueDate: '2024-12-28',
            submittedDate: '2024-12-13',
            notes: 'Additional leveling required per engineer specs'
        },
        {
            id: 'INV-004',
            invoiceNumber: 'CGT-2024-0022',
            subcontractorId: 4,
            subcontractorName: 'CG Tile Masters',
            projectId: 1,
            projectName: 'Downtown Lobby Renovation',
            status: 'draft',
            items: [
                { id: 'item-012', description: 'Tile installation assist - elevator area', quantity: 100, rate: 4.50, total: 450, phase: 'install' }
            ],
            subtotal: 450,
            tax: 0,
            total: 450,
            invoiceDate: '2024-12-14',
            dueDate: '2024-12-29',
            notes: 'Draft - waiting for work completion'
        }
    ],
    projectBudgets: [
        {
            projectId: 1,
            contractValue: 45200,
            approvedCOs: 2450,
            totalRevenue: 47650,
            estimatedCost: 28450,
            actualCost: 24890,
            projectedCost: 31200,
            currentMargin: 47.8,
            projectedMargin: 34.5,
            targetMargin: 37,
            phaseBudgets: [
                { phase: 'demo', estimatedLabor: 1500, estimatedMaterials: 0, estimatedSubcontractors: 4000, estimatedOther: 200, estimatedTotal: 5700, actualLabor: 0, actualMaterials: 0, actualSubcontractors: 3880, actualOther: 150, actualTotal: 4030, variance: -1670, variancePercent: -29.3, status: 'on-budget' },
                { phase: 'prep', estimatedLabor: 2400, estimatedMaterials: 1200, estimatedSubcontractors: 1500, estimatedOther: 100, estimatedTotal: 5200, actualLabor: 2100, actualMaterials: 1150, actualSubcontractors: 3025, actualOther: 80, actualTotal: 6355, variance: 1155, variancePercent: 22.2, status: 'over-budget' },
                { phase: 'install', estimatedLabor: 8000, estimatedMaterials: 9800, estimatedSubcontractors: 500, estimatedOther: 200, estimatedTotal: 18500, actualLabor: 4500, actualMaterials: 7500, actualSubcontractors: 0, actualOther: 120, actualTotal: 12120, variance: -6380, variancePercent: -34.5, status: 'on-budget' },
                { phase: 'punch', estimatedLabor: 800, estimatedMaterials: 200, estimatedSubcontractors: 0, estimatedOther: 50, estimatedTotal: 1050, actualLabor: 0, actualMaterials: 0, actualSubcontractors: 0, actualOther: 0, actualTotal: 0, variance: -1050, variancePercent: -100, status: 'on-budget' },
                { phase: 'closeout', estimatedLabor: 400, estimatedMaterials: 0, estimatedSubcontractors: 0, estimatedOther: 100, estimatedTotal: 500, actualLabor: 0, actualMaterials: 0, actualSubcontractors: 0, actualOther: 0, actualTotal: 0, variance: -500, variancePercent: -100, status: 'on-budget' }
            ],
            lineItems: [],
            lastUpdated: '2024-12-14'
        },
        {
            projectId: 2,
            contractValue: 28750,
            approvedCOs: 5200,
            totalRevenue: 33950,
            estimatedCost: 16400,
            actualCost: 7420,
            projectedCost: 23200,
            currentMargin: 78.1,
            projectedMargin: 31.7,
            targetMargin: 43,
            phaseBudgets: [
                { phase: 'demo', estimatedLabor: 1200, estimatedMaterials: 0, estimatedSubcontractors: 800, estimatedOther: 100, estimatedTotal: 2100, actualLabor: 494, actualMaterials: 0, actualSubcontractors: 5900, actualOther: 85, actualTotal: 6479, variance: 4379, variancePercent: 208.5, status: 'over-budget' },
                { phase: 'prep', estimatedLabor: 2000, estimatedMaterials: 800, estimatedSubcontractors: 0, estimatedOther: 100, estimatedTotal: 2900, actualLabor: 668, actualMaterials: 450, actualSubcontractors: 0, actualOther: 0, actualTotal: 1118, variance: -1782, variancePercent: -61.4, status: 'on-budget' },
                { phase: 'acclimation', estimatedLabor: 200, estimatedMaterials: 0, estimatedSubcontractors: 0, estimatedOther: 50, estimatedTotal: 250, actualLabor: 0, actualMaterials: 0, actualSubcontractors: 0, actualOther: 0, actualTotal: 0, variance: -250, variancePercent: -100, status: 'on-budget' },
                { phase: 'install', estimatedLabor: 5500, estimatedMaterials: 8500, estimatedSubcontractors: 0, estimatedOther: 150, estimatedTotal: 14150, actualLabor: 0, actualMaterials: 0, actualSubcontractors: 0, actualOther: 0, actualTotal: 0, variance: -14150, variancePercent: -100, status: 'on-budget' },
                { phase: 'punch', estimatedLabor: 500, estimatedMaterials: 100, estimatedSubcontractors: 0, estimatedOther: 50, estimatedTotal: 650, actualLabor: 0, actualMaterials: 0, actualSubcontractors: 0, actualOther: 0, actualTotal: 0, variance: -650, variancePercent: -100, status: 'on-budget' }
            ],
            lineItems: [],
            lastUpdated: '2024-12-14'
        }
    ],
    profitLeakAlerts: [
        {
            id: 'ALERT-001',
            projectId: 1,
            projectName: 'Downtown Lobby Renovation',
            type: 'sub-overrun',
            severity: 'warning',
            title: 'Subcontractor costs exceeding budget',
            description: 'Prep phase subcontractor costs are 102% over estimate due to additional leveling work.',
            impact: 1525,
            impactPercent: 22.2,
            phase: 'prep',
            recommendation: 'Review remaining subcontractor scope. Consider negotiating fixed-price for punch work.',
            createdAt: '2024-12-13T10:30:00'
        },
        {
            id: 'ALERT-002',
            projectId: 2,
            projectName: 'Oakridge Medical Remodel',
            type: 'labor-overrun',
            severity: 'critical',
            title: 'Asbestos abatement exceeds budget by 637%',
            description: 'Unexpected asbestos discovery required licensed abatement. Demo phase budget blown.',
            impact: 5100,
            impactPercent: 637.5,
            phase: 'demo',
            recommendation: 'Change order already approved for $5,200. Monitor to ensure no additional scope creep.',
            createdAt: '2024-12-10T14:15:00',
            acknowledgedAt: '2024-12-10T15:00:00',
            acknowledgedBy: 'Derek Morrison'
        },
        {
            id: 'ALERT-003',
            projectId: 2,
            projectName: 'Oakridge Medical Remodel',
            type: 'margin-erosion',
            severity: 'warning',
            title: 'Projected margin below target',
            description: 'Current projection shows 31.7% margin vs 43% target. $3,840 profit at risk.',
            impact: 3840,
            impactPercent: 11.3,
            recommendation: 'Optimize installation labor. Consider value engineering on trim materials.',
            createdAt: '2024-12-14T08:00:00'
        },
        {
            id: 'ALERT-004',
            projectId: 1,
            projectName: 'Downtown Lobby Renovation',
            type: 'change-order-pending',
            severity: 'info',
            title: 'Pending CO awaiting approval',
            description: 'CO-002 for premium tile upgrade ($3,800) awaiting client decision since Dec 11.',
            impact: 3800,
            impactPercent: 0,
            recommendation: 'Follow up with client. Decision needed before tile installation continues.',
            createdAt: '2024-12-14T09:00:00'
        }
    ],
    walkthroughSessions: [
        // Project 1 - Downtown Lobby
        {
            id: 'WS-001',
            projectId: 1,
            type: 'pre-install',
            status: 'completed',
            scheduledDate: '2024-11-14',
            scheduledTime: '9:00 AM',
            startedAt: '2024-11-14T09:05:00',
            completedAt: '2024-11-14T10:30:00',
            attendees: [
                { name: 'John Smith', role: 'client', email: 'john@downtown.com', phone: '555-0101' },
                { name: 'Derek Morrison', role: 'pm', email: 'derek@floorops.com' },
                { name: 'Mike Johnson', role: 'lead', phone: '555-0102' }
            ],
            punchItemsCreated: [],
            notes: 'Initial site walkthrough before demo. Documented existing conditions and confirmed scope with client.',
            overallRating: 5,
            clientFeedback: 'Great walkthrough! Clear communication about the project timeline.',
            areasReviewed: ['Main Lobby', 'Elevator Area', 'Hallway', 'Reception', 'Break Room'],
            createdBy: 'Derek Morrison',
            weather: '☀️',
            photos: ['Existing Conditions 1', 'Existing Conditions 2', 'Subfloor Condition']
        },
        {
            id: 'WS-002',
            projectId: 1,
            type: 'mid-project',
            status: 'completed',
            scheduledDate: '2024-12-12',
            scheduledTime: '2:00 PM',
            startedAt: '2024-12-12T14:05:00',
            completedAt: '2024-12-12T14:45:00',
            attendees: [
                { name: 'John Smith', role: 'client', email: 'john@downtown.com', phone: '555-0101' },
                { name: 'Derek Morrison', role: 'pm', email: 'derek@floorops.com' }
            ],
            punchItemsCreated: [1, 2],
            notes: 'Client very pleased with tile progress. Identified grout color issue near elevator and loose transition strip.',
            overallRating: 4,
            clientFeedback: 'Looking great! Just need those couple items fixed before final.',
            areasReviewed: ['Main Lobby', 'Elevator Area', 'Hallway'],
            createdBy: 'Derek Morrison',
            weather: '☀️',
            photos: ['Tile Progress', 'Grout Issue', 'Transition Strip']
        },
        {
            id: 'WS-003',
            projectId: 1,
            type: 'final',
            status: 'scheduled',
            scheduledDate: '2024-12-19',
            scheduledTime: '10:00 AM',
            attendees: [
                { name: 'John Smith', role: 'client', email: 'john@downtown.com', phone: '555-0101' },
                { name: 'Derek Morrison', role: 'pm' },
                { name: 'Sarah Wilson', role: 'architect' },
                { name: 'Building Manager', role: 'other' }
            ],
            punchItemsCreated: [],
            areasReviewed: [],
            createdBy: 'Derek Morrison',
            photos: []
        },
        // Project 2 - Oakridge Medical
        {
            id: 'WS-004',
            projectId: 2,
            type: 'pre-install',
            status: 'completed',
            scheduledDate: '2024-12-01',
            scheduledTime: '8:00 AM',
            startedAt: '2024-12-01T08:00:00',
            completedAt: '2024-12-01T09:15:00',
            attendees: [
                { name: 'Dr. Emily Chen', role: 'client', email: 'echen@oakridgemedical.com', phone: '555-0200' },
                { name: 'Derek Morrison', role: 'pm' },
                { name: 'Carlos Rodriguez', role: 'installer' }
            ],
            punchItemsCreated: [],
            notes: 'Pre-installation walkthrough for medical facility. Discussed noise restrictions and after-hours work requirements.',
            overallRating: 5,
            clientFeedback: 'Very professional. Appreciate the attention to our operational needs.',
            areasReviewed: ['Reception', 'Exam Room 1', 'Exam Room 2', 'Lab', 'Waiting Area'],
            createdBy: 'Derek Morrison',
            weather: '🌧️',
            photos: ['Medical Reception', 'Exam Rooms Overview']
        },
        {
            id: 'WS-005',
            projectId: 2,
            type: 'punch',
            status: 'scheduled',
            scheduledDate: '2024-12-20',
            scheduledTime: '6:00 PM',
            attendees: [
                { name: 'Dr. Emily Chen', role: 'client', email: 'echen@oakridgemedical.com' },
                { name: 'Derek Morrison', role: 'pm' },
                { name: 'Mike Johnson', role: 'lead' }
            ],
            punchItemsCreated: [],
            areasReviewed: [],
            createdBy: 'Derek Morrison',
            notes: 'After-hours punch walk to minimize disruption to medical practice.',
            photos: []
        },
        // Project 3 - Riverside Estates
        {
            id: 'WS-006',
            projectId: 3,
            type: 'mid-project',
            status: 'completed',
            scheduledDate: '2024-12-10',
            scheduledTime: '11:00 AM',
            startedAt: '2024-12-10T11:00:00',
            completedAt: '2024-12-10T12:30:00',
            attendees: [
                { name: 'Michael Rivers', role: 'client', email: 'mrivers@riverside.com', phone: '555-0300' },
                { name: 'Lisa Rivers', role: 'client' },
                { name: 'Derek Morrison', role: 'pm' },
                { name: 'Interior Designer', role: 'architect' }
            ],
            punchItemsCreated: [5, 6],
            notes: 'Homeowners walkthrough of hardwood installation. Minor concerns about color variation - explained natural wood characteristics.',
            overallRating: 3,
            clientFeedback: 'Some concerns about wood grain variation. Need reassurance this is normal.',
            areasReviewed: ['Living Room', 'Dining Room', 'Master Bedroom', 'Kitchen'],
            createdBy: 'Derek Morrison',
            weather: '⛅',
            photos: ['Hardwood Installation', 'Grain Variation Sample']
        },
        // Project 4 - Harbor View
        {
            id: 'WS-007',
            projectId: 4,
            type: 'pre-install',
            status: 'completed',
            scheduledDate: '2024-12-08',
            scheduledTime: '3:00 PM',
            startedAt: '2024-12-08T15:00:00',
            completedAt: '2024-12-08T16:00:00',
            attendees: [
                { name: 'Property Manager', role: 'gc', email: 'pm@harborview.com' },
                { name: 'Derek Morrison', role: 'pm' }
            ],
            punchItemsCreated: [],
            notes: 'COA meeting and pre-install coordination. Discussed elevator access and material staging.',
            overallRating: 4,
            clientFeedback: 'Well organized. Please ensure minimal hallway disruption.',
            areasReviewed: ['Unit 1201', 'Common Hallway', 'Elevator Lobby'],
            createdBy: 'Derek Morrison',
            weather: '☀️',
            photos: ['Unit Entry', 'Common Areas']
        },
        {
            id: 'WS-008',
            projectId: 4,
            type: 'mid-project',
            status: 'in-progress',
            scheduledDate: '2024-12-15',
            scheduledTime: '2:00 PM',
            startedAt: '2024-12-15T14:05:00',
            attendees: [
                { name: 'Property Manager', role: 'gc' },
                { name: 'Unit Owner', role: 'client', phone: '555-0400' },
                { name: 'Derek Morrison', role: 'pm' }
            ],
            punchItemsCreated: [7],
            areasReviewed: ['Unit 1201'],
            createdBy: 'Derek Morrison',
            notes: 'In progress - reviewing LVP installation in condo unit.',
            photos: []
        }
    ],
    completionCertificates: [
        {
            id: 'CERT-001',
            projectId: 3,
            projectName: 'Riverside Estates - Rivers Residence',
            clientName: 'Michael & Lisa Rivers',
            clientAddress: '789 Riverside Drive',
            contractValue: 28500,
            changeOrdersTotal: 1200,
            finalValue: 29700,
            completionDate: '2024-12-14',
            generatedDate: '2024-12-14',
            allPunchItemsClosed: true,
            finalWalkthroughComplete: true,
            qaChecklistsComplete: true,
            photosDocumented: true,
            outstandingItems: [],
            warrantyStartDate: '2024-12-14',
            warrantyEndDate: '2025-12-14',
            warrantyTerms: '1 year parts and labor warranty on all installed hardwood flooring. Excludes damage from moisture, pets, or improper maintenance.',
            notes: 'Beautiful installation. Client very satisfied with final result after initial concerns addressed.',
            status: 'pending-signature',
            clientSignature: {
                signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                signedBy: 'Michael Rivers',
                signedAt: '2024-12-14T16:30:00',
                title: 'Homeowner'
            }
        }
    ],
    teamMembers: [
        { id: 1, name: 'Derek Morrison', role: 'pm', phone: '555-0100', email: 'derek@floorops.com' },
        { id: 2, name: 'Mike Johnson', role: 'lead', phone: '555-0102', email: 'mike@floorops.com' },
        { id: 3, name: 'Carlos Rodriguez', role: 'installer', phone: '555-0103', email: 'carlos@floorops.com' },
        { id: 4, name: 'James Taylor', role: 'installer', phone: '555-0104', email: 'james@floorops.com' },
        { id: 5, name: 'Kevin Brown', role: 'helper', phone: '555-0105' },
        { id: 6, name: 'Ryan Chen', role: 'apprentice', phone: '555-0106' },
        { id: 7, name: 'Sarah Martinez', role: 'installer', phone: '555-0107', email: 'sarah@floorops.com' },
        { id: 8, name: 'David Kim', role: 'lead', phone: '555-0108', email: 'david@floorops.com' },
        { id: 9, name: 'Tony Nguyen', role: 'helper', phone: '555-0109' },
        { id: 10, name: 'Marcus Williams', role: 'apprentice', phone: '555-0110' }
    ],
    clientInvoices: [
        // Downtown Lobby Renovation - Commercial project with retainage
        {
            id: 'CINV-001',
            invoiceNumber: 'INV-2024-0001',
            projectId: 1,
            projectName: 'Downtown Lobby Renovation',
            type: 'deposit',
            status: 'paid',
            clientName: 'Downtown Properties LLC',
            clientAddress: '123 Main Street',
            clientEmail: 'ap@downtownproperties.com',
            clientPhone: '555-0101',
            lineItems: [
                { id: 'li-001', description: 'Project Deposit - 30% of Contract Value', quantity: 1, rate: 13560, total: 13560 }
            ],
            subtotal: 13560,
            taxRate: 0,
            tax: 0,
            retainagePercent: 0,
            retainageAmount: 0,
            retainageReleased: false,
            total: 13560,
            amountPaid: 13560,
            balance: 0,
            invoiceDate: '2024-11-12',
            dueDate: '2024-11-19',
            sentDate: '2024-11-12',
            viewedDate: '2024-11-12',
            paidDate: '2024-11-14',
            payments: [
                { id: 'pmt-001', date: '2024-11-14', amount: 13560, method: 'check', reference: 'CHK #4521', notes: 'Deposit received', recordedBy: 'Derek Morrison', recordedAt: '2024-11-14T10:30:00' }
            ],
            notes: 'Deposit invoice for Downtown Lobby Renovation project',
            terms: 'Due upon receipt',
            createdBy: 'Derek Morrison',
            createdAt: '2024-11-12T09:00:00'
        },
        {
            id: 'CINV-002',
            invoiceNumber: 'INV-2024-0002',
            projectId: 1,
            projectName: 'Downtown Lobby Renovation',
            type: 'progress',
            status: 'paid',
            clientName: 'Downtown Properties LLC',
            clientAddress: '123 Main Street',
            clientEmail: 'ap@downtownproperties.com',
            lineItems: [
                { id: 'li-002', description: 'Demo Complete - Phase 1', quantity: 1, rate: 4520, total: 4520, phase: 'demo' },
                { id: 'li-003', description: 'Subfloor Prep Complete - Phase 2', quantity: 1, rate: 6780, total: 6780, phase: 'prep' },
                { id: 'li-004', description: 'Material procurement', quantity: 1, rate: 8500, total: 8500 }
            ],
            subtotal: 19800,
            taxRate: 0,
            tax: 0,
            retainagePercent: 10,
            retainageAmount: 1980,
            retainageReleased: false,
            total: 17820,
            amountPaid: 17820,
            balance: 0,
            invoiceDate: '2024-12-01',
            dueDate: '2024-12-15',
            sentDate: '2024-12-01',
            viewedDate: '2024-12-02',
            paidDate: '2024-12-08',
            payments: [
                { id: 'pmt-002', date: '2024-12-08', amount: 17820, method: 'ach', reference: 'ACH-78542', notes: 'Progress payment 1', recordedBy: 'Derek Morrison', recordedAt: '2024-12-08T14:15:00' }
            ],
            notes: 'Progress billing #1 - Demo and prep phases complete',
            terms: 'Net 15',
            createdBy: 'Derek Morrison',
            createdAt: '2024-12-01T08:00:00'
        },
        {
            id: 'CINV-003',
            invoiceNumber: 'INV-2024-0003',
            projectId: 1,
            projectName: 'Downtown Lobby Renovation',
            type: 'progress',
            status: 'sent',
            clientName: 'Downtown Properties LLC',
            clientAddress: '123 Main Street',
            clientEmail: 'ap@downtownproperties.com',
            lineItems: [
                { id: 'li-005', description: 'Tile Installation - 65% Complete', quantity: 1, rate: 9040, total: 9040, phase: 'install' },
                { id: 'li-006', description: 'Approved CO #1 - Waterproof membrane', quantity: 1, rate: 2450, total: 2450 }
            ],
            subtotal: 11490,
            taxRate: 0,
            tax: 0,
            retainagePercent: 10,
            retainageAmount: 1149,
            retainageReleased: false,
            total: 10341,
            amountPaid: 0,
            balance: 10341,
            invoiceDate: '2024-12-13',
            dueDate: '2024-12-28',
            sentDate: '2024-12-13',
            viewedDate: '2024-12-14',
            payments: [],
            relatedCOIds: ['CO-001'],
            notes: 'Progress billing #2 - Tile installation ongoing, includes approved change order',
            terms: 'Net 15',
            createdBy: 'Derek Morrison',
            createdAt: '2024-12-13T10:00:00'
        },
        // Riverside Estates - Residential (no retainage)
        {
            id: 'CINV-004',
            invoiceNumber: 'INV-2024-0004',
            projectId: 3,
            projectName: 'Riverside Estates - Rivers Residence',
            type: 'deposit',
            status: 'paid',
            clientName: 'Michael & Lisa Rivers',
            clientAddress: '789 Riverside Drive',
            clientEmail: 'mrivers@riverside.com',
            clientPhone: '555-0300',
            lineItems: [
                { id: 'li-007', description: 'Project Deposit - 50% of Contract Value', quantity: 1, rate: 14250, total: 14250 }
            ],
            subtotal: 14250,
            taxRate: 0,
            tax: 0,
            retainagePercent: 0,
            retainageAmount: 0,
            retainageReleased: false,
            total: 14250,
            amountPaid: 14250,
            balance: 0,
            invoiceDate: '2024-11-20',
            dueDate: '2024-11-27',
            sentDate: '2024-11-20',
            paidDate: '2024-11-22',
            payments: [
                { id: 'pmt-003', date: '2024-11-22', amount: 14250, method: 'check', reference: 'Personal Check #1089', recordedBy: 'Derek Morrison', recordedAt: '2024-11-22T11:00:00' }
            ],
            notes: 'Residential deposit - 50% upfront',
            terms: 'Due upon receipt',
            createdBy: 'Derek Morrison',
            createdAt: '2024-11-20T09:30:00'
        },
        {
            id: 'CINV-005',
            invoiceNumber: 'INV-2024-0005',
            projectId: 3,
            projectName: 'Riverside Estates - Rivers Residence',
            type: 'final',
            status: 'partial',
            clientName: 'Michael & Lisa Rivers',
            clientAddress: '789 Riverside Drive',
            clientEmail: 'mrivers@riverside.com',
            lineItems: [
                { id: 'li-008', description: 'Final Payment - Remaining Balance', quantity: 1, rate: 14250, total: 14250 },
                { id: 'li-009', description: 'Change Order - Extended hallway installation', quantity: 1, rate: 1200, total: 1200 }
            ],
            subtotal: 15450,
            taxRate: 0,
            tax: 0,
            retainagePercent: 0,
            retainageAmount: 0,
            retainageReleased: false,
            total: 15450,
            amountPaid: 10000,
            balance: 5450,
            invoiceDate: '2024-12-14',
            dueDate: '2024-12-21',
            sentDate: '2024-12-14',
            viewedDate: '2024-12-14',
            payments: [
                { id: 'pmt-004', date: '2024-12-15', amount: 10000, method: 'credit-card', reference: 'CC-ending-4521', notes: 'Partial payment received', recordedBy: 'Derek Morrison', recordedAt: '2024-12-15T09:00:00' }
            ],
            notes: 'Final invoice - awaiting remaining balance',
            terms: 'Due upon completion',
            createdBy: 'Derek Morrison',
            createdAt: '2024-12-14T16:00:00'
        },
        // Oakridge Medical - Commercial with retainage
        {
            id: 'CINV-006',
            invoiceNumber: 'INV-2024-0006',
            projectId: 2,
            projectName: 'Oakridge Medical Remodel',
            type: 'deposit',
            status: 'paid',
            clientName: 'Oakridge Medical Partners',
            clientAddress: '456 Healthcare Blvd',
            clientEmail: 'billing@oakridgemedical.com',
            lineItems: [
                { id: 'li-010', description: 'Project Deposit - 25% of Contract Value', quantity: 1, rate: 9500, total: 9500 }
            ],
            subtotal: 9500,
            taxRate: 0,
            tax: 0,
            retainagePercent: 0,
            retainageAmount: 0,
            retainageReleased: false,
            total: 9500,
            amountPaid: 9500,
            balance: 0,
            invoiceDate: '2024-11-28',
            dueDate: '2024-12-05',
            sentDate: '2024-11-28',
            paidDate: '2024-12-02',
            payments: [
                { id: 'pmt-005', date: '2024-12-02', amount: 9500, method: 'ach', reference: 'ACH-MED-9821', recordedBy: 'Derek Morrison', recordedAt: '2024-12-02T10:30:00' }
            ],
            notes: 'Medical facility deposit',
            terms: 'Due upon receipt',
            createdBy: 'Derek Morrison',
            createdAt: '2024-11-28T08:00:00'
        },
        {
            id: 'CINV-007',
            invoiceNumber: 'INV-2024-0007',
            projectId: 2,
            projectName: 'Oakridge Medical Remodel',
            type: 'change-order',
            status: 'draft',
            clientName: 'Oakridge Medical Partners',
            clientAddress: '456 Healthcare Blvd',
            clientEmail: 'billing@oakridgemedical.com',
            lineItems: [
                { id: 'li-011', description: 'CO #1 - Asbestos tile removal and abatement', quantity: 1, rate: 5200, total: 5200 }
            ],
            subtotal: 5200,
            taxRate: 0,
            tax: 0,
            retainagePercent: 10,
            retainageAmount: 520,
            retainageReleased: false,
            total: 4680,
            amountPaid: 0,
            balance: 4680,
            invoiceDate: '2024-12-15',
            dueDate: '2024-12-30',
            payments: [],
            relatedCOIds: ['CO-004'],
            notes: 'Draft invoice for approved asbestos abatement change order',
            terms: 'Net 15',
            createdBy: 'Derek Morrison',
            createdAt: '2024-12-15T08:00:00'
        }
    ]
};
