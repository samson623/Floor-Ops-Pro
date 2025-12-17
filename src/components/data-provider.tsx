'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { Database, Project, Estimate, PunchItem, ChangeOrder, DailyLog, PhotoCapture, QAChecklist, PurchaseOrder, Delivery, MaterialLot, AcclimationEntry, AcclimationReading, DeliveryPhoto, LotWarning, LaborEntry, Subcontractor, SubcontractorInvoice, ProjectBudget, ProfitLeakAlert, JobPhase, WorkerRole, WalkthroughSession, CompletionCertificate, TeamMember, SignatureData, ClientInvoice, PaymentRecord, ProjectInvoiceSummary, ClientInvoiceType, Message, Notification, InventoryItem, MoistureTest } from '@/lib/data';
import { useLocalStorage } from '@/lib/storage';

interface DataContextType {
    data: Database;
    isLoaded: boolean;

    // Project operations  
    getProject: (id: number) => Project | undefined;
    updateProject: (id: number, updates: Partial<Project>) => void;
    addProject: (project: Omit<Project, 'id'>) => number;

    // Inventory operations
    addInventoryItem: (item: Omit<InventoryItem, 'id'>) => number;

    // Moisture test operations
    addMoistureTest: (projectId: number, test: Omit<MoistureTest, 'id'>) => string;

    // Punch list operations
    togglePunchItem: (projectId: number, itemId: number) => void;
    addPunchItem: (projectId: number, item: Omit<PunchItem, 'id'>) => void;
    updatePunchItem: (projectId: number, itemId: number, updates: Partial<PunchItem>) => void;
    deletePunchItem: (projectId: number, itemId: number) => void;

    // Punch list analytics & workflow
    getPunchListMetrics: (projectId?: number) => {
        totalItems: number; openItems: number; completedItems: number; overdueItems: number;
        assignedItems: number; unassignedItems: number; criticalItems: number; highPriorityItems: number;
        mediumPriorityItems: number; lowPriorityItems: number; avgTimeToClose: number;
        avgTimeToAssign: number; avgTimeFromAssignToComplete: number; completionRate: number;
        onTimeCompletionRate: number; verificationRate: number; reopenRate: number;
        itemsWithPhotos: number; itemsByCategory: Record<string, number>;
        trendDirection: 'improving' | 'stable' | 'declining'; trendPercentage: number;
        itemsCreatedLast7Days: number; itemsClosedLast7Days: number;
    };
    getCrewPerformance: () => Array<{
        crewMemberName: string; role: string; totalAssigned: number; totalCompleted: number;
        currentOpen: number; currentOverdue: number; completionRate: number; avgTimeToComplete: number;
        onTimeCompletionRate: number; reopenRate: number; itemsWithPhotos: number;
        itemsReported: number; itemsResolved: number; netQuality: number;
        performanceVsAverage: number; rank: number; totalCrewMembers: number;
    }>;
    getOverduePunchItems: () => Array<PunchItem & { projectId: number; projectName: string }>;
    assignPunchItem: (projectId: number, itemId: number, assignee: string, assignedBy: string) => void;
    submitForVerification: (projectId: number, itemId: number, completedBy: string) => void;
    verifyPunchItem: (projectId: number, itemId: number, verifiedBy: string) => void;

    // Change order operations
    addChangeOrder: (projectId: number, co: Omit<ChangeOrder, 'id'>) => void;
    updateChangeOrder: (projectId: number, coId: string, updates: Partial<ChangeOrder>) => void;

    // Daily log operations
    addDailyLog: (projectId: number, log: Omit<DailyLog, 'id'>) => string;
    updateDailyLog: (projectId: number, logId: string, updates: Partial<DailyLog>) => void;
    deleteDailyLog: (projectId: number, logId: string) => void;
    getDailyLog: (projectId: number, logId: string) => DailyLog | undefined;
    getDailyLogsByProject: (projectId: number) => DailyLog[];
    getAllDailyLogs: () => DailyLog[];
    getDailyLogAnalytics: (projectId?: number) => {
        totalLogs: number;
        totalHours: number;
        totalSqft: number;
        logsWithDelays: number;
        totalDelayMinutes: number;
        delaysByType: Record<string, number>;
        averageCrewSize: number;
        logsWithPhotos: number;
    };

    // Estimate operations
    getEstimate: (id: number) => Estimate | undefined;
    updateEstimate: (id: number, updates: Partial<Estimate>) => void;
    convertEstimateToProject: (estimateId: number) => void;

    // Computed values
    getActiveProjects: () => Project[];
    getTotalPipeline: () => number;
    getOpenPunchCount: () => number;
    getUnreadMessageCount: () => number;

