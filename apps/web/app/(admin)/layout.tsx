import * as React from 'react';
import { AppShell } from '../../components/layout/app-shell.js';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell requireSuperAdmin={true}>{children}</AppShell>;
}
