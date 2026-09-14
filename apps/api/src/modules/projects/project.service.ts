import {
  ConflictError,
  NotFoundError,
  PlanLimitError,
  PLAN_LIMITS,
  type PlanTier,
  type CreateProjectInput,
  type UpdateProjectInput,
  type ProjectStatus,
  type ProjectPriority,
} from '@tasksaas/shared';
import { projectRepository, type ProjectFilterParams } from './project.repository.js';
import { organizationRepository } from '../organizations/organization.repository.js';

export class ProjectService {
  async getProjects(params: ProjectFilterParams) {
    return projectRepository.findMany(params);
  }

  async getProject(projectId: string, organizationId: string) {
    const project = await projectRepository.findByIdAndOrg(projectId, organizationId);
    if (!project) {
      throw new NotFoundError('Project', projectId);
    }
    return project;
  }

  async createProject(organizationId: string, input: CreateProjectInput) {
    // 1. Check Plan limits
    const org = await organizationRepository.findById(organizationId);
    const plan = ((org as unknown as { subscription?: { plan: PlanTier } }).subscription?.plan || 'FREE') as PlanTier;
    const currentProjectCount = await projectRepository.countByOrg(organizationId);

    const limits = PLAN_LIMITS[plan];
    if (currentProjectCount >= limits.maxProjects) {
      throw new PlanLimitError(
        `Plan project limit reached (${limits.maxProjects} projects). Upgrade to PRO or BUSINESS to create more projects.`,
      );
    }

    // 2. Validate Project Key uniqueness within organization
    const existingKey = await projectRepository.findByKeyAndOrg(input.key.toUpperCase(), organizationId);
    if (existingKey) {
      throw new ConflictError(`Project with key '${input.key.toUpperCase()}' already exists in this organization`);
    }

    return projectRepository.create({
      organizationId,
      name: input.name,
      key: input.key.toUpperCase(),
      description: input.description,
      status: input.status as ProjectStatus,
      priority: input.priority as ProjectPriority,
      startDate: input.startDate ? new Date(input.startDate) : null,
      deadline: input.deadline ? new Date(input.deadline) : null,
      managerId: input.managerId,
    });
  }

  async updateProject(projectId: string, organizationId: string, input: UpdateProjectInput) {
    await this.getProject(projectId, organizationId);

    if (input.key) {
      const existingKey = await projectRepository.findByKeyAndOrg(input.key.toUpperCase(), organizationId);
      if (existingKey && existingKey.id !== projectId) {
        throw new ConflictError(`Project key '${input.key.toUpperCase()}' is already in use`);
      }
    }

    return projectRepository.update(projectId, organizationId, {
      ...(input.name && { name: input.name }),
      ...(input.key && { key: input.key.toUpperCase() }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.status && { status: input.status as ProjectStatus }),
      ...(input.priority && { priority: input.priority as ProjectPriority }),
      ...(input.startDate !== undefined && { startDate: input.startDate ? new Date(input.startDate) : null }),
      ...(input.deadline !== undefined && { deadline: input.deadline ? new Date(input.deadline) : null }),
      ...(input.managerId !== undefined && { managerId: input.managerId }),
    });
  }

  async archiveProject(projectId: string, organizationId: string) {
    await this.getProject(projectId, organizationId);
    return projectRepository.update(projectId, organizationId, { isArchived: true });
  }

  async restoreProject(projectId: string, organizationId: string) {
    await this.getProject(projectId, organizationId);
    return projectRepository.update(projectId, organizationId, { isArchived: false });
  }

  async deleteProject(projectId: string, organizationId: string) {
    await this.getProject(projectId, organizationId);
    await projectRepository.delete(projectId, organizationId);
  }

  async addProjectMember(projectId: string, organizationId: string, userId: string, role?: string) {
    await this.getProject(projectId, organizationId);
    await projectRepository.addMember(projectId, userId, role);
  }

  async removeProjectMember(projectId: string, organizationId: string, userId: string) {
    await this.getProject(projectId, organizationId);
    await projectRepository.removeMember(projectId, userId);
  }

  async getProjectAnalytics(projectId: string, organizationId: string) {
    await this.getProject(projectId, organizationId);
    return projectRepository.getAnalytics(projectId, organizationId);
  }
}

export const projectService = new ProjectService();
