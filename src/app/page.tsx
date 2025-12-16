'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/top-bar';
import { StatCard } from '@/components/stat-card';
import { ProjectCard } from '@/components/project-card';
import { ScheduleItemCard } from '@/components/schedule-item';
import { useData } from '@/components/data-provider';
import { usePermissions, PermissionGate } from '@/components/permission-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NewProjectModal } from '@/components/project-modals';

export default function DashboardPage() {
  const router = useRouter();
  const { data, getActiveProjects, getTotalPipeline, getOpenPunchCount, addProject } = useData();
  const { canViewPricing, currentUser, can } = usePermissions();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  const activeProjects = getActiveProjects();
  const pipeline = getTotalPipeline();
  const openPunch = getOpenPunchCount();

  // For field workers, show their assigned projects count
  const assignedCount = currentUser?.assignedProjectIds?.length || 0;
  const showPricing = canViewPricing();

  return (
    <>
      <TopBar
        title="Dashboard"
        breadcrumb={currentUser ? `Welcome back, ${currentUser.name.split(' ')[0]}` : 'Overview'}
        onNewProject={() => setShowNewProjectModal(true)}
        showNewProject={can('CREATE_PROJECT')}
      />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Projects"
            value={data.projects.length}
            change="↑ 2 this month"
            trend="up"
            onClick={() => router.push('/projects')}
          />
          {showPricing ? (
            <StatCard
              label="Pipeline"
              value={`$${(pipeline / 1000).toFixed(0)}K`}
              change="↑ 12%"
              trend="up"
              variant="success"
            />
          ) : (
            <StatCard
              label="My Assignments"
              value={assignedCount}
              change={assignedCount > 0 ? 'Active jobs' : 'No assignments'}
              trend="up"
              variant="success"
              onClick={() => router.push('/assignments')}
            />
          )}
          <StatCard
            label="Open Punch"
            value={openPunch}
            change={openPunch > 3 ? 'Needs attention' : 'On track'}
            trend={openPunch > 3 ? 'down' : 'up'}
            variant={openPunch > 3 ? 'warning' : 'default'}
            onClick={() => router.push('/punch')}
          />
          <StatCard
            label="Utilization"
            value="87%"
            change="Target met"
            trend="up"
            variant="primary"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Active Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Active Projects</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/projects')}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeProjects.length > 0 ? (
                activeProjects.slice(0, 3).map(project => (
                  <ProjectCard key={project.id} project={project} compact />
                ))
              ) : (
                <p className="text-muted-foreground text-sm py-8 text-center">
                  No active projects
                </p>
              )}
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Today&apos;s Schedule</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/schedule')}
              >
                Full View
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.globalSchedule.length > 0 ? (
                data.globalSchedule.map(item => (
                  <ScheduleItemCard
                    key={item.id}
                    item={item}
                    onClick={() => {
                      if (item.projectId) router.push(`/projects/${item.projectId}?tab=schedule`);
                    }}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-sm py-8 text-center">
                  No schedule items today
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Recent Messages</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/messages')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {data.messages.slice(0, 3).map(message => (
                <div
                  key={message.id}
                  className="flex items-center gap-4 py-3 cursor-pointer hover:bg-muted/50 -mx-4 px-4 transition-colors"
                  onClick={() => router.push('/messages')}
                >
                  <div className={`w-2 h-2 rounded-full ${message.unread ? 'bg-primary' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{message.from}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{message.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{message.preview}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Project Modal */}
      <NewProjectModal
        open={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onCreate={(project) => {
          addProject(project);
          router.push('/projects');
        }}
      />
    </>
  );
}

