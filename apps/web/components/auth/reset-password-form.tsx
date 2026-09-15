'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordInput } from '@tasksaas/shared';
import { api, ApiError } from '../../lib/api-client.js';
import { useToast } from '../ui/use-toast.js';
import { Button } from '../ui/button.js';
import { Input } from '../ui/input.js';
import { Label } from '../ui/label.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card.js';
import { Sparkles, Loader2, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenFromUrl,
      password: '',
    },
  });

  React.useEffect(() => {
    if (tokenFromUrl) {
      setValue('token', tokenFromUrl);
    }
  }, [tokenFromUrl, setValue]);

  const onSubmit = async (data: ResetPasswordInput) => {
    setError(null);
    try {
      await api.post('/auth/reset-password', data);
      setSuccess(true);
      toast({
        title: 'Password Updated',
        description: 'You can now sign in with your new password.',
        variant: 'success',
      });
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Password reset failed. The token may be expired or invalid.');
      }
    }
  };

  return (
    <Card className="w-full max-w-md border-border/80 bg-card/90 shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg shadow-blue-500/25">
          <Sparkles className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Set New Password</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your recovery token and choose a new secure password
        </CardDescription>
      </CardHeader>

      {success ? (
        <CardContent className="space-y-4 text-center py-6">
          <div className="flex flex-col items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 space-y-2">
            <CheckCircle2 className="h-8 w-8" />
            <p className="text-sm font-semibold">Password Reset Successfully</p>
            <p className="text-xs text-muted-foreground">Redirecting you to sign in...</p>
          </div>
          <Link href="/login">
            <Button variant="gradient" className="w-full">
              Sign In Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium animate-in fade-in-50">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="token">Reset Token</Label>
              <Input
                id="token"
                placeholder="Paste recovery token"
                disabled={isSubmitting}
                {...register('token')}
              />
              {errors.token && (
                <p className="text-xs text-destructive">{errors.token.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className="pl-9"
                  disabled={isSubmitting}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              className="w-full"
              variant="gradient"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Save New Password'
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Back to Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
