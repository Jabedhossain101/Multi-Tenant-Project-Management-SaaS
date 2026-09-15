'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, ApiError } from '../../lib/api-client.js';
import { useAuthStore, type AuthUser, type UserOrganization } from '../../lib/store/auth.store.js';
import { useToast } from '../ui/use-toast.js';
import { Button } from '../ui/button.js';
import { Input } from '../ui/input.js';
import { Label } from '../ui/label.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card.js';
import { Sparkles, Loader2, ArrowRight, Lock, Mail, User, Building2 } from 'lucide-react';

const registerFormSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormInput = z.infer<typeof registerFormSchema>;

export function RegisterForm() {
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      organizationName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormInput) => {
    setError(null);
    try {
      const response = await api.post<{
        user: {
          id: string;
          email: string;
          name: string;
          isSuperAdmin: boolean;
          isEmailVerified: boolean;
        };
        organizationId?: string;
      }>('/auth/register', {
        name: data.name,
        email: data.email,
        organizationName: data.organizationName,
        password: data.password,
      });

      // Automatically login after successful registration
      await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      const meData = await api.get<{
        user: AuthUser;
        organizations: UserOrganization[];
      }>('/auth/me');

      setAuth(meData.user, meData.organizations, response.organizationId);

      toast({
        title: 'Workspace Initialized!',
        description: `Welcome to TaskPulse AI, ${data.name}!`,
        variant: 'success',
      });

      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again with a different email.');
      }
    }
  };

  return (
    <Card className="w-full max-w-md border-border/80 bg-card/90 shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg shadow-blue-500/25">
          <Sparkles className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Create your Workspace</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Deploy your team&apos;s intelligent project workspace in seconds
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
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Alex Mercer"
                className="pl-9"
                disabled={isSubmitting}
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgName">Organization / Company Name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="orgName"
                placeholder="Acme Technologies"
                className="pl-9"
                disabled={isSubmitting}
                {...register('organizationName')}
              />
            </div>
            {errors.organizationName && (
              <p className="text-xs text-destructive">{errors.organizationName.message}</p>
            )}
          </div>

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
            <Label htmlFor="password">Password</Label>
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                className="pl-9"
                disabled={isSubmitting}
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
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
                Initializing Workspace...
              </>
            ) : (
              <>
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
