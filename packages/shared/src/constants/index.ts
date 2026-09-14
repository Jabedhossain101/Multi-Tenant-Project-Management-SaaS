export * from './roles.js';
export * from './plans.js';

export const TaskStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  COMPLETED: 'COMPLETED',
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

export const ProjectStatus = {
  PLANNING: 'PLANNING',
  ACTIVE: 'ACTIVE',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const ProjectPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type ProjectPriority = (typeof ProjectPriority)[keyof typeof ProjectPriority];

export const SubscriptionStatus = {
  TRIALING: 'TRIALING',
  ACTIVE: 'ACTIVE',
  PAST_DUE: 'PAST_DUE',
  CANCELED: 'CANCELED',
  UNPAID: 'UNPAID',
  INCOMPLETE: 'INCOMPLETE',
} as const;

export type SubscriptionStatus =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const InvitationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const;

export type InvitationStatus = (typeof InvitationStatus)[keyof typeof InvitationStatus];

export const NotificationType = {
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  MENTION: 'MENTION',
  DEADLINE_REMINDER: 'DEADLINE_REMINDER',
  PROJECT_UPDATE: 'PROJECT_UPDATE',
  ORG_INVITATION: 'ORG_INVITATION',
  BILLING_EVENT: 'BILLING_EVENT',
  AI_REPORT_READY: 'AI_REPORT_READY',
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const ActivityAction = {
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  PROJECT_ARCHIVED: 'PROJECT_ARCHIVED',
  TASK_CREATED: 'TASK_CREATED',
  TASK_UPDATED: 'TASK_UPDATED',
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  TASK_STATUS_CHANGED: 'TASK_STATUS_CHANGED',
  TASK_DELETED: 'TASK_DELETED',
  COMMENT_ADDED: 'COMMENT_ADDED',
  FILE_UPLOADED: 'FILE_UPLOADED',
  MEMBER_INVITED: 'MEMBER_INVITED',
  MEMBER_JOINED: 'MEMBER_JOINED',
  MEMBER_REMOVED: 'MEMBER_REMOVED',
  SUBSCRIPTION_CHANGED: 'SUBSCRIPTION_CHANGED',
} as const;

export type ActivityAction = (typeof ActivityAction)[keyof typeof ActivityAction];

export const AIModel = {
  GEMINI_2_5_FLASH: 'gemini-2.5-flash',
  GEMINI_2_5_PRO: 'gemini-2.5-pro',
} as const;

export type AIModel = (typeof AIModel)[keyof typeof AIModel];

export const AIFeature = {
  TASK_ASSISTANT: 'TASK_ASSISTANT',
  PROJECT_ASSISTANT: 'PROJECT_ASSISTANT',
  PRODUCTIVITY_INSIGHTS: 'PRODUCTIVITY_INSIGHTS',
} as const;

export type AIFeature = (typeof AIFeature)[keyof typeof AIFeature];
