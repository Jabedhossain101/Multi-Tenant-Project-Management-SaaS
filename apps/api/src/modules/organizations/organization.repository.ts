import { prisma, type Organization, type OrganizationMember, type Invitation, type Role } from '@tasksaas/database';

export class OrganizationRepository {
  async findById(id: string): Promise<Organization | null> {
    return prisma.organization.findUnique({
      where: { id },
      include: {
        subscription: true,
      },
    });
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    return prisma.organization.findUnique({
      where: { slug },
    });
  }

  async findUserOrganizations(userId: string): Promise<(Organization & { role: Role; membersCount: number })[]> {
    const memberships = await prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            subscription: true,
            _count: {
              select: { members: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((m) => ({
      ...m.organization,
      role: m.role as Role,
      membersCount: m.organization._count.members,
    }));
  }

  async create(data: { name: string; slug: string; userId: string; logoUrl?: string | null }): Promise<Organization> {
    return prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.name,
          slug: data.slug,
          logoUrl: data.logoUrl,
        },
      });

      await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: data.userId,
          role: 'ORG_ADMIN',
        },
      });

      await tx.subscription.create({
        data: {
          organizationId: org.id,
          stripeCustomerId: `cus_${org.id.slice(0, 10)}`,
          plan: 'FREE',
          status: 'ACTIVE',
        },
      });

      return org;
    });
  }

  async update(id: string, data: { name?: string; slug?: string; logoUrl?: string | null }): Promise<Organization> {
    return prisma.organization.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.organization.delete({
      where: { id },
    });
  }

  async getMembers(organizationId: string): Promise<(OrganizationMember & { user: { id: string; name: string; email: string; avatarUrl: string | null } })[]> {
    return prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findMember(organizationId: string, userId: string): Promise<OrganizationMember | null> {
    return prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
  }

  async updateMemberRole(organizationId: string, userId: string, role: Role): Promise<OrganizationMember> {
    return prisma.organizationMember.update({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      data: { role },
    });
  }

  async removeMember(organizationId: string, userId: string): Promise<void> {
    await prisma.organizationMember.delete({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
  }

  async countMembers(organizationId: string): Promise<number> {
    return prisma.organizationMember.count({
      where: { organizationId },
    });
  }

  async createInvitation(data: {
    organizationId: string;
    email: string;
    role: Role;
    token: string;
    expiresAt: Date;
  }): Promise<Invitation> {
    return prisma.invitation.create({
      data,
    });
  }

  async findInvitationByToken(token: string): Promise<(Invitation & { organization: Organization }) | null> {
    return prisma.invitation.findUnique({
      where: { token },
      include: { organization: true },
    });
  }

  async acceptInvitation(invitationId: string, organizationId: string, userId: string, role: Role): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.invitation.update({
        where: { id: invitationId },
        data: { status: 'ACCEPTED' },
      });

      await tx.organizationMember.create({
        data: {
          organizationId,
          userId,
          role,
        },
      });
    });
  }
}

export const organizationRepository = new OrganizationRepository();
