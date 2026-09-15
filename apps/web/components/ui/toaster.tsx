'use client';

import * as React from 'react';
import { useToast } from './use-toast.js';
import { X, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] gap-2 pointer-events-none">
      {toasts.map(function ({ id, title, description, variant, action, ...props }) {
        return (
          <div
            key={id}
            className={cn(
              'pointer-events-auto relative flex w-full items-center justify-between space-x-3 overflow-hidden rounded-lg border p-4 shadow-lg transition-all',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full sm:data-[state=open]:slide-in-from-bottom-full',
              variant === 'destructive'
                ? 'border-destructive/50 bg-destructive/95 text-destructive-foreground'
                : variant === 'success'
                ? 'border-emerald-500/30 bg-emerald-950/95 text-emerald-100'
                : 'border-border bg-card/95 backdrop-blur-md text-foreground',
            )}
            {...props}
          >
            <div className="flex items-start gap-3">
              {variant === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />}
              {variant === 'destructive' && <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />}
              {variant === 'default' && <AlertTriangle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />}
              <div className="grid gap-1">
                {title && <div className="text-sm font-semibold">{title}</div>}
                {description && (
                  <div className="text-xs opacity-90">{description}</div>
                )}
              </div>
            </div>
            {action}
            <button
              onClick={() => dismiss(id)}
              className="rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
