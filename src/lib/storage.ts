'use client';

import { useState, useEffect, useCallback } from 'react';
import { Database, initialData, Project } from './data';
import {
    MOCK_WAREHOUSE_LOCATIONS,
    MOCK_TRANSACTIONS,
    MOCK_RESERVATIONS,
    MOCK_TRANSFERS,
    MOCK_ENHANCED_LOTS,
    MOCK_CYCLE_COUNTS,
    MOCK_REORDER_SUGGESTIONS
} from './warehouse-mock-data';

const STORAGE_KEY = 'floorops-pro-data';


export function useLocalStorage(): [Database, (data: Database) => void, boolean] {
    const [data, setData] = useState<Database>(initialData);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load data from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge with initialData to ensure new fields are present
                const merged: Database = {
                    ...initialData,
                    ...parsed,
                    // Migrate projects to ensure new fields are present
                    projects: (parsed.projects || initialData.projects).map((p: any) => {
                        const initialProject = initialData.projects.find((ip: Project) => ip.id === p.id);
                        return {
                            ...p,
                            // Ensure safety fields are present if missing
                            moistureTests: p.moistureTests || initialProject?.moistureTests || [],
                            subfloorTests: p.subfloorTests || initialProject?.subfloorTests || [],
                            siteConditions: p.siteConditions || initialProject?.siteConditions || [],
                            safetyIncidents: p.safetyIncidents || initialProject?.safetyIncidents || [],
                            complianceChecklists: p.complianceChecklists || initialProject?.complianceChecklists || [],
                            // Ensure daily logs are present if missing (fix for empty logs bug)
                            dailyLogs: (p.dailyLogs && p.dailyLogs.length > 0) ? p.dailyLogs : (initialProject?.dailyLogs || []),
                            // Ensure contract scope is present if missing
                            contractScope: p.contractScope || initialProject?.contractScope || undefined,
                            // Ensure schedule phases are present
                            schedulePhases: p.schedulePhases || initialProject?.schedulePhases || [],
                            materialDeliveries: p.materialDeliveries || initialProject?.materialDeliveries || [],
                            phasePhotos: p.phasePhotos || initialProject?.phasePhotos || [],
                        };
                    }),
                    // Ensure new walkthrough fields use initialData if not in localStorage
                    walkthroughSessions: parsed.walkthroughSessions?.length > 0
                        ? parsed.walkthroughSessions
                        : initialData.walkthroughSessions,
                    completionCertificates: parsed.completionCertificates?.length > 0
                        ? parsed.completionCertificates
                        : initialData.completionCertificates,
                    teamMembers: parsed.teamMembers?.length > 0
                        ? parsed.teamMembers
                        : initialData.teamMembers,
                    // Migrate messages to include new fields
                    messages: (parsed.messages || initialData.messages).map((m: any) => ({
                        ...m,
                        content: m.content || m.preview || '',
                        timestamp: m.timestamp || new Date().toISOString(),
                        type: m.type || 'text',
                        senderRole: m.senderRole || 'system'
                    })),
                    notifications: parsed.notifications || initialData.notifications,
                    // ══════════════════════════════════════════════════════════════════
                    // WAREHOUSE MANAGEMENT SYSTEM - Initialize with mock data
                    // Force load mock data for demo if existing data is missing/empty
                    // ══════════════════════════════════════════════════════════════════
                    warehouseLocations: (parsed.warehouseLocations && parsed.warehouseLocations.length > 0)
                        ? parsed.warehouseLocations
                        : MOCK_WAREHOUSE_LOCATIONS,
                    inventoryTransactions: (parsed.inventoryTransactions && parsed.inventoryTransactions.length > 0)
                        ? parsed.inventoryTransactions
                        : MOCK_TRANSACTIONS,
                    stockReservations: (parsed.stockReservations && parsed.stockReservations.length > 0)
                        ? parsed.stockReservations
                        : MOCK_RESERVATIONS,
                    stockTransfers: (parsed.stockTransfers && parsed.stockTransfers.length > 0)
                        ? parsed.stockTransfers
                        : MOCK_TRANSFERS,
                    enhancedLots: (parsed.enhancedLots && parsed.enhancedLots.length > 0)
                        ? parsed.enhancedLots
                        : MOCK_ENHANCED_LOTS,
                    cycleCounts: (parsed.cycleCounts && parsed.cycleCounts.length > 0)
                        ? parsed.cycleCounts
                        : MOCK_CYCLE_COUNTS,
                    reorderSuggestions: (parsed.reorderSuggestions && parsed.reorderSuggestions.length > 0)
                        ? parsed.reorderSuggestions
                        : MOCK_REORDER_SUGGESTIONS,
                };
                setData(merged);
            } else {
                // No localStorage data - initialize with mock warehouse data for demo
                const freshData: Database = {
                    ...initialData,
                    warehouseLocations: MOCK_WAREHOUSE_LOCATIONS,
                    inventoryTransactions: MOCK_TRANSACTIONS,
                    stockReservations: MOCK_RESERVATIONS,
                    stockTransfers: MOCK_TRANSFERS,
                    enhancedLots: MOCK_ENHANCED_LOTS,
                    cycleCounts: MOCK_CYCLE_COUNTS,
                    reorderSuggestions: MOCK_REORDER_SUGGESTIONS,
                };
                setData(freshData);
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
        }
        setIsLoaded(true);
    }, []);

    // Save data to localStorage
    const saveData = useCallback((newData: Database) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
            setData(newData);
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
        }
    }, []);

    return [data, saveData, isLoaded];
}

// Theme utilities
const THEME_KEY = 'floorops-theme';

export function getStoredTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
}

export function setStoredTheme(theme: 'light' | 'dark') {
    if (typeof window === 'undefined') return;
    localStorage.setItem(THEME_KEY, theme);
}
