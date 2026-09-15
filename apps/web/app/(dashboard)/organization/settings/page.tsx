'use client';

import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../../../lib/api-client.js';
import { useAuthStore } from '../../../../lib/store/auth.store.js';
import { queryClient } from '../../../../lib/query-client.js';
import { useToast } from '../../../../components/ui/use-toast.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../../../components/ui/card.js';
import { Button } from '../../../../components/ui/button.js';
import { Input } from '../../../../components/ui/input.js';
import { Label } from '../../../../components/ui/label.js';
import { Skeleton } from '../../../../components/ui/skeleton.js';
import { Building2, Loader2 } from 'lucide-react';

export default function OrganizationSettingsPage() {
  const { activeOrgId } = useAuthStore();
  const { toast } = useToast();
  const [name, setName] = React.useState('');

  const { data: org, isLoading } = useQuery<{ id: string; name: string; slug: string }>({
    queryKey: ['organization-settings', activeOrgId],
    queryFn: () => api.get<{ id: string; name: string; slug: string }>('/organizations'),
    enabled: !!activeOrgId,
  });

  React.useEffect(() => {
    if (org) {
      setName(org.name);
    }
  }, [org]);

  const updateMutation = useMutation({
    mutationFn: () => api.patch('/organizations', { name: name.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast({ title: 'Workspace Updated', variant: 'success' });
    },
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          Workspace Configuration
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Configure organization workspace name, slug identifier, and access settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">General Information</CardTitle>
          <CardDescription className="text-xs">
            Update your public workspace title and identifier
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wsName">Workspace Name</Label>
            <Input
              id="wsName"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wsSlug">Workspace Slug</Label>
            <Input
              id="wsSlug"
              value={org?.slug}
              readOnly
              className="bg-muted/40 font-mono text-xs"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-border/60 pt-4">
          <Button
            variant="gradient"
            size="sm"
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending || !name.trim()}
          >
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
