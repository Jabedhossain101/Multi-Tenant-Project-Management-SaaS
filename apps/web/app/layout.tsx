import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

import { Providers } from './providers.js';

export const metadata: Metadata = {
  title: 'TaskPulse AI | Multi-Tenant Project Management SaaS',
  description: 'Enterprise-grade AI-powered project management platform for modern teams.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
