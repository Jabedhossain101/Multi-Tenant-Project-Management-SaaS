'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@tasksaas/shared';
import { api, ApiError } from '../../lib/api-client.js';
import { useAuthStore, type AuthUser, type UserOrganization } from '../../lib/store/auth.store.js';
import { useToast } from '../ui/use-toast.js';
import { Button } from '../ui/button.js';
import { Input } from '../ui/input.js';
import { Label } from '../ui/label.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card.js';
import { Sparkles, Loader2, ArrowRight, Lock, Mail } from 'lucide-react';

export function LoginForm() {
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    try {
      const response = await api.post<{
        user: AuthUser;
        organizationId: string;
        organizations?: UserOrganization[];
      }>('/auth/login', data);

      // Refresh /auth/me to get full organization membership objects
      const meData = await api.get<{
        user: AuthUser;
        organizations: UserOrganization[];
      }>('/auth/me');

      setAuth(meData.user, meData.organizations, response.organizationId);

      toast({
        title: 'Welcome back!',
        description: `Logged in as ${response.user.name}`,
        variant: 'success',
      });

      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Login failed. Please verify your email and password.');
      }
    }
  };

  return (
    <Card className="w-full max-w-md border-border/80 bg-card/90 shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg shadow-blue-500/25">
          <Sparkles className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Sign in to TaskPulse AI</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your credentials to access your multi-tenant workspace
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium animate-in fade-in-50">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Work Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="alex@acme.com"
                className="pl-9"
                disabled={isSubmitting}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-9"
                disabled={isSubmitting}
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="rememberMe"
              defaultChecked
              className="h-4 w-4 rounded border-border bg-transparent text-primary focus:ring-primary focus:ring-offset-0"
            />
            <Label htmlFor="rememberMe" className="text-xs text-muted-foreground font-normal cursor-pointer">
              Remember my session on this device
            </Label>
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
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Create workspace
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
