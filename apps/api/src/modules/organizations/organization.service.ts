import crypto from 'crypto';
import {
  ConflictError,
  NotFoundError,
  AuthorizationError,
  PlanLimitError,
  PLAN_LIMITS,
  type Role,
  type PlanTier,
  type CreateOrganizationInput,
  type UpdateOrganizationInput,
  type InviteMemberInput,
} from '@tasksaas/shared';
import { organizationRepository } from './organization.repository.js';
import { authRepository } from '../auth/auth.repository.js';
import { generateAccessToken } from '../../utils/jwt.js';

export class OrganizationService {
  async createOrganization(userId: string, input: CreateOrganizationInput) {
    const slug =
      input.slug ||
      input.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 40) + `-${Date.now().toString().slice(-4)}`;

    const existingSlug = await organizationRepository.findBySlug(slug);
    if (existingSlug) {
      throw new ConflictError(`Organization slug '${slug}' is already taken`);
    }

    return organizationRepository.create({
      name: input.name,
      slug,
      userId,
    });
  }

  async getUserOrganizations(userId: string) {
    return organizationRepository.findUserOrganizations(userId);
  }

  async getOrganization(organizationId: string) {
    const org = await organizationRepository.findById(organizationId);
    if (!org) {
      throw new NotFoundError('Organization', organizationId);
    }
    return org;
  }

  async updateOrganization(organizationId: string, input: UpdateOrganizationInput) {
    const org = await this.getOrganization(organizationId);

    if (input.slug && input.slug !== org.slug) {
      const existingSlug = await organizationRepository.findBySlug(input.slug);
      if (existingSlug) {
        throw new ConflictError(`Organization slug '${input.slug}' is already taken`);
      }
    }

    return organizationRepository.update(organizationId, input);
  }

  async deleteOrganization(organizationId: string) {
    await this.getOrganization(organizationId);
    await organizationRepository.delete(organizationId);
  }

  async switchOrganization(userId: string, organizationId: string) {
    const member = await organizationRepository.findMember(organizationId, userId);
    if (!member) {
      throw new AuthorizationError('You are not a member of this organization');
    }

    const user = await authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }

    const org = await this.getOrganization(organizationId);

    const token = generateAccessToken({
      userId: user.id,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
      organizationId: org.id,
      role: member.role as Role,
    });

    return { token, organization: org, role: member.role };
  }

  async getMembers(organizationId: string) {
    return organizationRepository.getMembers(organizationId);
  }

  async inviteMember(organizationId: string, input: InviteMemberInput) {
    const org = await this.getOrganization(organizationId);
    const plan = ((org as unknown as { subscription?: { plan: PlanTier } }).subscription?.plan || 'FREE') as PlanTier;
    const currentMemberCount = await organizationRepository.countMembers(organizationId);

    const limits = PLAN_LIMITS[plan];
    if (currentMemberCount >= limits.maxMembers) {
      throw new PlanLimitError(
        `Plan seat limit reached (${limits.maxMembers} members). Upgrade to PRO or BUSINESS to invite more teammates.`,
      );
    }

    const existingUser = await authRepository.findByEmail(input.email);
    if (existingUser) {
      const existingMember = await organizationRepository.findMember(organizationId, existingUser.id);
      if (existingMember) {
        throw new ConflictError(`User '${input.email}' is already a member of this organization`);
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await organizationRepository.createInvitation({
      organizationId,
      email: input.email,
      role: input.role as Role,
      token,
      expiresAt,
    });

    return {
      invitationId: invitation.id,
      email: invitation.email,
      role: invitation.role,
      token: invitation.token,
      expiresAt: invitation.expiresAt,
    };
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await organizationRepository.findInvitationByToken(token);
    if (!invitation || invitation.status !== 'PENDING') {
      throw new NotFoundError('Invitation is invalid or has already been used');
    }

    if (new Date() > invitation.expiresAt) {
      throw new AuthorizationError('Invitation token has expired');
    }

    const user = await authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }

    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new AuthorizationError(
        `This invitation was issued for ${invitation.email}, but you are signed in as ${user.email}`,
      );
    }

    const currentMember = await organizationRepository.findMember(invitation.organizationId, userId);
    if (currentMember) {
      throw new ConflictError('You are already a member of this organization');
    }

    await organizationRepository.acceptInvitation(
      invitation.id,
      invitation.organizationId,
      userId,
      invitation.role as Role,
    );

    return {
      organizationId: invitation.organizationId,
      organizationName: invitation.organization.name,
      role: invitation.role,
    };
  }

  async updateMemberRole(organizationId: string, userId: string, targetUserId: string, newRole: Role) {
    if (userId === targetUserId) {
      throw new AuthorizationError('You cannot change your own role');
    }

    const targetMember = await organizationRepository.findMember(organizationId, targetUserId);
    if (!targetMember) {
      throw new NotFoundError('Member not found in organization');
    }

    return organizationRepository.updateMemberRole(organizationId, targetUserId, newRole);
  }

  async removeMember(organizationId: string, userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new AuthorizationError('You cannot remove yourself from the organization');
    }

    const targetMember = await organizationRepository.findMember(organizationId, targetUserId);
    if (!targetMember) {
      throw new NotFoundError('Member not found in organization');
    }

    await organizationRepository.removeMember(organizationId, targetUserId);
  }
}

export const organizationService = new OrganizationService();
