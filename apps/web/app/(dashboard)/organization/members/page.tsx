'use client';

import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../../../lib/api-client.js';
import { useAuthStore } from '../../../../lib/store/auth.store.js';
import { queryClient } from '../../../../lib/query-client.js';
import { useToast } from '../../../../components/ui/use-toast.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card.js';
import { Button } from '../../../../components/ui/button.js';
import { Input } from '../../../../components/ui/input.js';
import { Label } from '../../../../components/ui/label.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../components/ui/dialog.js';
import { Badge } from '../../../../components/ui/badge.js';
import { Avatar, AvatarFallback } from '../../../../components/ui/avatar.js';
import { Skeleton } from '../../../../components/ui/skeleton.js';
import { Users, UserPlus, Trash2, Loader2, Mail } from 'lucide-react';
import type { Role } from '@tasksaas/shared';

interface MemberRecord {
  id: string;
  role: Role;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    isEmailVerified: boolean;
  };
}

export default function OrganizationMembersPage() {
  const { activeOrgId, user: currentUser } = useAuthStore();
  const { toast } = useToast();
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<Role>('TEAM_MEMBER');

  const { data: members = [], isLoading } = useQuery<MemberRecord[]>({
    queryKey: ['org-members', activeOrgId],
    queryFn: () => api.get<MemberRecord[]>('/organizations/members'),
    enabled: !!activeOrgId,
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      api.post('/organizations/members/invite', {
        email: inviteEmail.trim(),
        role: inviteRole,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members'] });
      toast({
        title: 'Invitation Sent',
        description: `Invitation dispatched to ${inviteEmail}`,
        variant: 'success',
      });
      setInviteEmail('');
      setInviteOpen(false);
    },
    onError: () => {
      toast({
        title: 'Invitation Failed',
        description: 'Failed to invite member. Check seat limits or duplicate invite.',
        variant: 'destructive',
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: Role }) =>
      api.patch(`/organizations/members/${memberId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members'] });
      toast({ title: 'Role Updated', variant: 'success' });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => api.delete(`/organizations/members/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-members'] });
      toast({ title: 'Member Removed', variant: 'success' });
    },
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-400" />
            Workspace Team Members
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage member invitations, RBAC permissions, and team access levels
          </p>
        </div>

        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <UserPlus className="mr-2 h-4 w-4" /> Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an email invitation token to join this organization workspace.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleInviteSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Work Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="inviteEmail"
                    type="email"
                    placeholder="teammate@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inviteRole">Workspace Role</Label>
                <Select
                  value={inviteRole}
                  onValueChange={(val: Role) => setInviteRole(val)}
                >
                  <SelectTrigger id="inviteRole">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEAM_MEMBER">Team Member</SelectItem>
                    <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                    <SelectItem value="ORG_ADMIN">Organization Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInviteOpen(false)}
                  disabled={inviteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={inviteMutation.isPending || !inviteEmail.trim()}
                >
                  {inviteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Invitation...
                    </>
                  ) : (
                    'Send Invitation'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Members Card & Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Active Members ({members.length})</CardTitle>
          <CardDescription className="text-xs">
            Users authorized to view projects and create tasks in this workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {members.map((m) => {
                const isSelf = currentUser?.id === m.user.id;
                return (
                  <div key={m.id} className="flex items-center justify-between py-3.5 px-2 hover:bg-accent/40 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                          {m.user.name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{m.user.name}</span>
                          {isSelf && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0">
                              You
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{m.user.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Select
                        defaultValue={m.role}
                        onValueChange={(newRole: Role) =>
                          updateRoleMutation.mutate({ memberId: m.id, role: newRole })
                        }
                        disabled={isSelf}
                      >
                        <SelectTrigger className="w-36 h-8 text-xs font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TEAM_MEMBER">Team Member</SelectItem>
                          <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                          <SelectItem value="ORG_ADMIN">Org Admin</SelectItem>
                        </SelectContent>
                      </Select>

                      {!isSelf && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => removeMemberMutation.mutate(m.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
