import { Role } from '../constants/roles.js';
import { PlanTier } from '../constants/plans.js';
import {
  ProjectStatus,
  ProjectPriority,
  TaskStatus,
  TaskPriority,
  SubscriptionStatus,
  NotificationType,
  ActivityAction,
} from '../constants/index.js';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationDto {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  plan: PlanTier;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMemberDto {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  user: UserDto;
  createdAt: string;
}

export interface ProjectDto {
  id: string;
  organizationId: string;
  name: string;
  key: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string | null;
  deadline: string | null;
  managerId: string | null;
  manager?: UserDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDto {
  id: string;
  organizationId: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assigneeId: string | null;
  assignee?: UserDto | null;
  creatorId: string;
  order: number;
  labels: string[];
  subtasksCount?: number;
  completedSubtasksCount?: number;
  commentsCount?: number;
  attachmentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubtaskDto {
  id: string;
  organizationId: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  assigneeId: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentDto {
  id: string;
  organizationId: string;
  taskId: string;
  userId: string;
  user: UserDto;
  content: string;
  mentions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDto {
  id: string;
  organizationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLogDto {
  id: string;
  organizationId: string;
  userId: string;
  user?: UserDto;
  projectId?: string | null;
  taskId?: string | null;
  action: ActivityAction;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface SubscriptionDto {
  id: string;
  organizationId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  plan: PlanTier;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  isSuperAdmin: boolean;
  organizationId?: string;
  role?: Role;
}
