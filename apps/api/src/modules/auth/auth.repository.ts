import { prisma, type User, type Session } from '@tasksaas/database';

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async createUserWithOrg(data: {
    email: string;
    name: string;
    passwordHash: string;
    organizationName?: string;
  }): Promise<{ user: User; organizationId?: string }> {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          name: data.name,
          passwordHash: data.passwordHash,
          isEmailVerified: false,
        },
      });

      let orgId: string | undefined;

      if (data.organizationName) {
        const slug = data.organizationName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .slice(0, 40) + `-${Date.now().toString().slice(-4)}`;

        const org = await tx.organization.create({
          data: {
            name: data.organizationName,
            slug,
          },
        });

        await tx.organizationMember.create({
          data: {
            organizationId: org.id,
            userId: user.id,
            role: 'ORG_ADMIN',
          },
        });

        await tx.subscription.create({
          data: {
            organizationId: org.id,
            stripeCustomerId: `cus_trial_${user.id.slice(0, 8)}`,
            plan: 'FREE',
            status: 'ACTIVE',
          },
        });

        orgId = org.id;
      }

      return { user, organizationId: orgId };
    });
  }

  async createSession(data: {
    userId: string;
    token: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<Session> {
    return prisma.session.create({
      data,
    });
  }

  async findSessionByToken(token: string): Promise<Session | null> {
    return prisma.session.findUnique({
      where: { token },
    });
  }

  async deleteSessionByToken(token: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { token },
    });
  }

  async deleteSessionsByUserId(userId: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { userId },
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async markEmailVerified(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
    });
  }
}

export const authRepository = new AuthRepository();
