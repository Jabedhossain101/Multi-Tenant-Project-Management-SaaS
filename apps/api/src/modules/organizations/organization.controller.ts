import type { Request, Response, NextFunction } from 'express';
import { organizationService } from './organization.service.js';
import { sendSuccess } from '../../utils/response.js';

export class OrganizationController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const org = await organizationService.createOrganization(req.user!.id, req.body);
      sendSuccess(res, org, 201);
    } catch (error) {
      next(error);
    }
  }

  async listUserOrgs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgs = await organizationService.getUserOrganizations(req.user!.id);
      sendSuccess(res, orgs);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const org = await organizationService.getOrganization(orgId);
      sendSuccess(res, org);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const updated = await organizationService.updateOrganization(orgId, req.body);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      await organizationService.deleteOrganization(orgId);
      sendSuccess(res, { message: 'Organization deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async switchOrg(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orgId } = req.params;
      const result = await organizationService.switchOrganization(req.user!.id, orgId!);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const members = await organizationService.getMembers(orgId);
      sendSuccess(res, members);
    } catch (error) {
      next(error);
    }
  }

  async inviteMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const invitation = await organizationService.inviteMember(orgId, req.body);
      sendSuccess(res, invitation, 201);
    } catch (error) {
      next(error);
    }
  }

  async acceptInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const result = await organizationService.acceptInvitation(token!, req.user!.id);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { memberId } = req.params;
      const { role } = req.body;
      const updated = await organizationService.updateMemberRole(orgId, req.user!.id, memberId!, role);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.tenant!.organizationId;
      const { memberId } = req.params;
      await organizationService.removeMember(orgId, req.user!.id, memberId!);
      sendSuccess(res, { message: 'Member removed from organization' });
    } catch (error) {
      next(error);
    }
  }
}

export const organizationController = new OrganizationController();
