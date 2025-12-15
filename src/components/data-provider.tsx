'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { Database, Project, Estimate, PunchItem, ChangeOrder, DailyLog, PhotoCapture, QAChecklist } from '@/lib/data';
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
            offlineQueue: []
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
        };
    }
    return context;
}
