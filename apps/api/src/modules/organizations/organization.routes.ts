import { Router } from 'express';
import { organizationController } from './organization.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireTenant } from '../../middleware/tenant.middleware.js';
import { requireRole, requirePermission } from '../../middleware/rbac.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { Role, Permission, createOrganizationSchema, updateOrganizationSchema, inviteMemberSchema, updateMemberRoleSchema } from '@tasksaas/shared';

const router: Router = Router();

// All organization routes require user authentication
router.use(requireAuth);

// Create new organization
router.post(
  '/',
  validateBody(createOrganizationSchema),
  organizationController.create.bind(organizationController),
);

// List all organizations user belongs to
router.get(
  '/me',
  organizationController.listUserOrgs.bind(organizationController),
);

// Switch active organization context
router.post(
  '/:orgId/switch',
  organizationController.switchOrg.bind(organizationController),
);

// Accept invitation
router.post(
  '/invitations/:token/accept',
  organizationController.acceptInvitation.bind(organizationController),
);

// Active tenant-scoped operations
router.get(
  '/',
  requireTenant,
  organizationController.getOne.bind(organizationController),
);

router.patch(
  '/',
  requireTenant,
  requireRole(Role.ORG_ADMIN),
  validateBody(updateOrganizationSchema),
  organizationController.update.bind(organizationController),
);

router.delete(
  '/',
  requireTenant,
  requireRole(Role.ORG_ADMIN),
  organizationController.delete.bind(organizationController),
);

// Member management
router.get(
  '/members',
  requireTenant,
  organizationController.getMembers.bind(organizationController),
);

router.post(
  '/members/invite',
  requireTenant,
  requirePermission(Permission.ORG_INVITE_MEMBER),
  validateBody(inviteMemberSchema),
  organizationController.inviteMember.bind(organizationController),
);

router.patch(
  '/members/:memberId/role',
  requireTenant,
  requirePermission(Permission.ORG_UPDATE_MEMBER_ROLE),
  validateBody(updateMemberRoleSchema),
  organizationController.updateRole.bind(organizationController),
);

router.delete(
  '/members/:memberId',
  requireTenant,
  requirePermission(Permission.ORG_REMOVE_MEMBER),
  organizationController.removeMember.bind(organizationController),
);

export default router;
