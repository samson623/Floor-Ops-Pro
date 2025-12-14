'use client';

import { useState } from 'react';
import { TopBar } from '@/components/top-bar';
import { ProjectCard } from '@/components/project-card';
import { useData } from '@/components/data-provider';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'active' | 'scheduled' | 'pending' | 'completed';

export default function ProjectsPage() {
    const { data } = useData();
    const [filter, setFilter] = useState<FilterType>('all');

    const filteredProjects = data.projects.filter(p => {
        if (filter === 'all') return true;
        return p.status === filter;
    });

    const filters: { value: FilterType; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
    ];

    return (
        <>
            <TopBar
                title="Projects"
                breadcrumb="All Projects"
                onNewProject={() => toast.info('New project form coming soon')}
            />

            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                    {filters.map(f => (
                        <Button
                            key={f.value}
                            variant={filter === f.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter(f.value)}
                            className={cn(
                                'transition-all',
                                filter === f.value && 'shadow-lg shadow-primary/25'
                            )}
                        >
                            {f.label}
                            {f.value !== 'all' && (
                                <span className="ml-2 opacity-60">
                                    ({data.projects.filter(p => p.status === f.value).length})
                                </span>
                            )}
                        </Button>
                    ))}
                </div>

                {/* Projects Grid */}
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                    {filteredProjects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>

                {filteredProjects.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No projects found with the selected filter.</p>
                    </div>
                )}
            </div>
        </>
    );
}
