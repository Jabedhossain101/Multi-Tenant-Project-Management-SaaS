'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api-client.js';
import { useAuthStore } from '../../../lib/store/auth.store.js';
import { ProjectCard, type ProjectCardData } from '../../../components/projects/project-card.js';
import { CreateProjectDialog } from '../../../components/projects/create-project-dialog.js';
import { Input } from '../../../components/ui/input.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select.js';
import { Skeleton } from '../../../components/ui/skeleton.js';
import { Search, FolderKanban, Filter } from 'lucide-react';

interface ProjectsApiResponse {
  items: ProjectCardData[];
  total: number;
}

export default function ProjectsPage() {
  const { activeOrgId } = useAuthStore();
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<string>('ALL');

  const { data, isLoading } = useQuery<ProjectsApiResponse>({
    queryKey: ['projects', activeOrgId, search, status],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (status !== 'ALL') params.set('status', status);
      return api.get<ProjectsApiResponse>(`/projects?${params.toString()}`);
    },
    enabled: !!activeOrgId,
  });

  const projects = data?.items || [];

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-blue-400" />
            Workspace Projects
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage sprints, milestone deliveries, and project member access
          </p>
        </div>

        <CreateProjectDialog />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-card/60 p-3 rounded-xl border border-border/80">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name or key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-40 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PLANNING">Planning</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="ON_HOLD">On Hold</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <FolderKanban className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">No projects found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {search || status !== 'ALL'
                ? 'Try adjusting your search criteria or filters.'
                : 'Get started by creating your first project in this workspace.'}
            </p>
          </div>
          {!search && status === 'ALL' && <CreateProjectDialog />}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
