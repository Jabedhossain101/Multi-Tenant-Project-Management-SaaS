import { describe, it, expect } from 'vitest';
import { prisma, withTenantScope, Role, PlanTier, TaskStatus, TaskPriority, ProjectStatus, SubscriptionStatus } from '../src/index.js';

describe('Database Schema & Multi-Tenancy Architecture', () => {
  it('exports valid PrismaClient singleton', () => {
    expect(prisma).toBeDefined();
    expect(prisma.user).toBeDefined();
    expect(prisma.organization).toBeDefined();
    expect(prisma.organizationMember).toBeDefined();
    expect(prisma.project).toBeDefined();
    expect(prisma.task).toBeDefined();
    expect(prisma.subtask).toBeDefined();
    expect(prisma.comment).toBeDefined();
    expect(prisma.file).toBeDefined();
    expect(prisma.notification).toBeDefined();
    expect(prisma.activityLog).toBeDefined();
    expect(prisma.subscription).toBeDefined();
    expect(prisma.payment).toBeDefined();
    expect(prisma.aIRequest).toBeDefined();
    expect(prisma.invitation).toBeDefined();
    expect(prisma.auditLog).toBeDefined();
  });

  it('exports correct RBAC and Plan enums', () => {
    expect(Role.SUPER_ADMIN).toBe('SUPER_ADMIN');
    expect(Role.ORG_ADMIN).toBe('ORG_ADMIN');
    expect(Role.PROJECT_MANAGER).toBe('PROJECT_MANAGER');
    expect(Role.TEAM_MEMBER).toBe('TEAM_MEMBER');

    expect(PlanTier.FREE).toBe('FREE');
    expect(PlanTier.PRO).toBe('PRO');
    expect(PlanTier.BUSINESS).toBe('BUSINESS');

    expect(TaskStatus.TODO).toBe('TODO');
    expect(TaskStatus.IN_PROGRESS).toBe('IN_PROGRESS');
    expect(TaskStatus.IN_REVIEW).toBe('IN_REVIEW');
    expect(TaskStatus.COMPLETED).toBe('COMPLETED');

    expect(TaskPriority.LOW).toBe('LOW');
    expect(TaskPriority.MEDIUM).toBe('MEDIUM');
    expect(TaskPriority.HIGH).toBe('HIGH');
    expect(TaskPriority.URGENT).toBe('URGENT');

    expect(ProjectStatus.PLANNING).toBe('PLANNING');
    expect(ProjectStatus.ACTIVE).toBe('ACTIVE');
    expect(SubscriptionStatus.ACTIVE).toBe('ACTIVE');
  });

  it('withTenantScope helper strictly injects organizationId', () => {
    const orgId = 'org-12345';
    const taskPayload = {
      title: 'Implement Security Boundary',
      status: TaskStatus.TODO,
    };

    const scopedPayload = withTenantScope<{ title: string; status: string; organizationId: string }>(
      orgId,
      taskPayload,
    );

    expect(scopedPayload).toEqual({
      title: 'Implement Security Boundary',
      status: TaskStatus.TODO,
      organizationId: 'org-12345',
    });
  });
});
