'use client';

import {
    Database,
    Project,
    Crew,
    CrewAvailability,
    ScheduleEntry,
    ProjectBlocker,
    JobPhase,
    DailyPlanItem,
    PHASE_CONFIGS,
} from './data';

// ══════════════════════════════════════════════════════════════════
// SCHEDULING ENGINE
// Intelligent dependency resolution, crew capacity, and daily planning
// ══════════════════════════════════════════════════════════════════

const PHASE_ORDER: JobPhase[] = ['demo', 'prep', 'acclimation', 'install', 'cure', 'punch', 'closeout'];

/**
 * Get the current phase of a project based on milestones and status
 */
export function getCurrentProjectPhase(project: Project): JobPhase {
    const progress = project.progress;
    if (progress === 0) return 'demo';
    if (progress < 20) return 'demo';
    if (progress < 35) return 'prep';
    if (progress < 50) return 'acclimation';
    if (progress < 80) return 'install';
    if (progress < 90) return 'cure';
    if (progress < 100) return 'punch';
    return 'closeout';
}

/**
 * Determine if a phase is complete based on project progress
 */
export function isPhaseComplete(project: Project, phase: JobPhase): boolean {
    const phaseProgress: Record<JobPhase, number> = {
        demo: 20,
        prep: 35,
        acclimation: 50,
        install: 80,
        cure: 90,
        punch: 100,
        closeout: 100,
    };
    return project.progress >= phaseProgress[phase];
}

/**
 * Check if all dependencies for a phase are complete
 */
export function areDependenciesComplete(project: Project, phase: JobPhase): boolean {
    const config = PHASE_CONFIGS[phase];
    return config.dependencies.every(dep => isPhaseComplete(project, dep));
}

/**
 * Check if materials are ready for a phase
 */
export function areMaterialsReady(project: Project, phase: JobPhase): boolean {
    const config = PHASE_CONFIGS[phase];
    if (!config.materialRequired) return true;

    // Check if all materials are delivered
    return project.materials.every(m => m.status === 'delivered');
}

/**
 * Determine if a phase can start (all dependencies met, no blockers)
 */
export function canPhaseStart(
    project: Project,
    phase: JobPhase,
    blockers: ProjectBlocker[]
): boolean {
    // Check dependencies
    if (!areDependenciesComplete(project, phase)) return false;

    // Check materials
    if (!areMaterialsReady(project, phase)) return false;

    // Check for active blockers
    const activeBlockers = blockers.filter(
        b => !b.resolvedAt && b.blockingPhases.includes(phase)
    );
    if (activeBlockers.length > 0) return false;

    return true;
}

/**
 * Get all blockers currently affecting a phase
 */
export function getPhaseBlockers(
    project: Project,
    phase: JobPhase,
    blockers: ProjectBlocker[]
): ProjectBlocker[] {
    const result: ProjectBlocker[] = [];

    // Add dependency blockers
    const config = PHASE_CONFIGS[phase];
    for (const dep of config.dependencies) {
        if (!isPhaseComplete(project, dep)) {
            result.push({
                id: `dep-${dep}`,
                type: 'dependency',
                description: `Waiting for ${PHASE_CONFIGS[dep].label} to complete`,
                blockingPhases: [phase],
                createdAt: project.startDate,
                priority: 'high',
            });
        }
    }

    // Add material blockers
    if (config.materialRequired) {
        const undelivered = project.materials.filter(m => m.status !== 'delivered');
        if (undelivered.length > 0) {
            result.push({
                id: 'material-waiting',
                type: 'material',
                description: `Waiting on materials: ${undelivered.map(m => m.name).join(', ')}`,
                blockingPhases: [phase],
                createdAt: project.startDate,
                priority: 'high',
            });
        }
    }

    // Add external blockers
    const externalBlockers = blockers.filter(
        b => !b.resolvedAt && b.blockingPhases.includes(phase)
    );
    result.push(...externalBlockers);

    return result;
}

/**
 * Calculate crew availability for a specific date
 */
