'use client';

import * as React from 'react';
import { useAuthStore } from '../../../lib/store/auth.store.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card.js';
import { Input } from '../../../components/ui/input.js';
import { Label } from '../../../components/ui/label.js';
import { Badge } from '../../../components/ui/badge.js';
import { User, ShieldCheck, Mail } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          Personal Profile & Security Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage your account profile, authentication credentials, and security preferences
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Account Profile</CardTitle>
          <CardDescription className="text-xs">
            Your name and verified identity credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input defaultValue={user?.name} readOnly className="bg-muted/40" />
            </div>

            <div className="space-y-2">
              <Label>Work Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input defaultValue={user?.email} readOnly className="pl-9 bg-muted/40" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Badge variant="outline" className="text-xs">
              {user?.isSuperAdmin ? 'Super Administrator' : 'Standard Member'}
            </Badge>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Argon2id Password Encrypted
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
