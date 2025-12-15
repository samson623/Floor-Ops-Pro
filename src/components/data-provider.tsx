'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { Database, Project, Estimate, PunchItem, ChangeOrder, DailyLog, PhotoCapture, QAChecklist, PurchaseOrder, Delivery, MaterialLot, AcclimationEntry, AcclimationReading, DeliveryPhoto, LotWarning, LaborEntry, Subcontractor, SubcontractorInvoice, ProjectBudget, ProfitLeakAlert, JobPhase, WorkerRole, WalkthroughSession, CompletionCertificate, TeamMember, SignatureData, ClientInvoice, PaymentRecord, ProjectInvoiceSummary, ClientInvoiceType } from '@/lib/data';
import { useLocalStorage } from '@/lib/storage';

interface DataContextType {
    data: Database;
    isLoaded: boolean;

    // Project operations  
    getProject: (id: number) => Project | undefined;
    updateProject: (id: number, updates: Partial<Project>) => void;

    // Punch list operations
    togglePunchItem: (projectId: number, itemId: number) => void;
    addPunchItem: (projectId: number, item: Omit<PunchItem, 'id'>) => void;
    updatePunchItem: (projectId: number, itemId: number, updates: Partial<PunchItem>) => void;

    // Change order operations
    addChangeOrder: (projectId: number, co: Omit<ChangeOrder, 'id'>) => void;
    updateChangeOrder: (projectId: number, coId: string, updates: Partial<ChangeOrder>) => void;

    // Daily log operations
    addDailyLog: (projectId: number, log: Omit<DailyLog, 'id'>) => void;

    // Estimate operations
    getEstimate: (id: number) => Estimate | undefined;
    updateEstimate: (id: number, updates: Partial<Estimate>) => void;
    convertEstimateToProject: (estimateId: number) => void;

    // Computed values
    getActiveProjects: () => Project[];
    getTotalPipeline: () => number;
    getOpenPunchCount: () => number;
    getUnreadMessageCount: () => number;

    // Purchase Order operations
    createPO: (po: Omit<PurchaseOrder, 'id'>) => string;
    updatePO: (id: string, updates: Partial<PurchaseOrder>) => void;
    getPOsByVendor: (vendorId: number) => PurchaseOrder[];
    getPOsByProject: (projectId: number) => PurchaseOrder[];

    // Delivery operations
    createDelivery: (delivery: Omit<Delivery, 'id'>) => string;
    updateDelivery: (id: string, updates: Partial<Delivery>) => void;
    checkInDelivery: (id: string, lineItems: Delivery['lineItems'], photos: DeliveryPhoto[], notes?: string, issues?: string) => void;

    // Lot tracking operations
    createLot: (lot: Omit<MaterialLot, 'id'>) => string;
    updateLot: (id: string, updates: Partial<MaterialLot>) => void;
    getLotWarnings: (projectId?: number) => LotWarning[];

    // Acclimation operations
    startAcclimation: (entry: Omit<AcclimationEntry, 'id'>) => string;
    updateAcclimation: (id: string, updates: Partial<AcclimationEntry>) => void;
    addAcclimationReading: (entryId: string, reading: Omit<AcclimationReading, 'id'>) => void;
    getActiveAcclimation: () => AcclimationEntry[];

    // Budgeting & Job Costing operations
    addLaborEntry: (entry: Omit<LaborEntry, 'id'>) => string;
    updateLaborEntry: (id: string, updates: Partial<LaborEntry>) => void;
    getLaborByProject: (projectId: number) => LaborEntry[];
    getLaborSummary: (projectId: number) => { totalHours: number; totalCost: number; byPhase: Record<JobPhase, { hours: number; cost: number }> };

    // Subcontractor operations
    addSubcontractorInvoice: (invoice: Omit<SubcontractorInvoice, 'id'>) => string;
    updateSubcontractorInvoice: (id: string, updates: Partial<SubcontractorInvoice>) => void;
    approveInvoice: (id: string, approvedBy: string) => void;
    getInvoicesByProject: (projectId: number) => SubcontractorInvoice[];
    getPendingInvoices: () => SubcontractorInvoice[];

    // Budget & Margin operations
    getProjectBudget: (projectId: number) => ProjectBudget | undefined;
    updateProjectBudget: (projectId: number, updates: Partial<ProjectBudget>) => void;
    getProfitLeakAlerts: (projectId?: number) => ProfitLeakAlert[];
    acknowledgeAlert: (alertId: string, acknowledgedBy: string) => void;
    resolveAlert: (alertId: string) => void;

    // Walkthrough & Sign-Off operations
    createWalkthroughSession: (session: Omit<WalkthroughSession, 'id'>) => string;
    updateWalkthroughSession: (id: string, updates: Partial<WalkthroughSession>) => void;
    startWalkthrough: (id: string) => void;
    completeWalkthrough: (id: string, rating?: number, feedback?: string) => void;
    getWalkthroughsByProject: (projectId: number) => WalkthroughSession[];

    // Completion Certificate operations
    createCompletionCertificate: (cert: Omit<CompletionCertificate, 'id'>) => string;
    updateCompletionCertificate: (id: string, updates: Partial<CompletionCertificate>) => void;
    addSignature: (certId: string, type: 'client' | 'contractor', signature: SignatureData) => void;
    getCertificateByProject: (projectId: number) => CompletionCertificate | undefined;