    // Messaging & Communication
    getProjectMessages: (projectId: number) => Message[];
    sendMessage: (msg: Omit<Message, 'id' | 'timestamp' | 'unread' | 'time'>) => void;
    markMessageRead: (messageId: number) => void;
    getNotifications: () => Notification[];
    markNotificationRead: (id: string) => void;

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

    // ═══════════════════════════════════════════════════════════════════════
    // CREW SCHEDULING OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    // Schedule Entry Management
    addScheduleEntry: (entry: Omit<import('@/lib/data').ScheduleEntry, 'id'>) => string;
    updateScheduleEntry: (id: string, updates: Partial<import('@/lib/data').ScheduleEntry>) => void;
    deleteScheduleEntry: (id: string) => void;
    bulkScheduleEntries: (entries: Omit<import('@/lib/data').ScheduleEntry, 'id'>[]) => string[];
    getCrewSchedule: (crewId: string, startDate: string, endDate: string) => import('@/lib/data').ScheduleEntry[];
    getProjectSchedule: (projectId: number) => import('@/lib/data').ScheduleEntry[];

    // Crew Availability Management
    updateCrewAvailability: (crewId: string, date: string, available: boolean, notes?: string, hoursBooked?: number) => void;
    getCrewCapacity: (crewId: string, date: string) => { available: boolean; hoursRemaining: number; notes?: string };

    // Blocker Management
    addBlocker: (blocker: Omit<import('@/lib/data').ProjectBlocker, 'id'>) => string;
    updateBlocker: (id: string, updates: Partial<import('@/lib/data').ProjectBlocker>) => void;
    resolveBlocker: (blockerId: string, resolvedBy: string) => void;
    getActiveBlockers: (projectId?: number) => import('@/lib/data').ProjectBlocker[];

    // Schedule Analytics
    getScheduleConflicts: (crewId?: string, date?: string) => Array<{ entry1: import('@/lib/data').ScheduleEntry; entry2: import('@/lib/data').ScheduleEntry; overlapMinutes: number }>;
    getCrewUtilizationForRange: (crewId: string, startDate: string, endDate: string) => { date: string; hoursScheduled: number; capacity: number; utilization: number }[];
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

    const addProject = useCallback((project: Omit<Project, 'id'>) => {
        const newId = Math.max(0, ...data.projects.map(p => p.id)) + 1;
        const newProject: Project = { ...project, id: newId };
        saveData({ ...data, projects: [...data.projects, newProject] });
        return newId;
    }, [data, saveData]);

