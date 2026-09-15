'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { ResetPasswordForm } from '../../../components/auth/reset-password-form.js';
import { Skeleton } from '../../../components/ui/skeleton.js';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-md rounded-xl" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