    // Team members
    getTeamMembers: () => TeamMember[];

    // Client Invoicing & Payments operations
    getClientInvoices: () => ClientInvoice[];
    getClientInvoicesByProject: (projectId: number) => ClientInvoice[];
    getClientInvoice: (invoiceId: string) => ClientInvoice | undefined;
    createClientInvoice: (invoice: Omit<ClientInvoice, 'id'>) => string;
    updateClientInvoice: (invoiceId: string, updates: Partial<ClientInvoice>) => void;
    deleteClientInvoice: (invoiceId: string) => void;
    sendClientInvoice: (invoiceId: string) => void;
    recordPayment: (invoiceId: string, payment: Omit<PaymentRecord, 'id'>) => void;
    voidClientInvoice: (invoiceId: string, reason?: string) => void;
    getProjectInvoiceSummary: (projectId: number) => ProjectInvoiceSummary;
    generateInvoiceNumber: () => string;
    getOutstandingInvoices: () => ClientInvoice[];
    getOverdueInvoices: () => ClientInvoice[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const [data, saveData, isLoaded] = useLocalStorage();

    const getProject = useCallback((id: number) => {
        return data.projects.find(p => p.id === id);
    }, [data.projects]);

    const updateProject = useCallback((id: number, updates: Partial<Project>) => {
        const newProjects = data.projects.map(p =>
            p.id === id ? { ...p, ...updates } : p
        );
        saveData({ ...data, projects: newProjects });
    }, [data, saveData]);

    const togglePunchItem = useCallback((projectId: number, itemId: number) => {
        const newProjects = data.projects.map(p => {
            if (p.id === projectId) {
                const newPunchList = p.punchList.map(item =>
                    item.id === itemId ? { ...item, completed: !item.completed } : item
                );
                return { ...p, punchList: newPunchList };
            }
            return p;
        });
        saveData({ ...data, projects: newProjects });
    }, [data, saveData]);

    const addPunchItem = useCallback((projectId: number, item: Omit<PunchItem, 'id'>) => {
        const project = data.projects.find(p => p.id === projectId);
        if (!project) return;

        const newId = Math.max(0, ...project.punchList.map(i => i.id)) + 1;
        const newItem: PunchItem = { ...item, id: newId };

        const newProjects = data.projects.map(p => {
            if (p.id === projectId) {
                return { ...p, punchList: [...p.punchList, newItem] };
            }
            return p;
        });
        saveData({ ...data, projects: newProjects });
        return newId;
    }, [data, saveData]);

    const updatePunchItem = useCallback((projectId: number, itemId: number, updates: Partial<PunchItem>) => {
        const newProjects = data.projects.map(p => {
            if (p.id === projectId) {
                const newPunchList = p.punchList.map(item =>
                    item.id === itemId ? { ...item, ...updates } : item
                );
                return { ...p, punchList: newPunchList };
            }
            return p;
        });
        saveData({ ...data, projects: newProjects });
    }, [data, saveData]);

    const addChangeOrder = useCallback((projectId: number, co: Omit<ChangeOrder, 'id'>) => {
        const project = data.projects.find(p => p.id === projectId);
        if (!project) return;

        const coNumber = project.changeOrders.length + 1;
        const newCO: ChangeOrder = {
            ...co,
            id: `CO-${String(coNumber).padStart(3, '0')}`
        };

        const newProjects = data.projects.map(p => {
            if (p.id === projectId) {
                return { ...p, changeOrders: [...p.changeOrders, newCO] };
            }
            return p;
        });
        saveData({ ...data, projects: newProjects });
    }, [data, saveData]);

    const updateChangeOrder = useCallback((projectId: number, coId: string, updates: Partial<ChangeOrder>) => {
        const newProjects = data.projects.map(p => {
            if (p.id === projectId) {
                const newCOs = p.changeOrders.map(co =>
                    co.id === coId ? { ...co, ...updates } : co
                );
                return { ...p, changeOrders: newCOs };
            }
            return p;
        });
        saveData({ ...data, projects: newProjects });
    }, [data, saveData]);

    const addDailyLog = useCallback((projectId: number, log: Omit<DailyLog, 'id'>) => {
        const project = data.projects.find(p => p.id === projectId);
        if (!project) return;

        const newId = Math.max(0, ...project.dailyLogs.map(l => l.id)) + 1;
        const newLog: DailyLog = { ...log, id: newId };

        const newProjects = data.projects.map(p => {
            if (p.id === projectId) {
                return { ...p, dailyLogs: [newLog, ...p.dailyLogs] };
            }
            return p;
        });
        saveData({ ...data, projects: newProjects });
    }, [data, saveData]);

    const getEstimate = useCallback((id: number) => {
        return data.estimates.find(e => e.id === id);
    }, [data.estimates]);

    const updateEstimate = useCallback((id: number, updates: Partial<Estimate>) => {
        const newEstimates = data.estimates.map(e =>
            e.id === id ? { ...e, ...updates } : e
        );
        saveData({ ...data, estimates: newEstimates });
    }, [data, saveData]);

    const convertEstimateToProject = useCallback((estimateId: number) => {
        const estimate = data.estimates.find(e => e.id === estimateId);
        if (!estimate) return;

        const newProjectId = Math.max(0, ...data.projects.map(p => p.id)) + 1;
        const newProject: Project = {
            id: newProjectId,
            key: estimate.client.toLowerCase().replace(/\s+/g, '-'),
            name: estimate.client,
            client: estimate.client,
            address: estimate.address,
            sqft: estimate.rooms.reduce((sum, r) => sum + r.sqft, 0),
            type: estimate.rooms[0]?.material || 'Flooring',
            value: estimate.totals.total,
            progress: 0,
            status: 'scheduled',
            startDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            crew: 'TBD',
            milestones: [
                { id: 1, title: 'Contract Signed', date: 'Today', status: 'completed' },
                { id: 2, title: 'Material Order', date: 'TBD', status: 'upcoming' },
                { id: 3, title: 'Project Start', date: 'TBD', status: 'upcoming' }
            ],
            punchList: [],
            dailyLogs: [],
            schedule: [],
            photos: [],
            photoCaptures: [],
            materials: estimate.materials.map(m => ({
                name: m.name,
                qty: m.sqft || m.qty || 0,
                unit: m.sqft ? 'sf' : 'units',
                status: 'ordered' as const
            })),
            changeOrders: [],
            qaChecklists: [],
            financials: {
                contract: estimate.totals.total,
                costs: 0,
                margin: estimate.totals.margin
            }
        };

        saveData({
            ...data,
            projects: [...data.projects, newProject],
            estimates: data.estimates.map(e =>
                e.id === estimateId ? { ...e, status: 'approved' as const } : e
            )
        });
    }, [data, saveData]);

    const getActiveProjects = useCallback(() => {
        return data.projects.filter(p => p.status === 'active');
    }, [data.projects]);

    const getTotalPipeline = useCallback(() => {
        return data.projects.reduce((sum, p) => sum + p.value, 0);
    }, [data.projects]);

    const getOpenPunchCount = useCallback(() => {
        return data.projects.reduce((sum, p) =>
            sum + p.punchList.filter(i => !i.completed).length, 0
        );
    }, [data.projects]);

    const getUnreadMessageCount = useCallback(() => {
        return data.messages.filter(m => m.unread).length;
    }, [data.messages]);

    // ═══════════════════════════════════════════════════════════════════════
    // PURCHASE ORDER OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    const createPO = useCallback((po: Omit<PurchaseOrder, 'id'>) => {
        const newId = `PO-${String((data.purchaseOrders?.length || 0) + 1).padStart(3, '0')}`;
        const newPO: PurchaseOrder = { ...po, id: newId };
        saveData({ ...data, purchaseOrders: [...(data.purchaseOrders || []), newPO] });
        return newId;
    }, [data, saveData]);

    const updatePO = useCallback((id: string, updates: Partial<PurchaseOrder>) => {
        const newPOs = (data.purchaseOrders || []).map(po =>
            po.id === id ? { ...po, ...updates } : po
        );
        saveData({ ...data, purchaseOrders: newPOs });
    }, [data, saveData]);

    const getPOsByVendor = useCallback((vendorId: number) => {
        return (data.purchaseOrders || []).filter(po => po.vendorId === vendorId);
    }, [data.purchaseOrders]);

    const getPOsByProject = useCallback((projectId: number) => {
        return (data.purchaseOrders || []).filter(po => po.projectId === projectId);
    }, [data.purchaseOrders]);

    // ═══════════════════════════════════════════════════════════════════════
    // DELIVERY OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    const createDelivery = useCallback((delivery: Omit<Delivery, 'id'>) => {
        const newId = `DEL-${String((data.deliveries?.length || 0) + 1).padStart(3, '0')}`;
        const newDelivery: Delivery = { ...delivery, id: newId };
        saveData({ ...data, deliveries: [...(data.deliveries || []), newDelivery] });
        return newId;
    }, [data, saveData]);

    const updateDelivery = useCallback((id: string, updates: Partial<Delivery>) => {
        const newDeliveries = (data.deliveries || []).map(d =>
            d.id === id ? { ...d, ...updates } : d
        );
        saveData({ ...data, deliveries: newDeliveries });
    }, [data, saveData]);

    const checkInDelivery = useCallback((id: string, lineItems: Delivery['lineItems'], photos: DeliveryPhoto[], notes?: string, issues?: string) => {
        const now = new Date().toISOString();
        const hasIssues = lineItems.some(li => li.damagedQty > 0 || li.receivedQty < li.orderedQty) || !!issues;

        const newDeliveries = (data.deliveries || []).map(d => {
            if (d.id === id) {
                return {
                    ...d,
                    status: hasIssues ? 'issues' as const : 'checked-in' as const,
                    actualArrival: d.actualArrival || now,
                    checkedInAt: now,
                    checkedInBy: 'Derek Morrison', // TODO: Get from auth
                    lineItems,
                    photos: [...(d.photos || []), ...photos],
                    notes,
                    issues
                };
            }
            return d;
        });

        // Also update the PO status
        const delivery = (data.deliveries || []).find(d => d.id === id);
        let newPOs = data.purchaseOrders || [];
        if (delivery) {
            const allReceived = lineItems.every(li => li.receivedQty >= li.orderedQty);
            const anyReceived = lineItems.some(li => li.receivedQty > 0);
            newPOs = newPOs.map(po => {
                if (po.id === delivery.poId) {
                    return {
                        ...po,
                        status: allReceived ? 'received' as const : anyReceived ? 'partial' as const : po.status,
                        lineItems: po.lineItems.map(li => {
                            const deliveryLi = lineItems.find(dli => dli.poLineItemId === li.id);
                            if (deliveryLi) {
                                return { ...li, receivedQty: deliveryLi.receivedQty, damagedQty: deliveryLi.damagedQty, lotNumber: deliveryLi.lotNumber };
                            }
                            return li;
                        })
                    };
                }
                return po;
            });
        }

        saveData({ ...data, deliveries: newDeliveries, purchaseOrders: newPOs });
    }, [data, saveData]);

    // ═══════════════════════════════════════════════════════════════════════
    // LOT TRACKING OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    const createLot = useCallback((lot: Omit<MaterialLot, 'id'>) => {
        const newId = `LOT-${String((data.materialLots?.length || 0) + 1).padStart(3, '0')}`;
        const newLot: MaterialLot = { ...lot, id: newId };
        saveData({ ...data, materialLots: [...(data.materialLots || []), newLot] });
        return newId;
    }, [data, saveData]);

    const updateLot = useCallback((id: string, updates: Partial<MaterialLot>) => {
        const newLots = (data.materialLots || []).map(l =>
            l.id === id ? { ...l, ...updates } : l
        );
        saveData({ ...data, materialLots: newLots });
    }, [data, saveData]);

    const getLotWarnings = useCallback((projectId?: number) => {
        const lots = data.materialLots || [];
        const relevantLots = projectId ? lots.filter(l => l.projectId === projectId) : lots;

        // Group by project and material
        const grouped: Record<string, MaterialLot[]> = {};
        relevantLots.forEach(lot => {
            if (lot.projectId) {
                const key = `${lot.projectId}-${lot.materialName}`;
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(lot);
            }
        });

        // Find materials with multiple lots
        const warnings: LotWarning[] = [];
        Object.entries(grouped).forEach(([key, lotsForMaterial]) => {
            if (lotsForMaterial.length > 1) {
                const uniqueLots = [...new Set(lotsForMaterial.map(l => l.lotNumber))];
                if (uniqueLots.length > 1) {
                    const project = data.projects.find(p => p.id === lotsForMaterial[0].projectId);
                    warnings.push({
                        projectId: lotsForMaterial[0].projectId!,
                        projectName: project?.name || lotsForMaterial[0].projectName || 'Unknown',
                        materialName: lotsForMaterial[0].materialName,
                        lots: lotsForMaterial.map(l => ({ lotNumber: l.lotNumber, quantity: l.quantity })),
                        severity: uniqueLots.length > 2 ? 'critical' : 'warning',
                        message: `⚠️ Multiple lots detected: ${uniqueLots.join(', ')}`
                    });
                }
            }
        });

        return warnings;
    }, [data.materialLots, data.projects]);

    // ═══════════════════════════════════════════════════════════════════════
    // ACCLIMATION OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    const startAcclimation = useCallback((entry: Omit<AcclimationEntry, 'id'>) => {
        const newId = `ACC-${String((data.acclimationEntries?.length || 0) + 1).padStart(3, '0')}`;
        const newEntry: AcclimationEntry = { ...entry, id: newId };
        saveData({ ...data, acclimationEntries: [...(data.acclimationEntries || []), newEntry] });
        return newId;
    }, [data, saveData]);

    const updateAcclimation = useCallback((id: string, updates: Partial<AcclimationEntry>) => {
        const newEntries = (data.acclimationEntries || []).map(e =>
            e.id === id ? { ...e, ...updates } : e
        );
        saveData({ ...data, acclimationEntries: newEntries });
    }, [data, saveData]);

    const addAcclimationReading = useCallback((entryId: string, reading: Omit<AcclimationReading, 'id'>) => {
        const newReadingId = `rd-${Date.now()}`;
        const newReading: AcclimationReading = { ...reading, id: newReadingId };

        const newEntries = (data.acclimationEntries || []).map(e => {
            if (e.id === entryId) {
                return { ...e, readings: [...e.readings, newReading] };
            }
            return e;
        });
        saveData({ ...data, acclimationEntries: newEntries });
    }, [data, saveData]);

    const getActiveAcclimation = useCallback(() => {
        return (data.acclimationEntries || []).filter(e => e.status === 'in-progress' || e.status === 'not-started');
    }, [data.acclimationEntries]);

    // ═══════════════════════════════════════════════════════════════════════
    // BUDGETING & JOB COSTING OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    const addLaborEntry = useCallback((entry: Omit<LaborEntry, 'id'>) => {
        const newId = `LE-${String((data.laborEntries?.length || 0) + 1).padStart(3, '0')}`;
        const newEntry: LaborEntry = { ...entry, id: newId };
        saveData({ ...data, laborEntries: [...(data.laborEntries || []), newEntry] });
        return newId;
    }, [data, saveData]);

    const updateLaborEntry = useCallback((id: string, updates: Partial<LaborEntry>) => {
        const newEntries = (data.laborEntries || []).map(e =>
            e.id === id ? { ...e, ...updates } : e
        );
        saveData({ ...data, laborEntries: newEntries });
    }, [data, saveData]);

    const getLaborByProject = useCallback((projectId: number) => {
        return (data.laborEntries || []).filter(e => e.projectId === projectId);
    }, [data.laborEntries]);

    const getLaborSummary = useCallback((projectId: number) => {
        const entries = (data.laborEntries || []).filter(e => e.projectId === projectId);
        const totalHours = entries.reduce((sum, e) => sum + e.regularHours + e.overtimeHours, 0);
        const totalCost = entries.reduce((sum, e) => sum + e.totalCost, 0);

        const byPhase: Record<JobPhase, { hours: number; cost: number }> = {} as Record<JobPhase, { hours: number; cost: number }>;
        entries.forEach(e => {
            if (!byPhase[e.phase]) byPhase[e.phase] = { hours: 0, cost: 0 };
            byPhase[e.phase].hours += e.regularHours + e.overtimeHours;
            byPhase[e.phase].cost += e.totalCost;
        });

        return { totalHours, totalCost, byPhase };
    }, [data.laborEntries]);

    // Subcontractor Invoice Operations
    const addSubcontractorInvoice = useCallback((invoice: Omit<SubcontractorInvoice, 'id'>) => {
        const newId = `INV-${String((data.subcontractorInvoices?.length || 0) + 1).padStart(3, '0')}`;
        const newInvoice: SubcontractorInvoice = { ...invoice, id: newId };
        saveData({ ...data, subcontractorInvoices: [...(data.subcontractorInvoices || []), newInvoice] });
        return newId;
    }, [data, saveData]);

    const updateSubcontractorInvoice = useCallback((id: string, updates: Partial<SubcontractorInvoice>) => {
        const newInvoices = (data.subcontractorInvoices || []).map(inv =>
            inv.id === id ? { ...inv, ...updates } : inv
        );
        saveData({ ...data, subcontractorInvoices: newInvoices });
    }, [data, saveData]);

    const approveInvoice = useCallback((id: string, approvedBy: string) => {
        const today = new Date().toISOString().split('T')[0];
        const newInvoices = (data.subcontractorInvoices || []).map(inv =>
            inv.id === id ? { ...inv, status: 'approved' as const, approvedBy, approvedDate: today } : inv
        );
        saveData({ ...data, subcontractorInvoices: newInvoices });
    }, [data, saveData]);

    const getInvoicesByProject = useCallback((projectId: number) => {
        return (data.subcontractorInvoices || []).filter(inv => inv.projectId === projectId);
    }, [data.subcontractorInvoices]);

    const getPendingInvoices = useCallback(() => {
        return (data.subcontractorInvoices || []).filter(inv => inv.status === 'pending-approval' || inv.status === 'submitted');
    }, [data.subcontractorInvoices]);

    // Budget & Margin Operations
    const getProjectBudget = useCallback((projectId: number) => {
        return (data.projectBudgets || []).find(b => b.projectId === projectId);
    }, [data.projectBudgets]);

    const updateProjectBudget = useCallback((projectId: number, updates: Partial<ProjectBudget>) => {
        const newBudgets = (data.projectBudgets || []).map(b =>
            b.projectId === projectId ? { ...b, ...updates } : b
        );
        saveData({ ...data, projectBudgets: newBudgets });
    }, [data, saveData]);

    const getProfitLeakAlerts = useCallback((projectId?: number) => {
        const alerts = data.profitLeakAlerts || [];
        return projectId ? alerts.filter(a => a.projectId === projectId) : alerts;
    }, [data.profitLeakAlerts]);

    const acknowledgeAlert = useCallback((alertId: string, acknowledgedBy: string) => {
        const now = new Date().toISOString();
        const newAlerts = (data.profitLeakAlerts || []).map(a =>
            a.id === alertId ? { ...a, acknowledgedAt: now, acknowledgedBy } : a
        );
        saveData({ ...data, profitLeakAlerts: newAlerts });
    }, [data, saveData]);

    const resolveAlert = useCallback((alertId: string) => {
        const now = new Date().toISOString();
        const newAlerts = (data.profitLeakAlerts || []).map(a =>
            a.id === alertId ? { ...a, resolvedAt: now } : a
        );
        saveData({ ...data, profitLeakAlerts: newAlerts });
    }, [data, saveData]);

    // ═══════════════════════════════════════════════════════════════════════
    // WALKTHROUGH & SIGN-OFF OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    const createWalkthroughSession = useCallback((session: Omit<WalkthroughSession, 'id'>) => {
        const newId = `WS-${String((data.walkthroughSessions?.length || 0) + 1).padStart(3, '0')}`;
        const newSession: WalkthroughSession = { ...session, id: newId };
        saveData({ ...data, walkthroughSessions: [...(data.walkthroughSessions || []), newSession] });
        return newId;
    }, [data, saveData]);

    const updateWalkthroughSession = useCallback((id: string, updates: Partial<WalkthroughSession>) => {
        const newSessions = (data.walkthroughSessions || []).map(s =>
            s.id === id ? { ...s, ...updates } : s
        );
        saveData({ ...data, walkthroughSessions: newSessions });
    }, [data, saveData]);

    const startWalkthrough = useCallback((id: string) => {
        const now = new Date().toISOString();
        const newSessions = (data.walkthroughSessions || []).map(s =>
            s.id === id ? { ...s, status: 'in-progress' as const, startedAt: now } : s
        );
        saveData({ ...data, walkthroughSessions: newSessions });
    }, [data, saveData]);

    const completeWalkthrough = useCallback((id: string, rating?: number, feedback?: string) => {
        const now = new Date().toISOString();
        const newSessions = (data.walkthroughSessions || []).map(s =>
            s.id === id ? {
                ...s,
                status: 'completed' as const,
                completedAt: now,
                overallRating: rating as 1 | 2 | 3 | 4 | 5 | undefined,
                clientFeedback: feedback
            } : s
        );
        saveData({ ...data, walkthroughSessions: newSessions });
    }, [data, saveData]);

    const getWalkthroughsByProject = useCallback((projectId: number) => {
        return (data.walkthroughSessions || []).filter(s => s.projectId === projectId);
    }, [data.walkthroughSessions]);

    // Completion Certificate Operations
    const createCompletionCertificate = useCallback((cert: Omit<CompletionCertificate, 'id'>) => {
        const newId = `CERT-${String((data.completionCertificates?.length || 0) + 1).padStart(3, '0')}`;
        const newCert: CompletionCertificate = { ...cert, id: newId };
        saveData({ ...data, completionCertificates: [...(data.completionCertificates || []), newCert] });
        return newId;
    }, [data, saveData]);

    const updateCompletionCertificate = useCallback((id: string, updates: Partial<CompletionCertificate>) => {
        const newCerts = (data.completionCertificates || []).map(c =>
            c.id === id ? { ...c, ...updates } : c
        );
        saveData({ ...data, completionCertificates: newCerts });
    }, [data, saveData]);

    const addSignature = useCallback((certId: string, type: 'client' | 'contractor', signature: SignatureData) => {
        const newCerts = (data.completionCertificates || []).map(c => {
            if (c.id === certId) {
                const updates: Partial<CompletionCertificate> = type === 'client'
                    ? { clientSignature: signature, status: c.contractorSignature ? 'fully-executed' : 'client-signed' }
                    : { contractorSignature: signature, status: c.clientSignature ? 'fully-executed' : 'pending-signature' };
                return { ...c, ...updates };
            }
            return c;
        });
        saveData({ ...data, completionCertificates: newCerts });
    }, [data, saveData]);

    const getCertificateByProject = useCallback((projectId: number) => {
        return (data.completionCertificates || []).find(c => c.projectId === projectId);
    }, [data.completionCertificates]);

    const getTeamMembers = useCallback(() => {
        return data.teamMembers || [];
    }, [data.teamMembers]);

    // ═══════════════════════════════════════════════════════════════════════
    // CLIENT INVOICING & PAYMENTS OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    const getClientInvoices = useCallback(() => {
        return data.clientInvoices || [];
    }, [data.clientInvoices]);

    const getClientInvoicesByProject = useCallback((projectId: number) => {
        return (data.clientInvoices || []).filter(inv => inv.projectId === projectId);
    }, [data.clientInvoices]);

    const getClientInvoice = useCallback((invoiceId: string) => {
        return (data.clientInvoices || []).find(inv => inv.id === invoiceId);
    }, [data.clientInvoices]);

    const generateInvoiceNumber = useCallback(() => {
        const year = new Date().getFullYear();
        const invoices = data.clientInvoices || [];
        const yearInvoices = invoices.filter(inv => inv.invoiceNumber.includes(String(year)));
        const nextNumber = yearInvoices.length + 1;
        return `INV-${year}-${String(nextNumber).padStart(4, '0')}`;
    }, [data.clientInvoices]);

    const createClientInvoice = useCallback((invoice: Omit<ClientInvoice, 'id'>) => {
        const newId = `CINV-${String((data.clientInvoices?.length || 0) + 1).padStart(3, '0')}`;
        const newInvoice: ClientInvoice = {
            ...invoice,
            id: newId,
            createdAt: new Date().toISOString()
        };
        saveData({ ...data, clientInvoices: [...(data.clientInvoices || []), newInvoice] });
        return newId;
    }, [data, saveData]);

    const updateClientInvoice = useCallback((invoiceId: string, updates: Partial<ClientInvoice>) => {
        const newInvoices = (data.clientInvoices || []).map(inv =>
            inv.id === invoiceId ? { ...inv, ...updates, lastModified: new Date().toISOString() } : inv
        );
        saveData({ ...data, clientInvoices: newInvoices });
    }, [data, saveData]);

    const deleteClientInvoice = useCallback((invoiceId: string) => {
        const invoice = (data.clientInvoices || []).find(inv => inv.id === invoiceId);
        if (invoice && invoice.status !== 'draft') {
            console.error('Cannot delete non-draft invoice');
            return;
        }
        const newInvoices = (data.clientInvoices || []).filter(inv => inv.id !== invoiceId);
        saveData({ ...data, clientInvoices: newInvoices });
    }, [data, saveData]);

    const sendClientInvoice = useCallback((invoiceId: string) => {
        const now = new Date().toISOString();
        const newInvoices = (data.clientInvoices || []).map(inv =>
            inv.id === invoiceId ? {
                ...inv,
                status: 'sent' as const,
                sentDate: now.split('T')[0],
                lastModified: now
            } : inv
        );
        saveData({ ...data, clientInvoices: newInvoices });
    }, [data, saveData]);

    const recordPayment = useCallback((invoiceId: string, payment: Omit<PaymentRecord, 'id'>) => {
        const now = new Date().toISOString();
        const newPayment: PaymentRecord = {
            ...payment,
            id: `pmt-${Date.now()}`,
            recordedAt: now
        };

        const newInvoices = (data.clientInvoices || []).map(inv => {
            if (inv.id === invoiceId) {
                const newPayments = [...(inv.payments || []), newPayment];
                const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
                const balance = inv.total - totalPaid;

                let status = inv.status;
                let paidDate: string | undefined = inv.paidDate;

                if (balance <= 0) {
                    status = 'paid';
                    paidDate = now.split('T')[0];
                } else if (totalPaid > 0) {
                    status = 'partial';
                }

                return {
                    ...inv,
                    payments: newPayments,
                    amountPaid: totalPaid,
                    balance,
                    status,
                    paidDate,
                    lastModified: now
                };
            }
            return inv;
        });
        saveData({ ...data, clientInvoices: newInvoices });
    }, [data, saveData]);

    const voidClientInvoice = useCallback((invoiceId: string, reason?: string) => {
        const now = new Date().toISOString();
        const newInvoices = (data.clientInvoices || []).map(inv =>
            inv.id === invoiceId ? {
                ...inv,
                status: 'void' as const,
                notes: reason ? `${inv.notes || ''}\nVOIDED: ${reason}` : inv.notes,
                lastModified: now
            } : inv
        );
        saveData({ ...data, clientInvoices: newInvoices });
    }, [data, saveData]);

    const getOutstandingInvoices = useCallback(() => {
        return (data.clientInvoices || []).filter(inv =>
            inv.status === 'sent' || inv.status === 'viewed' || inv.status === 'partial'
        );
    }, [data.clientInvoices]);

    const getOverdueInvoices = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        return (data.clientInvoices || []).filter(inv =>
            (inv.status === 'sent' || inv.status === 'viewed' || inv.status === 'partial') &&
            inv.dueDate < today
        );
    }, [data.clientInvoices]);

    const getProjectInvoiceSummary = useCallback((projectId: number): ProjectInvoiceSummary => {
        const project = data.projects.find(p => p.id === projectId);
        const invoices = (data.clientInvoices || []).filter(inv => inv.projectId === projectId && inv.status !== 'void');
        const changeOrders = project?.changeOrders || [];

        const approvedCOValue = changeOrders
            .filter(co => co.status === 'approved' || co.status === 'executed')
            .reduce((sum, co) => sum + co.costImpact, 0);

        const contractValue = project?.financials?.contract || project?.value || 0;
        const totalContractValue = contractValue + approvedCOValue;

        const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
        const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balance, 0);

        const retainageHeld = invoices
            .filter(inv => !inv.retainageReleased)
            .reduce((sum, inv) => sum + inv.retainageAmount, 0);
        const retainageReleased = invoices
            .filter(inv => inv.retainageReleased)
            .reduce((sum, inv) => sum + inv.retainageAmount, 0);

        const today = new Date().toISOString().split('T')[0];
        const overdueInvoices = invoices.filter(inv =>
            inv.balance > 0 && inv.dueDate < today && inv.status !== 'paid'
        );

        const depositInvoice = invoices.find(inv => inv.type === 'deposit');
        const progressInvoices = invoices.filter(inv => inv.type === 'progress');
        const finalInvoice = invoices.find(inv => inv.type === 'final');

        // Generate suggested next invoice
        let suggestedNextInvoice: ProjectInvoiceSummary['suggestedNextInvoice'];
        const percentInvoiced = totalContractValue > 0 ? (totalInvoiced / totalContractValue) * 100 : 0;

        if (!depositInvoice) {
            suggestedNextInvoice = {
                type: 'deposit',
                reason: 'No deposit invoice created yet',
                estimatedAmount: Math.round(contractValue * 0.3)
            };
        } else if (project?.progress && project.progress >= 95 && !finalInvoice) {
            suggestedNextInvoice = {
                type: 'final',
                reason: 'Project near completion - create final invoice with retainage release',
                estimatedAmount: totalContractValue - totalInvoiced + retainageHeld
            };
        } else if (project?.progress && project.progress > percentInvoiced + 15) {
            suggestedNextInvoice = {
                type: 'progress',
                reason: `Work completed (${project.progress}%) exceeds invoiced (${percentInvoiced.toFixed(0)}%)`,
                estimatedAmount: Math.round((project.progress - percentInvoiced) / 100 * totalContractValue)
            };
        }

        return {
            projectId,
            contractValue,
            approvedChangeOrders: approvedCOValue,
            totalContractValue,
            totalInvoiced,
            totalPaid,
            totalOutstanding,
            retainageHeld,
            retainageReleased,
            retainageBalance: retainageHeld - retainageReleased,
            percentInvoiced,
            percentCollected: totalContractValue > 0 ? (totalPaid / totalContractValue) * 100 : 0,
            invoiceCount: invoices.length,
            overdueCount: overdueInvoices.length,
            overdueAmount: overdueInvoices.reduce((sum, inv) => sum + inv.balance, 0),
            depositInvoice,
            progressInvoices,
            finalInvoice,
            nextInvoiceNumber: generateInvoiceNumber(),
            suggestedNextInvoice
        };
    }, [data.clientInvoices, data.projects, generateInvoiceNumber]);

    return (
        <DataContext.Provider value={{
            data,
            isLoaded,
            getProject,
            updateProject,
            togglePunchItem,
            addPunchItem,
            addChangeOrder,
            updateChangeOrder,
            addDailyLog,
            getEstimate,
            updateEstimate,
            convertEstimateToProject,
            getActiveProjects,
            getTotalPipeline,
            getOpenPunchCount,
            getUnreadMessageCount,
            // Materials operations
            createPO,
            updatePO,
            getPOsByVendor,
            getPOsByProject,
            createDelivery,
            updateDelivery,
            checkInDelivery,
            createLot,
            updateLot,
            getLotWarnings,
            startAcclimation,
            updateAcclimation,
            addAcclimationReading,
            getActiveAcclimation,
            // Budgeting operations
            addLaborEntry,
            updateLaborEntry,
            getLaborByProject,
            getLaborSummary,
            addSubcontractorInvoice,
            updateSubcontractorInvoice,
            approveInvoice,
            getInvoicesByProject,
            getPendingInvoices,
            getProjectBudget,
            updateProjectBudget,
            getProfitLeakAlerts,
            acknowledgeAlert,
            resolveAlert,
            // Walkthrough & Sign-Off operations
            updatePunchItem,
            createWalkthroughSession,
            updateWalkthroughSession,
            startWalkthrough,
            completeWalkthrough,
            getWalkthroughsByProject,
            createCompletionCertificate,
            updateCompletionCertificate,
            addSignature,
            getCertificateByProject,
            getTeamMembers,
            // Client Invoicing operations
            getClientInvoices,
            getClientInvoicesByProject,
            getClientInvoice,
            createClientInvoice,
            updateClientInvoice,
            deleteClientInvoice,
            sendClientInvoice,
            recordPayment,
            voidClientInvoice,
            getProjectInvoiceSummary,
            generateInvoiceNumber,
            getOutstandingInvoices,
            getOverdueInvoices,
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData(): DataContextType {
    const context = useContext(DataContext);
    if (context === undefined) {
        // Return default values for SSR/static generation
        const emptyData: Database = {
            projects: [],
            vendors: [],
            inventory: [],
            globalSchedule: [],
            messages: [],
            estimates: [],
            offlineQueue: [],
            crews: [],
            crewAvailability: [],
            scheduleEntries: [],
            blockers: [],
            purchaseOrders: [],
            deliveries: [],
            materialLots: [],
            acclimationEntries: [],
            laborEntries: [],
            subcontractors: [],
            subcontractorInvoices: [],
            projectBudgets: [],
            profitLeakAlerts: [],
            walkthroughSessions: [],
            completionCertificates: [],
            teamMembers: [],
            clientInvoices: []
        };
        return {
            data: emptyData,
            isLoaded: false,
            getProject: () => undefined,
            updateProject: () => { },
            togglePunchItem: () => { },
            addPunchItem: () => { },
            addChangeOrder: () => { },
            updateChangeOrder: () => { },
            addDailyLog: () => { },
            getEstimate: () => undefined,
            updateEstimate: () => { },
            convertEstimateToProject: () => { },
            getActiveProjects: () => [],
            getTotalPipeline: () => 0,
            getOpenPunchCount: () => 0,
            getUnreadMessageCount: () => 0,
            // Materials operations
            createPO: () => '',
            updatePO: () => { },
            getPOsByVendor: () => [],
            getPOsByProject: () => [],
            createDelivery: () => '',
            updateDelivery: () => { },
            checkInDelivery: () => { },
            createLot: () => '',
            updateLot: () => { },
            getLotWarnings: () => [],
            startAcclimation: () => '',
            updateAcclimation: () => { },
            addAcclimationReading: () => { },
            getActiveAcclimation: () => [],
            // Budgeting operations
            addLaborEntry: () => '',
            updateLaborEntry: () => { },
            getLaborByProject: () => [],
            getLaborSummary: () => ({ totalHours: 0, totalCost: 0, byPhase: {} as Record<JobPhase, { hours: number; cost: number }> }),
            addSubcontractorInvoice: () => '',
            updateSubcontractorInvoice: () => { },
            approveInvoice: () => { },
            getInvoicesByProject: () => [],
            getPendingInvoices: () => [],
            getProjectBudget: () => undefined,
            updateProjectBudget: () => { },
            getProfitLeakAlerts: () => [],
            acknowledgeAlert: () => { },
            resolveAlert: () => { },
            // Walkthrough & Sign-Off operations
            updatePunchItem: () => { },
            createWalkthroughSession: () => '',
            updateWalkthroughSession: () => { },
            startWalkthrough: () => { },
            completeWalkthrough: () => { },
            getWalkthroughsByProject: () => [],
            createCompletionCertificate: () => '',
            updateCompletionCertificate: () => { },
            addSignature: () => { },
            getCertificateByProject: () => undefined,
            getTeamMembers: () => [],
            // Client Invoicing operations
            getClientInvoices: () => [],
            getClientInvoicesByProject: () => [],
            getClientInvoice: () => undefined,
            createClientInvoice: () => '',
            updateClientInvoice: () => { },
            deleteClientInvoice: () => { },
            sendClientInvoice: () => { },
            recordPayment: () => { },
            voidClientInvoice: () => { },
            getProjectInvoiceSummary: () => ({
                projectId: 0, contractValue: 0, approvedChangeOrders: 0, totalContractValue: 0,
                totalInvoiced: 0, totalPaid: 0, totalOutstanding: 0, retainageHeld: 0,
                retainageReleased: 0, retainageBalance: 0, percentInvoiced: 0, percentCollected: 0,
                invoiceCount: 0, overdueCount: 0, overdueAmount: 0, progressInvoices: [],
                nextInvoiceNumber: ''
            }),
            generateInvoiceNumber: () => '',
            getOutstandingInvoices: () => [],
            getOverdueInvoices: () => [],
        };
    }
    return context;
}
