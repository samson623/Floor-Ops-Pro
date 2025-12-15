'use client';

import { useState, useEffect, useCallback } from 'react';
import { Database, initialData } from './data';

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
                };
                setData(merged);
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
