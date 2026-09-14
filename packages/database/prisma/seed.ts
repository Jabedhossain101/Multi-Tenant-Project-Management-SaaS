import { PrismaClient, Role, PlanTier, ProjectStatus, ProjectPriority, TaskStatus, TaskPriority, SubscriptionStatus, NotificationType, ActivityAction, AIFeature, AIRequestStatus } from '@prisma/client';
import argon2 from 'argon2';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.info('🌱 Starting idempotent database seed...');

  const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || 'Password123!';
  const defaultPasswordHash = await argon2.hash(defaultPassword);

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@tasksaas.local';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'AdminSecurePassword123!';
  const superAdminPasswordHash = await argon2.hash(superAdminPassword);

  // 1. Seed Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      name: 'Global Super Admin',
      isSuperAdmin: true,
      isEmailVerified: true,
    },
    create: {
      email: superAdminEmail,
      name: 'Global Super Admin',
      passwordHash: superAdminPasswordHash,
      isSuperAdmin: true,
      isEmailVerified: true,
    },
  });
  console.info(`✓ Seeded Super Admin: ${superAdmin.email}`);

  // 2. Seed Tenant 1: Acme Corp
  const acmeOrg = await prisma.organization.upsert({
    where: { slug: 'acme' },
    update: {
      name: 'Acme Corporation',
    },
    create: {
      name: 'Acme Corporation',
      slug: 'acme',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
    },
  });

  // Seed Tenant 1 Subscription
  await prisma.subscription.upsert({
    where: { organizationId: acmeOrg.id },
    update: {
      plan: PlanTier.PRO,
      status: SubscriptionStatus.ACTIVE,
    },
    create: {
      organizationId: acmeOrg.id,
      stripeCustomerId: 'cus_acme_prod_12345',
      stripeSubscriptionId: 'sub_acme_pro_12345',
      stripePriceId: 'price_pro_monthly',
      plan: PlanTier.PRO,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
  });

  // Seed Tenant 1 Users
  const aliceAdmin = await prisma.user.upsert({
    where: { email: 'alice@acme.local' },
    update: { name: 'Alice Admin', isEmailVerified: true },
    create: {
      email: 'alice@acme.local',
      name: 'Alice Admin',
      passwordHash: defaultPasswordHash,
      isEmailVerified: true,
    },
  });

  const bobManager = await prisma.user.upsert({
    where: { email: 'bob@acme.local' },
    update: { name: 'Bob Product Manager', isEmailVerified: true },
    create: {
      email: 'bob@acme.local',
      name: 'Bob Product Manager',
      passwordHash: defaultPasswordHash,
      isEmailVerified: true,
    },
  });

  const charlieDev = await prisma.user.upsert({
    where: { email: 'charlie@acme.local' },
    update: { name: 'Charlie Developer', isEmailVerified: true },
    create: {
      email: 'charlie@acme.local',
      name: 'Charlie Developer',
      passwordHash: defaultPasswordHash,
      isEmailVerified: true,
    },
  });

  // Acme Memberships
  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: acmeOrg.id, userId: aliceAdmin.id } },
    update: { role: Role.ORG_ADMIN },
    create: { organizationId: acmeOrg.id, userId: aliceAdmin.id, role: Role.ORG_ADMIN },
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: acmeOrg.id, userId: bobManager.id } },
    update: { role: Role.PROJECT_MANAGER },
    create: { organizationId: acmeOrg.id, userId: bobManager.id, role: Role.PROJECT_MANAGER },
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: acmeOrg.id, userId: charlieDev.id } },
    update: { role: Role.TEAM_MEMBER },
    create: { organizationId: acmeOrg.id, userId: charlieDev.id, role: Role.TEAM_MEMBER },
  });

  // Seed Acme Project 1
  const acmePlatformProject = await prisma.project.upsert({
    where: { organizationId_key: { organizationId: acmeOrg.id, key: 'ACME' } },
    update: {
      name: 'Core Platform Modernization',
      status: ProjectStatus.ACTIVE,
      priority: ProjectPriority.HIGH,
    },
    create: {
      organizationId: acmeOrg.id,
      name: 'Core Platform Modernization',
      key: 'ACME',
      description: 'Enterprise architecture migration to multi-tenant microservices & modern UI.',
      status: ProjectStatus.ACTIVE,
      priority: ProjectPriority.HIGH,
      managerId: bobManager.id,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });

  // Project Members
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: acmePlatformProject.id, userId: bobManager.id } },
    update: { role: 'Lead Architect' },
    create: { projectId: acmePlatformProject.id, userId: bobManager.id, role: 'Lead Architect' },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: acmePlatformProject.id, userId: charlieDev.id } },
    update: { role: 'Full-Stack Engineer' },
    create: { projectId: acmePlatformProject.id, userId: charlieDev.id, role: 'Full-Stack Engineer' },
  });

  // Seed Tasks across Kanban statuses for Acme
  const task1 = await prisma.task.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {
      title: 'Design Multi-Tenant Database Schema',
      status: TaskStatus.COMPLETED,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      organizationId: acmeOrg.id,
      projectId: acmePlatformProject.id,
      title: 'Design Multi-Tenant Database Schema',
      description: 'Implement compound indexes and foreign key cascades on all organization-scoped tables.',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.URGENT,
      creatorId: bobManager.id,
      assigneeId: charlieDev.id,
      order: 0,
      labels: ['database', 'architecture', 'security'],
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  const task2 = await prisma.task.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {
      title: 'Integrate Gemini AI Assistant Services',
      status: TaskStatus.IN_PROGRESS,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      organizationId: acmeOrg.id,
      projectId: acmePlatformProject.id,
      title: 'Integrate Gemini AI Assistant Services',
      description: 'Implement task breakdown, risk prediction, and productivity insight generators.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      creatorId: bobManager.id,
      assigneeId: charlieDev.id,
      order: 0,
      labels: ['ai', 'gemini', 'backend'],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.task.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {
      title: 'Configure Stripe Subscription Webhooks',
      status: TaskStatus.TODO,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      organizationId: acmeOrg.id,
      projectId: acmePlatformProject.id,
      title: 'Configure Stripe Subscription Webhooks',
      description: 'Ensure raw body verification and idempotent event handling.',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      creatorId: aliceAdmin.id,
      assigneeId: bobManager.id,
      order: 0,
      labels: ['billing', 'stripe'],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  // Seed Subtasks
  await prisma.subtask.upsert({
    where: { id: '00000000-0000-0000-0000-000000000011' },
    update: { isCompleted: true },
    create: {
      id: '00000000-0000-0000-0000-000000000011',
      organizationId: acmeOrg.id,
      taskId: task1.id,
      title: 'Add compound indexes for tenant queries',
      isCompleted: true,
      assigneeId: charlieDev.id,
      order: 0,
    },
  });

  await prisma.subtask.upsert({
    where: { id: '00000000-0000-0000-0000-000000000012' },
    update: { isCompleted: false },
    create: {
      id: '00000000-0000-0000-0000-000000000012',
      organizationId: acmeOrg.id,
      taskId: task2.id,
      title: 'Implement token usage tracking in AIRequest table',
      isCompleted: false,
      assigneeId: charlieDev.id,
      order: 0,
    },
  });

  // Seed Comment
  await prisma.comment.upsert({
    where: { id: '00000000-0000-0000-0000-000000000021' },
    update: { content: 'Database schema migration verified with multi-tenancy compound indexes.' },
    create: {
      id: '00000000-0000-0000-0000-000000000021',
      organizationId: acmeOrg.id,
      taskId: task1.id,
      userId: charlieDev.id,
      content: 'Database schema migration verified with multi-tenancy compound indexes.',
      mentions: [bobManager.id],
    },
  });

  // Seed AI Request Record
  await prisma.aIRequest.upsert({
    where: { id: '00000000-0000-0000-0000-000000000031' },
    update: { status: AIRequestStatus.SUCCESS },
    create: {
      id: '00000000-0000-0000-0000-000000000031',
      organizationId: acmeOrg.id,
      userId: bobManager.id,
      feature: AIFeature.TASK_ASSISTANT,
      model: 'gemini-2.5-flash',
      promptTokens: 250,
      completionTokens: 180,
      totalTokens: 430,
      status: AIRequestStatus.SUCCESS,
    },
  });

  // Seed Notification
  await prisma.notification.upsert({
    where: { id: '00000000-0000-0000-0000-000000000041' },
    update: { isRead: false },
    create: {
      id: '00000000-0000-0000-0000-000000000041',
      organizationId: acmeOrg.id,
      userId: charlieDev.id,
      type: NotificationType.TASK_ASSIGNED,
      title: 'New Task Assigned',
      message: 'Bob assigned you to "Integrate Gemini AI Assistant Services"',
      data: { taskId: task2.id, projectId: acmePlatformProject.id },
      isRead: false,
    },
  });

  // Seed Activity Log
  await prisma.activityLog.upsert({
    where: { id: '00000000-0000-0000-0000-000000000051' },
    update: { action: ActivityAction.TASK_STATUS_CHANGED },
    create: {
      id: '00000000-0000-0000-0000-000000000051',
      organizationId: acmeOrg.id,
      userId: charlieDev.id,
      projectId: acmePlatformProject.id,
      taskId: task1.id,
      action: ActivityAction.TASK_STATUS_CHANGED,
      metadata: { from: 'IN_PROGRESS', to: 'COMPLETED' },
    },
  });

  // 3. Seed Tenant 2: TechNova Innovations (For Multi-Tenancy Isolation Testing)
  const technovaOrg = await prisma.organization.upsert({
    where: { slug: 'technova' },
    update: { name: 'TechNova Innovations' },
    create: {
      name: 'TechNova Innovations',
      slug: 'technova',
      logoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop',
    },
  });

  await prisma.subscription.upsert({
    where: { organizationId: technovaOrg.id },
    update: {
      plan: PlanTier.BUSINESS,
      status: SubscriptionStatus.ACTIVE,
    },
    create: {
      organizationId: technovaOrg.id,
      stripeCustomerId: 'cus_technova_prod_67890',
      stripeSubscriptionId: 'sub_technova_biz_67890',
      stripePriceId: 'price_business_monthly',
      plan: PlanTier.BUSINESS,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
  });

  const davidAdmin = await prisma.user.upsert({
    where: { email: 'david@technova.local' },
    update: { name: 'David TechNova Lead', isEmailVerified: true },
    create: {
      email: 'david@technova.local',
      name: 'David TechNova Lead',
      passwordHash: defaultPasswordHash,
      isEmailVerified: true,
    },
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: technovaOrg.id, userId: davidAdmin.id } },
    update: { role: Role.ORG_ADMIN },
    create: { organizationId: technovaOrg.id, userId: davidAdmin.id, role: Role.ORG_ADMIN },
  });

  const technovaAIProject = await prisma.project.upsert({
    where: { organizationId_key: { organizationId: technovaOrg.id, key: 'TECH' } },
    update: { name: 'NextGen Autonomous Agents' },
    create: {
      organizationId: technovaOrg.id,
      name: 'NextGen Autonomous Agents',
      key: 'TECH',
      description: 'Distributed real-time worker fleet powered by generative AI.',
      status: ProjectStatus.ACTIVE,
      priority: ProjectPriority.URGENT,
      managerId: davidAdmin.id,
    },
  });

  await prisma.task.upsert({
    where: { id: '00000000-0000-0000-0000-000000000099' },
    update: { title: 'Implement Isolated Tenant Orchestrator' },
    create: {
      id: '00000000-0000-0000-0000-000000000099',
      organizationId: technovaOrg.id,
      projectId: technovaAIProject.id,
      title: 'Implement Isolated Tenant Orchestrator',
      description: 'Verify cross-tenant data boundaries and prevent IDOR attacks.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      creatorId: davidAdmin.id,
      assigneeId: davidAdmin.id,
      order: 0,
      labels: ['security', 'multi-tenancy'],
    },
  });

  console.info('✅ Idempotent database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Database seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
