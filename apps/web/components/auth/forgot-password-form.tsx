'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@tasksaas/shared';
import { api, ApiError } from '../../lib/api-client.js';
import { Button } from '../ui/button.js';
import { Input } from '../ui/input.js';
import { Label } from '../ui/label.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card.js';
import { Sparkles, Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const [resetToken, setResetToken] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError(null);
    try {
      const res = await api.post<{ resetToken?: string }>('/auth/forgot-password', data);
      setSubmitted(true);
      if (res?.resetToken) {
        setResetToken(res.resetToken);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to process request');
      }
    }
  };

  return (
    <Card className="w-full max-w-md border-border/80 bg-card/90 shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg shadow-blue-500/25">
          <Sparkles className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your email to receive password recovery instructions
        </CardDescription>
      </CardHeader>

      {submitted ? (
        <CardContent className="space-y-4 text-center">
          <div className="flex flex-col items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 space-y-2">
            <CheckCircle2 className="h-8 w-8" />
            <p className="text-sm font-semibold">Recovery Link Generated</p>
            <p className="text-xs text-muted-foreground">
              If an account exists with that email, instructions have been generated.
            </p>
          </div>

          {resetToken && (
            <div className="p-3 bg-muted rounded-lg text-left space-y-1">
              <span className="text-[10px] text-muted-foreground font-mono uppercase">Dev Demo Recovery Token:</span>
              <p className="text-xs font-mono break-all select-all text-primary">{resetToken}</p>
              <Link
                href={`/reset-password?token=${resetToken}`}
                className="inline-block pt-1 text-xs text-primary font-semibold hover:underline"
              >
                Proceed to Reset Form &rarr;
              </Link>
            </div>
          )}

          <div className="pt-2">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign in
              </Button>
            </Link>
          </div>
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
                  Sending Link...
                </>
              ) : (
                'Send Recovery Link'
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground">
              <Link href="/login" className="font-semibold text-primary hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
