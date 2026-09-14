import { PrismaClient, Prisma } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

/**
 * Multi-Tenancy Query Helper:
 * Ensures all operations strictly bind the provided organizationId to prevent cross-tenant data leaks.
 */
export function withTenantScope<T extends { organizationId: string }>(
  organizationId: string,
  data: Omit<T, 'organizationId'>,
): T {
  return {
    ...data,
    organizationId,
  } as T;
}

export { Prisma, PrismaClient };
export * from '@prisma/client';
export default prisma;
