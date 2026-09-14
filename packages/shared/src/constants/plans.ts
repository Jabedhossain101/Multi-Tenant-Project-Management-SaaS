export const PlanTier = {
  FREE: 'FREE',
  PRO: 'PRO',
  BUSINESS: 'BUSINESS',
} as const;

export type PlanTier = (typeof PlanTier)[keyof typeof PlanTier];

export interface PlanLimits {
  maxProjects: number;
  maxMembers: number;
  maxStorageBytes: number; // In bytes
  maxAiRequestsPerMonth: number;
  features: {
    advancedAnalytics: boolean;
    auditLogs: boolean;
    prioritySupport: boolean;
    customRoles: boolean;
  };
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  FREE: {
    maxProjects: 3,
    maxMembers: 5,
    maxStorageBytes: 100 * 1024 * 1024, // 100 MB
    maxAiRequestsPerMonth: 20,
    features: {
      advancedAnalytics: false,
      auditLogs: false,
      prioritySupport: false,
      customRoles: false,
    },
  },
  PRO: {
    maxProjects: 20,
    maxMembers: 25,
    maxStorageBytes: 10 * 1024 * 1024 * 1024, // 10 GB
    maxAiRequestsPerMonth: 500,
    features: {
      advancedAnalytics: true,
      auditLogs: true,
      prioritySupport: false,
      customRoles: false,
    },
  },
  BUSINESS: {
    maxProjects: 1000,
    maxMembers: 200,
    maxStorageBytes: 100 * 1024 * 1024 * 1024, // 100 GB
    maxAiRequestsPerMonth: 5000,
    features: {
      advancedAnalytics: true,
      auditLogs: true,
      prioritySupport: true,
      customRoles: true,
    },
  },
};
