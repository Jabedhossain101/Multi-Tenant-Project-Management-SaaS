export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ORG_ADMIN: 'ORG_ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  TEAM_MEMBER: 'TEAM_MEMBER',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const Permission = {
  // Organization permissions
  ORG_READ: 'org:read',
  ORG_UPDATE: 'org:update',
  ORG_DELETE: 'org:delete',
  ORG_INVITE_MEMBER: 'org:invite_member',
  ORG_REMOVE_MEMBER: 'org:remove_member',
  ORG_UPDATE_MEMBER_ROLE: 'org:update_member_role',
  ORG_MANAGE_BILLING: 'org:manage_billing',
  ORG_VIEW_ANALYTICS: 'org:view_analytics',
  ORG_VIEW_AUDIT_LOGS: 'org:view_audit_logs',

  // Project permissions
  PROJECT_CREATE: 'project:create',
  PROJECT_READ: 'project:read',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  PROJECT_ARCHIVE: 'project:archive',
  PROJECT_MANAGE_MEMBERS: 'project:manage_members',

  // Task permissions
  TASK_CREATE: 'task:create',
  TASK_READ: 'task:read',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',
  TASK_ASSIGN: 'task:assign',

  // Comments & collaboration
  COMMENT_CREATE: 'comment:create',
  COMMENT_UPDATE: 'comment:update',
  COMMENT_DELETE: 'comment:delete',

  // File management
  FILE_UPLOAD: 'file:upload',
  FILE_READ: 'file:read',
  FILE_DELETE: 'file:delete',

  // AI capabilities
  AI_USE: 'ai:use',

  // Super admin platform permissions
  PLATFORM_ADMIN: 'platform:admin',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  SUPER_ADMIN: Object.values(Permission),

  ORG_ADMIN: [
    Permission.ORG_READ,
    Permission.ORG_UPDATE,
    Permission.ORG_DELETE,
    Permission.ORG_INVITE_MEMBER,
    Permission.ORG_REMOVE_MEMBER,
    Permission.ORG_UPDATE_MEMBER_ROLE,
    Permission.ORG_MANAGE_BILLING,
    Permission.ORG_VIEW_ANALYTICS,
    Permission.ORG_VIEW_AUDIT_LOGS,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.PROJECT_ARCHIVE,
    Permission.PROJECT_MANAGE_MEMBERS,
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.TASK_ASSIGN,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_UPDATE,
    Permission.COMMENT_DELETE,
    Permission.FILE_UPLOAD,
    Permission.FILE_READ,
    Permission.FILE_DELETE,
    Permission.AI_USE,
  ],

  PROJECT_MANAGER: [
    Permission.ORG_READ,
    Permission.ORG_VIEW_ANALYTICS,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_ARCHIVE,
    Permission.PROJECT_MANAGE_MEMBERS,
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.TASK_ASSIGN,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_UPDATE,
    Permission.COMMENT_DELETE,
    Permission.FILE_UPLOAD,
    Permission.FILE_READ,
    Permission.FILE_DELETE,
    Permission.AI_USE,
  ],

  TEAM_MEMBER: [
    Permission.ORG_READ,
    Permission.PROJECT_READ,
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_UPDATE,
    Permission.FILE_UPLOAD,
    Permission.FILE_READ,
    Permission.AI_USE,
  ],
};