export function getCrewAvailability(
    crew: Crew,
    date: string,
    availability: CrewAvailability[],
    scheduleEntries: ScheduleEntry[]
): { available: boolean; hoursRemaining: number; notes?: string } {
    const dayAvailability = availability.find(a => a.crewId === crew.id && a.date === date);

    if (dayAvailability && !dayAvailability.available) {
        return { available: false, hoursRemaining: 0, notes: dayAvailability.notes };
    }

    // Calculate hours already booked
    const daySchedule = scheduleEntries.filter(
        s => s.crewId === crew.id && s.date === date && s.status !== 'cancelled'
    );

    const hoursBooked = daySchedule.reduce((sum, entry) => {
        const start = parseTime(entry.startTime);
        const end = parseTime(entry.endTime);
        return sum + (end - start);
    }, 0);

    const hoursRemaining = crew.maxDailyCapacity - hoursBooked;

    return {
        available: hoursRemaining > 0,
        hoursRemaining,
        notes: dayAvailability?.notes,
    };
}

/**
 * Parse time string "HH:MM" to hours (decimal)
 */
function parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
}

/**
 * Calculate estimated travel time between locations (simplified)
 */
export function calculateTravelMinutes(from: string, to: string): number {
    // In a real app, this would use a mapping API
    // For demo, return approximate values based on location keywords
    const locations: Record<string, number> = {
        'downtown': 0,
        'north': 15,
        'south': 20,
        'east': 25,
        'west': 30,
        'industrial': 35,
    };

    let fromOffset = 10;
    let toOffset = 10;

    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();

    for (const [key, offset] of Object.entries(locations)) {
        if (fromLower.includes(key)) fromOffset = offset;
        if (toLower.includes(key)) toOffset = offset;
    }

    return Math.abs(fromOffset - toOffset) + 15; // Base 15 min + difference
}

/**
 * Get priority for a phase based on project urgency
 */
export function getPhasePriority(project: Project, phase: JobPhase): 'high' | 'medium' | 'low' {
    const dueDate = new Date(project.dueDate);
    const today = new Date();
    const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Urgent if less than 5 days left
    if (daysLeft < 5) return 'high';
    // Medium if less than 10 days
    if (daysLeft < 10) return 'medium';
    return 'low';
}

/**
 * Suggest the best crew for a job based on location and availability
 */
export function suggestBestCrew(
    project: Project,
    date: string,
    crews: Crew[],
    availability: CrewAvailability[],
    scheduleEntries: ScheduleEntry[],
    requiredHours: number
): Crew | null {
    const availableCrews = crews.filter(crew => {
        const avail = getCrewAvailability(crew, date, availability, scheduleEntries);
        return avail.available && avail.hoursRemaining >= requiredHours;
    });

    if (availableCrews.length === 0) return null;

    // Sort by travel time from project location
    availableCrews.sort((a, b) => {
        const travelA = calculateTravelMinutes(a.homeBase, project.address);
        const travelB = calculateTravelMinutes(b.homeBase, project.address);
        return travelA - travelB;
    });

    return availableCrews[0];
}

/**
 * Main function: Get all work that can be done on a given date
 * This is the "What can we do today?" analyzer
 */
