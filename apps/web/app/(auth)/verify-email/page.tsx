'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api-client.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card.js';
import { Button } from '../../../components/ui/button.js';
import { Skeleton } from '../../../components/ui/skeleton.js';
import { Sparkles, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');

  React.useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    async function verify() {
      try {
        await api.post('/auth/verify-email', { token });
        setStatus('success');
      } catch {
        setStatus('error');
      }
    }

    verify();
  }, [token]);

  return (
    <Card className="w-full max-w-md border-border/80 bg-card/90 shadow-2xl backdrop-blur-xl text-center">
      <CardHeader className="space-y-2 pb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg shadow-blue-500/25">
          <Sparkles className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Email Verification</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Confirming your account verification status
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center p-6 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Validating verification token...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 space-y-2">
              <CheckCircle2 className="h-8 w-8" />
              <p className="text-sm font-semibold">Email Verified Successfully!</p>
              <p className="text-xs text-muted-foreground">Your account has full access.</p>
            </div>
            <Link href="/dashboard">
              <Button variant="gradient" className="w-full">
                Go to Workspace
              </Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 space-y-2">
              <AlertTriangle className="h-8 w-8" />
              <p className="text-sm font-semibold">Verification Failed</p>
              <p className="text-xs text-muted-foreground">The token may be expired or already used.</p>
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Skeleton className="h-80 w-full max-w-md rounded-xl" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
