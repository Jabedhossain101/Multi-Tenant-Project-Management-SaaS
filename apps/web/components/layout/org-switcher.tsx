'use client';

import * as React from 'react';
import { useAuthStore } from '../../lib/store/auth.store.js';
import { api } from '../../lib/api-client.js';
import { queryClient } from '../../lib/query-client.js';
import { joinOrganizationRoom } from '../../lib/socket.js';
import { useToast } from '../ui/use-toast.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog.js';
import { Button } from '../ui/button.js';
import { Input } from '../ui/input.js';
import { Label } from '../ui/label.js';
import { Badge } from '../ui/badge.js';
import { Building2, Check, ChevronsUpDown, Plus } from 'lucide-react';
import type { Role, PlanTier } from '@tasksaas/shared';

export function OrgSwitcher() {
  const { organizations, activeOrgId, setActiveOrgId, setAuth, user } = useAuthStore();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [newOrgName, setNewOrgName] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const activeOrg = organizations.find((o) => o.id === activeOrgId) || organizations[0];

  const handleSwitch = async (orgId: string) => {
    if (orgId === activeOrgId) return;

    try {
      await api.post(`/organizations/${orgId}/switch`);
      setActiveOrgId(orgId);
      joinOrganizationRoom(orgId);
      queryClient.invalidateQueries();
      toast({
        title: 'Switched Organization',
        description: `Active organization changed to ${organizations.find((o) => o.id === orgId)?.name}`,
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Switch Failed',
        description: 'Unable to switch organization context',
        variant: 'destructive',
      });
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setIsSubmitting(true);
    try {
      const createdOrg = await api.post<{
        id: string;
        name: string;
        slug: string;
        role?: Role;
        plan?: PlanTier;
      }>('/organizations', {
        name: newOrgName.trim(),
      });

      const updatedOrgs = [
        ...organizations,
        {
          id: createdOrg.id,
          name: createdOrg.name,
          slug: createdOrg.slug,
          role: 'ORG_ADMIN' as Role,
          plan: 'FREE' as PlanTier,
        },
      ];

      if (user) {
        setAuth(user, updatedOrgs, createdOrg.id);
      }
      joinOrganizationRoom(createdOrg.id);
      queryClient.invalidateQueries();

      setCreateDialogOpen(false);
      setNewOrgName('');
      toast({
        title: 'Organization Created',
        description: `Successfully created "${createdOrg.name}"`,
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Creation Failed',
        description: 'Failed to create organization. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeOrg && organizations.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between border-border/80 bg-background/50 px-3 hover:bg-accent hover:text-accent-foreground text-left h-10"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20">
                <Building2 className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col truncate">
                <span className="truncate text-xs font-semibold text-foreground">
                  {activeOrg?.name || 'Select Organization'}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-mono">
                  {activeOrg?.plan || 'FREE'}
                </span>
              </div>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Organizations
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organizations.map((org) => {
            const isSelected = org.id === activeOrg?.id;
            return (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleSwitch(org.id)}
                className="flex items-center justify-between cursor-pointer py-2"
              >
                <div className="flex items-center gap-2 truncate">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate text-sm font-medium">{org.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="outline" className="text-[10px] px-1 py-0 uppercase">
                    {org.plan}
                  </Badge>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </div>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setCreateDialogOpen(true)}
            className="cursor-pointer text-primary focus:text-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Organization</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Create an isolated organization workspace with dedicated projects, tasks, and team members.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateOrg} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                placeholder="e.g. Acme Studio, Global Logistics"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !newOrgName.trim()} variant="gradient">
                {isSubmitting ? 'Creating...' : 'Create Workspace'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
