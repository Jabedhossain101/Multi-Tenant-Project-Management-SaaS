'use client';

import * as React from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api-client.js';
import { queryClient } from '../../lib/query-client.js';
import { useToast } from '../ui/use-toast.js';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card.js';
import { Badge } from '../ui/badge.js';
import { Button } from '../ui/button.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.js';
import { formatDate } from '../../lib/utils.js';
import { FolderKanban, MoreVertical, Users, CheckSquare, Calendar, Archive, Trash2 } from 'lucide-react';

export interface ProjectCardData {
  id: string;
  name: string;
  key: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  _count?: {
    tasks: number;
    members: number;
  };
}

interface ProjectCardProps {
  project: ProjectCardData;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { toast } = useToast();

  const archiveMutation = useMutation({
    mutationFn: () => api.post(`/projects/${project.id}/archive`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Project Archived', variant: 'success' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/projects/${project.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Project Deleted', variant: 'success' });
    },
  });

  return (
    <Card className="hover:border-primary/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md">
      <div>
        <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <Link href={`/projects/${project.id}`}>
                <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {project.name}
                </h3>
              </Link>
              <span className="text-xs font-mono text-muted-foreground uppercase">{project.key}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/projects/${project.id}`} className="cursor-pointer">
                  Open Project
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => archiveMutation.mutate()}
                className="cursor-pointer"
              >
                <Archive className="mr-2 h-4 w-4" /> Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteMutation.mutate()}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="pt-2">
          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] leading-relaxed">
            {project.description || 'No description provided for this project.'}
          </p>

          <div className="flex items-center gap-2 pt-4">
            <Badge variant="outline" className="text-[10px]">
              {project.status}
            </Badge>
            <Badge
              variant={
                project.priority === 'URGENT'
                  ? 'destructive'
                  : project.priority === 'HIGH'
                  ? 'warning'
                  : 'secondary'
              }
              className="text-[10px]"
            >
              {project.priority}
            </Badge>
          </div>
        </CardContent>
      </div>

      <CardFooter className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground bg-muted/20">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <CheckSquare className="h-3.5 w-3.5" />
            {project._count?.tasks ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {project._count?.members ?? 0}
          </span>
        </div>

        <div className="flex items-center gap-1 font-mono text-[11px]">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(project.dueDate)}
        </div>
      </CardFooter>
    </Card>
  );
}
