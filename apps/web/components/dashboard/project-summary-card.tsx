import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.js';
import { Badge } from '../ui/badge.js';
import { Button } from '../ui/button.js';
import { FolderKanban, ArrowRight } from 'lucide-react';
import { formatDate } from '../../lib/utils.js';

export interface ProjectSummaryItem {
  id: string;
  name: string;
  key: string;
  status: string;
  priority: string;
  dueDate: string | null;
  _count?: {
    tasks: number;
    members: number;
  };
}

interface ProjectSummaryCardProps {
  projects: ProjectSummaryItem[];
}

export function ProjectSummaryCard({ projects }: ProjectSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-blue-400" />
          <CardTitle className="text-base font-bold">Active Projects</CardTitle>
        </div>
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
            View All <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent>
        {projects.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No active projects found. Create your first project to get started.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {projects.slice(0, 4).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center justify-between py-3 hover:bg-accent/40 px-2 rounded-lg transition-colors group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {project.name}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">({project.key})</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{project._count?.tasks ?? 0} tasks</span>
                    <span>•</span>
                    <span>Due {formatDate(project.dueDate)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {project.status}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