export function getAvailableWork(
    date: string,
    data: Database
): DailyPlanItem[] {
    const result: DailyPlanItem[] = [];
    const { projects, crews, crewAvailability, scheduleEntries, blockers } = data;

    // Filter to active and scheduled projects
    const activeProjects = projects.filter(
        p => p.status === 'active' || p.status === 'scheduled'
    );

    for (const project of activeProjects) {
        // Get current phase and next phase
        const currentPhase = getCurrentProjectPhase(project);
        const currentIndex = PHASE_ORDER.indexOf(currentPhase);

        // Check if current phase can proceed
        for (let i = currentIndex; i < PHASE_ORDER.length; i++) {
            const phase = PHASE_ORDER[i];
            const config = PHASE_CONFIGS[phase];

            // Skip phases that require no crew (waiting periods)
            if (config.requiredCrew === 0) continue;

            // Skip completed phases
            if (isPhaseComplete(project, phase)) continue;

            const phaseBlockers = getPhaseBlockers(project, phase, blockers);
            const canStart = phaseBlockers.length === 0 && areDependenciesComplete(project, phase);
            const materialReady = areMaterialsReady(project, phase);

            // Find best crew
            const bestCrew = suggestBestCrew(
                project,
                date,
                crews,
                crewAvailability,
                scheduleEntries,
                config.estimatedHours / 3 // Assume 1/3 of total can be done in a day
            );

            const travelMinutes = bestCrew
                ? calculateTravelMinutes(bestCrew.homeBase, project.address)
                : undefined;

            result.push({
                projectId: project.id,
                projectName: project.name,
                projectAddress: project.address,
                phase,
                phaseLabel: config.label,
                priority: getPhasePriority(project, phase),
                readyToStart: canStart && materialReady,
                blockers: phaseBlockers,
                estimatedHours: config.estimatedHours,
                requiredCrew: config.requiredCrew,
                materialReady,
                weatherOk: true, // Would integrate with weather API
                recommendedCrewId: bestCrew?.id,
                travelMinutes,
            });

            // Only show the first available/blocked phase per project
            break;
        }
    }

    // Sort by priority and readiness
    result.sort((a, b) => {
        // Ready items first
        if (a.readyToStart !== b.readyToStart) {
            return a.readyToStart ? -1 : 1;
        }
        // Then by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return result;
}

/**
 * Get all schedule entries for a date range
 */
export function getScheduleForRange(
    startDate: string,
    endDate: string,
    scheduleEntries: ScheduleEntry[],
    crewId?: string
): ScheduleEntry[] {
    return scheduleEntries.filter(entry => {
        const inRange = entry.date >= startDate && entry.date <= endDate;
        const matchesCrew = !crewId || entry.crewId === crewId;
        return inRange && matchesCrew && entry.status !== 'cancelled';
    });
}

/**
 * Check for scheduling conflicts
 */
export function checkScheduleConflicts(
    newEntry: Omit<ScheduleEntry, 'id'>,
    existingEntries: ScheduleEntry[]
): ScheduleEntry[] {
    const conflicts = existingEntries.filter(existing => {
        if (existing.crewId !== newEntry.crewId) return false;
        if (existing.date !== newEntry.date) return false;
        if (existing.status === 'cancelled') return false;

        const newStart = parseTime(newEntry.startTime);
        const newEnd = parseTime(newEntry.endTime);
        const existStart = parseTime(existing.startTime);
        const existEnd = parseTime(existing.endTime);

        // Check for overlap
        return !(newEnd <= existStart || newStart >= existEnd);
    });

    return conflicts;
}

/**
 * Auto-schedule work for a date (assigns crews to ready work)
 */
export function autoScheduleDate(
    date: string,
    data: Database
): ScheduleEntry[] {
    const availableWork = getAvailableWork(date, data);
    const readyWork = availableWork.filter(w => w.readyToStart && w.recommendedCrewId);
    const newEntries: ScheduleEntry[] = [];

    // Track crew hours as we schedule
    const crewHours: Record<string, number> = {};

    for (const work of readyWork) {
        if (!work.recommendedCrewId) continue;

        const crew = data.crews.find(c => c.id === work.recommendedCrewId);
        if (!crew) continue;

        const bookedHours = crewHours[crew.id] || 0;
        const availHours = crew.maxDailyCapacity - bookedHours;

        // Schedule what we can (up to 8 hours or remaining capacity)
        const hoursToSchedule = Math.min(work.estimatedHours / 3, availHours, 8);
        if (hoursToSchedule < 2) continue; // Don't schedule less than 2 hours

        const startTime = bookedHours === 0 ? '07:00' : formatTime(7 + bookedHours);
        const endTime = formatTime(7 + bookedHours + hoursToSchedule);

        newEntries.push({
            id: `auto-${date}-${work.projectId}-${work.phase}`,
            projectId: work.projectId,
            phase: work.phase,
            crewId: crew.id,
            date,
            startTime,
            endTime,
            travelMinutes: work.travelMinutes || 20,
            status: 'scheduled',
            notes: `Auto-scheduled: ${work.phaseLabel} for ${work.projectName}`,
        });

        crewHours[crew.id] = bookedHours + hoursToSchedule;
    }

    return newEntries;
}

function formatTime(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Get crew utilization stats for a date range
 */
export function getCrewUtilization(
    crew: Crew,
    startDate: string,
    endDate: string,
    scheduleEntries: ScheduleEntry[]
): { totalHours: number; scheduledHours: number; utilizationPercent: number } {
    const crewEntries = getScheduleForRange(startDate, endDate, scheduleEntries, crew.id);

    const scheduledHours = crewEntries.reduce((sum, entry) => {
        const start = parseTime(entry.startTime);
        const end = parseTime(entry.endTime);
        return sum + (end - start);
    }, 0);

    // Calculate working days in range
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const day = d.getDay();
        if (day !== 0 && day !== 6) workingDays++; // Mon-Fri
    }

    const totalHours = workingDays * crew.maxDailyCapacity;
    const utilizationPercent = totalHours > 0 ? Math.round((scheduledHours / totalHours) * 100) : 0;

    return { totalHours, scheduledHours, utilizationPercent };
}