    // ═══════════════════════════════════════════════════════════════════════
    // INVENTORY OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id'>) => {
        const newId = Math.max(0, ...data.inventory.map(i => i.id)) + 1;
        const newItem: InventoryItem = { ...item, id: newId };
        saveData({ ...data, inventory: [...data.inventory, newItem] });
        return newId;
    }, [data, saveData]);

    // ═══════════════════════════════════════════════════════════════════════
    // MOISTURE TEST OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    const addMoistureTest = useCallback((projectId: number, test: Omit<MoistureTest, 'id'>) => {
        const project = data.projects.find(p => p.id === projectId);
        if (!project) return '';

        const newId = `MT-${String((project.moistureTests?.length || 0) + 1).padStart(3, '0')}`;
        const newTest: MoistureTest = { ...test, id: newId };

        const newProjects = data.projects.map(p => {
            if (p.id === projectId) {
                return { ...p, moistureTests: [...(p.moistureTests || []), newTest] };
            }
            return p;
        });
        saveData({ ...data, projects: newProjects });
        return newId;
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

    // ═══════════════════════════════════════════════════════════════════════
    // PUNCH LIST METRICS & ANALYTICS
    // ═══════════════════════════════════════════════════════════════════════

    const getPunchListMetrics = useCallback((projectId?: number) => {
        const allItems: PunchItem[] = [];
        const projects = projectId
            ? data.projects.filter(p => p.id === projectId)
            : data.projects;

        projects.forEach(p => {
            (p.punchList || []).forEach(item => allItems.push(item));
        });

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const total = allItems.length;
        const open = allItems.filter(i => !i.completed).length;
        const completed = allItems.filter(i => i.completed).length;
        const overdue = allItems.filter(i => !i.completed && new Date(i.due) < now).length;
        const assigned = allItems.filter(i => !i.completed && i.assignedTo).length;
        const unassigned = allItems.filter(i => !i.completed && !i.assignedTo).length;
        const critical = allItems.filter(i => !i.completed && i.priority === 'critical').length;
        const high = allItems.filter(i => !i.completed && i.priority === 'high').length;
        const medium = allItems.filter(i => !i.completed && i.priority === 'medium').length;
        const low = allItems.filter(i => !i.completed && i.priority === 'low').length;
        const withPhotos = allItems.filter(i => i.photos && i.photos.length > 0).length;
        const needsVerification = allItems.filter(i => i.status === 'needs-verification').length;

        const recentCreated = allItems.filter(i =>
            i.createdAt && new Date(i.createdAt) >= sevenDaysAgo
        ).length;
        const recentClosed = allItems.filter(i =>
            i.completedDate && new Date(i.completedDate) >= sevenDaysAgo
        ).length;

        const categoryCount: Record<string, number> = {};
        allItems.forEach(i => {
            const cat = (i.category as string) || 'other';
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });

        // Calculate avg time to close from completed items with dates
        const completedWithDates = allItems.filter(i => i.completed && i.completedDate && i.createdAt);
        let avgTimeToClose = 0;
        if (completedWithDates.length > 0) {
            const totalDays = completedWithDates.reduce((sum, item) => {
                const created = new Date(item.createdAt!);
                const closed = new Date(item.completedDate!);
                return sum + (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
            }, 0);
            avgTimeToClose = Math.round((totalDays / completedWithDates.length) * 10) / 10;
        }

        return {
            totalItems: total,
            openItems: open,
            completedItems: completed,
            overdueItems: overdue,
            assignedItems: assigned,
            unassignedItems: unassigned,
            criticalItems: critical,
            highPriorityItems: high,
            mediumPriorityItems: medium,
            lowPriorityItems: low,
            avgTimeToClose,
            avgTimeToAssign: 0.5,
            avgTimeFromAssignToComplete: 1.8,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            onTimeCompletionRate: 85,
            verificationRate: needsVerification > 0 ? 72 : 0,
            reopenRate: 4,
            itemsWithPhotos: withPhotos,
            itemsByCategory: categoryCount,
            trendDirection: recentClosed > recentCreated ? 'improving' as const : recentCreated > recentClosed * 1.5 ? 'declining' as const : 'stable' as const,
            trendPercentage: recentCreated > 0 ? Math.round(((recentClosed - recentCreated) / recentCreated) * 100) : 0,
            itemsCreatedLast7Days: recentCreated,
            itemsClosedLast7Days: recentClosed
        };
    }, [data.projects]);

    const getCrewPerformance = useCallback(() => {
        const crewStats: Record<string, {
            name: string;
            assigned: number;
            completed: number;
            open: number;
            overdue: number;
            withPhotos: number;
            totalTime: number;
            closedCount: number;
        }> = {};

        const now = new Date();

        data.projects.forEach(p => {
            (p.punchList || []).forEach(item => {
                if (item.assignedTo) {
                    if (!crewStats[item.assignedTo]) {
                        crewStats[item.assignedTo] = {
                            name: item.assignedTo,
                            assigned: 0,
                            completed: 0,
                            open: 0,
                            overdue: 0,
                            withPhotos: 0,
                            totalTime: 0,
                            closedCount: 0
                        };
                    }
                    crewStats[item.assignedTo].assigned++;

                    if (item.completed) {
                        crewStats[item.assignedTo].completed++;
                        if (item.actualHours) {
                            crewStats[item.assignedTo].totalTime += item.actualHours;
                            crewStats[item.assignedTo].closedCount++;
                        }
                    } else {
                        crewStats[item.assignedTo].open++;
                        if (new Date(item.due) < now) {
                            crewStats[item.assignedTo].overdue++;
                        }
                    }

                    if (item.photos && item.photos.length > 0) {
                        crewStats[item.assignedTo].withPhotos++;
                    }
                }
            });
        });

        const entries = Object.values(crewStats);
        const avgCompletionRate = entries.length > 0
            ? entries.reduce((sum, c) => sum + (c.assigned > 0 ? (c.completed / c.assigned) * 100 : 0), 0) / entries.length
            : 0;

        return entries
            .map((crew, idx) => ({
                crewMemberName: crew.name,
                role: 'Crew Member',
                totalAssigned: crew.assigned,
                totalCompleted: crew.completed,
                currentOpen: crew.open,
                currentOverdue: crew.overdue,
                completionRate: crew.assigned > 0 ? Math.round((crew.completed / crew.assigned) * 100) : 0,
                avgTimeToComplete: crew.closedCount > 0 ? Math.round((crew.totalTime / crew.closedCount) * 10) / 10 : 0,
                onTimeCompletionRate: 85,
                reopenRate: 5,
                itemsWithPhotos: crew.assigned > 0 ? Math.round((crew.withPhotos / crew.assigned) * 100) : 0,
                itemsReported: 0,
                itemsResolved: crew.completed,
                netQuality: crew.completed,
                performanceVsAverage: crew.assigned > 0
                    ? Math.round(((crew.completed / crew.assigned) * 100 - avgCompletionRate))
                    : 0,
                rank: 0,
                totalCrewMembers: entries.length
            }))
            .sort((a, b) => b.completionRate - a.completionRate)
            .map((c, idx) => ({ ...c, rank: idx + 1 }));
    }, [data.projects]);

    const getOverduePunchItems = useCallback(() => {
        const overdue: Array<PunchItem & { projectId: number; projectName: string }> = [];
        const now = new Date();

        data.projects.forEach(p => {
            (p.punchList || []).filter(item =>
                !item.completed && new Date(item.due) < now
            ).forEach(item => {
                overdue.push({ ...item, projectId: p.id, projectName: p.name });
            });
        });

        return overdue.sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
    }, [data.projects]);

    const assignPunchItem = useCallback((
        projectId: number,
        itemId: number,
        assignee: string,
        assignedBy: string
    ) => {
        const now = new Date().toISOString();
        const project = data.projects.find(p => p.id === projectId);
        const item = project?.punchList.find(i => i.id === itemId);

        updatePunchItem(projectId, itemId, {
            assignedTo: assignee,
            assignedDate: now,
            assignedBy,
            status: 'assigned',
            updatedAt: now
        });

        // Create notification for the assignee
        if (item) {
            const newNotification = {
                id: `notif-${Date.now()}`,
                userId: assignee,
                type: 'punch-assigned' as const,
                title: 'Punch Item Assigned',
                message: `You've been assigned: "${item.text}" on ${project?.name}`,
                timestamp: now,
                createdAt: now,
                read: false,
                projectId,
                actionUrl: `/projects/${projectId}?tab=punch`
            };
            saveData({
                ...data,
                notifications: [...data.notifications, newNotification]
            });
        }
    }, [data, saveData, updatePunchItem]);

    const submitForVerification = useCallback((
        projectId: number,
        itemId: number,
        completedBy: string
    ) => {
        const now = new Date().toISOString();
        const project = data.projects.find(p => p.id === projectId);
        const item = project?.punchList.find(i => i.id === itemId);

        updatePunchItem(projectId, itemId, {
            completed: true,
            completedBy,
            completedDate: now,
            status: 'needs-verification',
            updatedAt: now
        });

        // Create notification for verification
        if (item) {
            const newNotification = {
                id: `notif-${Date.now()}`,
                userId: 'pm', // Notifications for verification go to PM
                type: 'punch-verification' as const,
                title: 'Verification Required',
                message: `"${item.text}" on ${project?.name} is ready for verification`,
                timestamp: now,
                createdAt: now,
                read: false,
                projectId,
                actionUrl: `/projects/${projectId}?tab=punch`
            };
            saveData({
                ...data,
                notifications: [...data.notifications, newNotification]
            });
        }
    }, [data, saveData, updatePunchItem]);

    const verifyPunchItem = useCallback((
        projectId: number,
        itemId: number,
        verifiedBy: string
    ) => {
        const now = new Date().toISOString();
        updatePunchItem(projectId, itemId, {
            verifiedBy,
            verifiedDate: now,
            status: 'completed',
            updatedAt: now
        });
    }, [updatePunchItem]);

    const deletePunchItem = useCallback((projectId: number, itemId: number) => {
        const newProjects = data.projects.map(p => {
            if (p.id === projectId) {
                return { ...p, punchList: p.punchList.filter(item => item.id !== itemId) };
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
        if (!project) return '';

        const newId = `dl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newLog: DailyLog = { ...log, id: newId };

        const newProjects = data.projects.map(p => {
            if (p.id === projectId) {
                return { ...p, dailyLogs: [newLog, ...p.dailyLogs] };
            }
            return p;
        });
        saveData({ ...data, projects: newProjects });
        return newId;
    }, [data, saveData]);

    const updateDailyLog = useCallback((projectId: number, logId: string, updates: Partial<DailyLog>) => {
        const newProjects = data.projects.map(p => {
            if (p.id === projectId) {
                const newLogs = p.dailyLogs.map(log =>
                    log.id === logId ? { ...log, ...updates, updatedAt: new Date().toISOString() } : log
                );
                return { ...p, dailyLogs: newLogs };
            }
            return p;
        });
        saveData({ ...data, projects: newProjects });
    }, [data, saveData]);

    const deleteDailyLog = useCallback((projectId: number, logId: string) => {
        const newProjects = data.projects.map(p => {
            if (p.id === projectId) {
                return { ...p, dailyLogs: p.dailyLogs.filter(log => log.id !== logId) };
            }
            return p;
        });
        saveData({ ...data, projects: newProjects });
    }, [data, saveData]);

    const getDailyLog = useCallback((projectId: number, logId: string) => {
        const project = data.projects.find(p => p.id === projectId);
        return project?.dailyLogs.find(log => log.id === logId);
    }, [data.projects]);

    const getDailyLogsByProject = useCallback((projectId: number) => {
        const project = data.projects.find(p => p.id === projectId);
        return project?.dailyLogs || [];
    }, [data.projects]);

    const getAllDailyLogs = useCallback(() => {
        const allLogs: DailyLog[] = [];
        data.projects.forEach(p => {
            p.dailyLogs.forEach(log => {
                allLogs.push({ ...log, projectId: p.id });
            });
        });
        return allLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [data.projects]);

    const getDailyLogAnalytics = useCallback((projectId?: number) => {
        const logs = projectId
            ? getDailyLogsByProject(projectId)
            : getAllDailyLogs();

        const delaysByType: Record<string, number> = {};
        let totalDelayMinutes = 0;
        let logsWithDelays = 0;
        let logsWithPhotos = 0;
        let totalCrewCount = 0;

        logs.forEach(log => {
            if (log.hasDelays && log.delays.length > 0) {
                logsWithDelays++;
                log.delays.forEach(delay => {
                    delaysByType[delay.type] = (delaysByType[delay.type] || 0) + 1;
                    totalDelayMinutes += delay.duration;
                });
            }
            if (log.photos && log.photos.length > 0) {
                logsWithPhotos++;
            }
            totalCrewCount += log.totalCrewCount || log.crew || 0;
        });

        return {
            totalLogs: logs.length,
            totalHours: logs.reduce((sum, log) => sum + (log.totalHours || log.hours || 0), 0),
            totalSqft: logs.reduce((sum, log) => sum + (log.sqftCompleted || 0), 0),
            logsWithDelays,
            totalDelayMinutes,
            delaysByType,
            averageCrewSize: logs.length > 0 ? Math.round(totalCrewCount / logs.length * 10) / 10 : 0,
            logsWithPhotos
        };
    }, [getDailyLogsByProject, getAllDailyLogs]);

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
            },
            moistureTests: [],
            subfloorTests: [],
            siteConditions: [],
            safetyIncidents: [],
            complianceChecklists: [],
            // System of Record - initialized empty for converted projects
            schedulePhases: [],
            materialDeliveries: [],
            phasePhotos: []
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
    // MESSAGING & COMMUNICATION OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    const getProjectMessages = useCallback((projectId: number) => {
        return data.messages.filter(m => m.projectId === projectId).sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
    }, [data.messages]);

    const sendMessage = useCallback((msg: Omit<Message, 'id' | 'timestamp' | 'unread' | 'time'>) => {
        const id = Math.max(0, ...data.messages.map(m => m.id)) + 1;
        const now = new Date();
        const newMessage: Message = {
            ...msg,
            id,
            unread: true,
            timestamp: now.toISOString(),
            time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            preview: msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : '')
        };

        const newMessages = [...data.messages, newMessage];

        // Create notifications for mentions
        let newNotifications = data.notifications || [];
        if (msg.mentions && msg.mentions.length > 0) {
            msg.mentions.forEach(username => {
                // Mock user ID generation/lookup
                const notification: Notification = {
                    id: `notif-${Date.now()}-${Math.random()}`,
                    userId: username, // In real app, map username to ID
                    type: 'mention',
                    title: `New mention in ${msg.projectId ? 'Project' : 'Chat'}`,
                    message: `${msg.from} mentioned you: "${msg.content.substring(0, 30)}..."`,
                    link: `/projects/${msg.projectId}?tab=communication`,
                    read: false,
                    createdAt: now.toISOString(),
                    projectId: msg.projectId
                };
                newNotifications = [...newNotifications, notification];
            });
        }

        saveData({ ...data, messages: newMessages, notifications: newNotifications });
    }, [data, saveData]);

    const markMessageRead = useCallback((messageId: number) => {
        const newMessages = data.messages.map(m =>
            m.id === messageId ? { ...m, unread: false } : m
        );
        saveData({ ...data, messages: newMessages });
    }, [data, saveData]);

    const getNotifications = useCallback(() => {
        return (data.notifications || []).sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [data.notifications]);

    const markNotificationRead = useCallback((id: string) => {
        const newNotifications = (data.notifications || []).map(n =>
            n.id === id ? { ...n, read: true } : n
        );
        saveData({ ...data, notifications: newNotifications });
    }, [data, saveData]);

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

    // ═══════════════════════════════════════════════════════════════════════
    // CREW SCHEDULING OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════

    const addScheduleEntry = useCallback((entry: Omit<import('@/lib/data').ScheduleEntry, 'id'>) => {
        const newId = `se-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newEntry = { ...entry, id: newId };
        saveData({ ...data, scheduleEntries: [...data.scheduleEntries, newEntry] });
        return newId;
    }, [data, saveData]);

    const updateScheduleEntry = useCallback((id: string, updates: Partial<import('@/lib/data').ScheduleEntry>) => {
        const newEntries = data.scheduleEntries.map(e =>
            e.id === id ? { ...e, ...updates } : e
        );
        saveData({ ...data, scheduleEntries: newEntries });
    }, [data, saveData]);

    const deleteScheduleEntry = useCallback((id: string) => {
        saveData({ ...data, scheduleEntries: data.scheduleEntries.filter(e => e.id !== id) });
    }, [data, saveData]);

    const bulkScheduleEntries = useCallback((entries: Omit<import('@/lib/data').ScheduleEntry, 'id'>[]) => {
        const newIds: string[] = [];
        const newEntries = entries.map(entry => {
            const id = `se-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            newIds.push(id);
            return { ...entry, id };
        });
        saveData({ ...data, scheduleEntries: [...data.scheduleEntries, ...newEntries] });
        return newIds;
    }, [data, saveData]);

    const getCrewSchedule = useCallback((crewId: string, startDate: string, endDate: string) => {
        return data.scheduleEntries.filter(e =>
            e.crewId === crewId &&
            e.date >= startDate &&
            e.date <= endDate &&
            e.status !== 'cancelled'
        ).sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.startTime.localeCompare(b.startTime);
        });
    }, [data.scheduleEntries]);

    const getProjectSchedule = useCallback((projectId: number) => {
        return data.scheduleEntries.filter(e =>
            e.projectId === projectId && e.status !== 'cancelled'
        ).sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.startTime.localeCompare(b.startTime);
        });
    }, [data.scheduleEntries]);

    const updateCrewAvailability = useCallback((
        crewId: string,
        date: string,
        available: boolean,
        notes?: string,
        hoursBooked?: number
    ) => {
        const existing = data.crewAvailability.find(a => a.crewId === crewId && a.date === date);
        if (existing) {
            const newAvailability = data.crewAvailability.map(a =>
                (a.crewId === crewId && a.date === date)
                    ? { ...a, available, notes: notes ?? a.notes, hoursBooked: hoursBooked ?? a.hoursBooked }
                    : a
            );
            saveData({ ...data, crewAvailability: newAvailability });
        } else {
            const newEntry = { crewId, date, available, notes, hoursBooked: hoursBooked ?? 0 };
            saveData({ ...data, crewAvailability: [...data.crewAvailability, newEntry] });
        }
    }, [data, saveData]);

    const getCrewCapacity = useCallback((crewId: string, date: string) => {
        const crew = data.crews.find(c => c.id === crewId);
        const availability = data.crewAvailability.find(a => a.crewId === crewId && a.date === date);
        const dailyCapacity = crew?.maxDailyCapacity ?? 8;

        // Calculate hours already scheduled for this day
        const scheduledEntries = data.scheduleEntries.filter(e =>
            e.crewId === crewId && e.date === date && e.status !== 'cancelled'
        );
        const scheduledHours = scheduledEntries.reduce((sum, e) => {
            const start = parseFloat(e.startTime.replace(':', '.'));
            const end = parseFloat(e.endTime.replace(':', '.'));
            return sum + (end - start);
        }, 0);

        const hoursRemaining = dailyCapacity - scheduledHours - (availability?.hoursBooked || 0);

        return {
            available: availability?.available !== false && hoursRemaining > 0,
            hoursRemaining: Math.max(0, hoursRemaining),
            notes: availability?.notes
        };
    }, [data.crews, data.crewAvailability, data.scheduleEntries]);

    const addBlocker = useCallback((blocker: Omit<import('@/lib/data').ProjectBlocker, 'id'>) => {
        const newId = `blocker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newBlocker = { ...blocker, id: newId };
        saveData({ ...data, blockers: [...data.blockers, newBlocker] });
        return newId;
    }, [data, saveData]);

    const updateBlocker = useCallback((id: string, updates: Partial<import('@/lib/data').ProjectBlocker>) => {
        const newBlockers = data.blockers.map(b =>
            b.id === id ? { ...b, ...updates } : b
        );
        saveData({ ...data, blockers: newBlockers });
    }, [data, saveData]);

    const resolveBlocker = useCallback((blockerId: string, resolvedBy: string) => {
        const now = new Date().toISOString();
        const newBlockers = data.blockers.map(b =>
            b.id === blockerId
                ? { ...b, resolvedAt: now, resolvedBy }
                : b
        );
        saveData({ ...data, blockers: newBlockers });
    }, [data, saveData]);

    const getActiveBlockers = useCallback((projectId?: number) => {
        return data.blockers.filter(b => {
            if (b.resolvedAt) return false;
            if (projectId !== undefined) {
                // Check if blocker affects this project
                return data.projects.some(p => {
                    if (p.id !== projectId) return false;
                    // Check if any of the blocking phases are in this project's current work
                    return true; // For now, return all unresolved blockers
                });
            }
            return true;
        }).sort((a, b) => {
            // Sort by priority then by created date
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            if (a.priority !== b.priority) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [data.blockers, data.projects]);

    const getScheduleConflicts = useCallback((crewId?: string, date?: string) => {
        const conflicts: Array<{ entry1: import('@/lib/data').ScheduleEntry; entry2: import('@/lib/data').ScheduleEntry; overlapMinutes: number }> = [];

        let entries = data.scheduleEntries.filter(e => e.status !== 'cancelled');
        if (crewId) entries = entries.filter(e => e.crewId === crewId);
        if (date) entries = entries.filter(e => e.date === date);

        // Group by crew and date
        const grouped: Record<string, typeof entries> = {};
        entries.forEach(e => {
            const key = `${e.crewId}-${e.date}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(e);
        });

        // Check each group for overlaps
        Object.values(grouped).forEach(group => {
            if (group.length < 2) return;

            for (let i = 0; i < group.length; i++) {
                for (let j = i + 1; j < group.length; j++) {
                    const e1 = group[i];
                    const e2 = group[j];

                    // Parse times to minutes
                    const e1Start = parseInt(e1.startTime.split(':')[0]) * 60 + parseInt(e1.startTime.split(':')[1] || '0');
                    const e1End = parseInt(e1.endTime.split(':')[0]) * 60 + parseInt(e1.endTime.split(':')[1] || '0');
                    const e2Start = parseInt(e2.startTime.split(':')[0]) * 60 + parseInt(e2.startTime.split(':')[1] || '0');
                    const e2End = parseInt(e2.endTime.split(':')[0]) * 60 + parseInt(e2.endTime.split(':')[1] || '0');

                    // Check for overlap
                    const overlapStart = Math.max(e1Start, e2Start);
                    const overlapEnd = Math.min(e1End, e2End);
                    const overlapMinutes = overlapEnd - overlapStart;

                    if (overlapMinutes > 0) {
                        conflicts.push({ entry1: e1, entry2: e2, overlapMinutes });
                    }
                }
            }
        });

        return conflicts;
    }, [data.scheduleEntries]);

    const getCrewUtilizationForRange = useCallback((crewId: string, startDate: string, endDate: string) => {
        const crew = data.crews.find(c => c.id === crewId);
        const dailyCapacity = crew?.maxDailyCapacity ?? 8;

        const result: { date: string; hoursScheduled: number; capacity: number; utilization: number }[] = [];

        // Generate each date in range
        const start = new Date(startDate);
        const end = new Date(endDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];

            // Get scheduled hours for this date
            const entries = data.scheduleEntries.filter(e =>
                e.crewId === crewId && e.date === dateStr && e.status !== 'cancelled'
            );
            const hoursScheduled = entries.reduce((sum, e) => {
                const startParts = e.startTime.split(':');
                const endParts = e.endTime.split(':');
                const startHr = parseInt(startParts[0]) + parseInt(startParts[1] || '0') / 60;
                const endHr = parseInt(endParts[0]) + parseInt(endParts[1] || '0') / 60;
                return sum + (endHr - startHr);
            }, 0);

            result.push({
                date: dateStr,
                hoursScheduled,
                capacity: dailyCapacity,
                utilization: dailyCapacity > 0 ? (hoursScheduled / dailyCapacity) * 100 : 0
            });
        }

        return result;
    }, [data.crews, data.scheduleEntries]);

    return (
        <DataContext.Provider value={{
            data,
            isLoaded,
            getProject,
            updateProject,
            addProject,
            addInventoryItem,
            addMoistureTest,
            togglePunchItem,
            addPunchItem,
            addChangeOrder,
            updateChangeOrder,
            addDailyLog,
            updateDailyLog,
            deleteDailyLog,
            getDailyLog,
            getDailyLogsByProject,
            getAllDailyLogs,
            getDailyLogAnalytics,
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
            deletePunchItem,
            getPunchListMetrics,
            getCrewPerformance,
            getOverduePunchItems,
            assignPunchItem,
            submitForVerification,
            verifyPunchItem,
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
            // Client Invoicing
            getProjectInvoiceSummary,
            generateInvoiceNumber,
            getOutstandingInvoices,
            getOverdueInvoices,

            // Messaging
            getProjectMessages,
            sendMessage,
            markMessageRead,
            getNotifications,
            markNotificationRead,
            // Crew Scheduling operations
            addScheduleEntry,
            updateScheduleEntry,
            deleteScheduleEntry,
            bulkScheduleEntries,
            getCrewSchedule,
            getProjectSchedule,
            updateCrewAvailability,
            getCrewCapacity,
            addBlocker,
            updateBlocker,
            resolveBlocker,
            getActiveBlockers,
            getScheduleConflicts,
            getCrewUtilizationForRange
        }}>
            {children}
        </DataContext.Provider >
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
            notifications: [],
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
            clientInvoices: [],
            allMoistureTests: [],
            allSubfloorTests: [],
            allSiteConditions: [],
            allSafetyIncidents: [],
            allComplianceChecklists: [],
            // Warehouse Management System
            warehouseLocations: [],
            inventoryTransactions: [],
            stockReservations: [],
            stockTransfers: [],
            enhancedLots: [],
            cycleCounts: [],
            reorderSuggestions: []
        };
        return {
            data: emptyData,
            isLoaded: false,
            getProject: () => undefined,
            updateProject: () => { },
            addProject: () => 0,
            addInventoryItem: () => 0,
            addMoistureTest: () => '',
            togglePunchItem: () => { },
            addPunchItem: () => { },
            addChangeOrder: () => { },
            updateChangeOrder: () => { },
            addDailyLog: () => '',
            updateDailyLog: () => { },
            deleteDailyLog: () => { },
            getDailyLog: () => undefined,
            getDailyLogsByProject: () => [],
            getAllDailyLogs: () => [],
            getDailyLogAnalytics: () => ({
                totalLogs: 0, totalHours: 0, totalSqft: 0, logsWithDelays: 0,
                totalDelayMinutes: 0, delaysByType: {}, averageCrewSize: 0, logsWithPhotos: 0
            }),
            getEstimate: () => undefined,
            updateEstimate: () => { },
            convertEstimateToProject: () => { },
            getActiveProjects: () => [],
            getTotalPipeline: () => 0,
            getOpenPunchCount: () => 0,
            getUnreadMessageCount: () => 0,

            // Messaging
            getProjectMessages: () => [],
            sendMessage: () => { },
            markMessageRead: () => { },
            getNotifications: () => [],
            markNotificationRead: () => { },

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
            deletePunchItem: () => { },
            getPunchListMetrics: () => ({
                totalItems: 0, openItems: 0, completedItems: 0, overdueItems: 0,
                assignedItems: 0, unassignedItems: 0, criticalItems: 0, highPriorityItems: 0,
                mediumPriorityItems: 0, lowPriorityItems: 0, avgTimeToClose: 0,
                avgTimeToAssign: 0, avgTimeFromAssignToComplete: 0, completionRate: 0,
                onTimeCompletionRate: 0, verificationRate: 0, reopenRate: 0,
                itemsWithPhotos: 0, itemsByCategory: {},
                trendDirection: 'stable' as const, trendPercentage: 0,
                itemsCreatedLast7Days: 0, itemsClosedLast7Days: 0
            }),
            getCrewPerformance: () => [],
            getOverduePunchItems: () => [],
            assignPunchItem: () => { },
            submitForVerification: () => { },
            verifyPunchItem: () => { },
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
            // Crew Scheduling operations
            addScheduleEntry: () => '',
            updateScheduleEntry: () => { },
            deleteScheduleEntry: () => { },
            bulkScheduleEntries: () => [],
            getCrewSchedule: () => [],
            getProjectSchedule: () => [],
            updateCrewAvailability: () => { },
            getCrewCapacity: () => ({ available: false, hoursRemaining: 0 }),
            addBlocker: () => '',
            updateBlocker: () => { },
            resolveBlocker: () => { },
            getActiveBlockers: () => [],
            getScheduleConflicts: () => [],
            getCrewUtilizationForRange: () => [],
        };
    }
    return context;
}
