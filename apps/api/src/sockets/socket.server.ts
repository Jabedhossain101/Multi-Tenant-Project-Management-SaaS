import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '@tasksaas/database';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    email: string;
    isSuperAdmin: boolean;
  };
}

let ioInstance: Server | null = null;

export function initSocketServer(server: HttpServer): Server {
  const io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });

  // Socket.IO JWT Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers.cookie
          ? parseCookie(socket.handshake.headers.cookie, 'access_token')
          : null);

      if (!token) {
        return next(new Error('Authentication error: Missing token'));
      }

      const payload = verifyAccessToken(token);
      socket.data = {
        userId: payload.userId,
        email: payload.email,
        isSuperAdmin: payload.isSuperAdmin,
      };

      next();
    } catch {
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    logger.info(`Socket connected: ${authSocket.id} (User: ${authSocket.data.userId})`);

    // Join Organization Room (Tenant isolation check)
    socket.on('join:organization', async ({ organizationId }: { organizationId: string }) => {
      try {
        const isMember = await prisma.organizationMember.findFirst({
          where: {
            organizationId,
            userId: authSocket.data.userId,
          },
        });

        if (isMember || authSocket.data.isSuperAdmin) {
          socket.join(`org:${organizationId}`);
          socket.emit('joined:organization', { organizationId, status: 'success' });
          logger.info(`Socket ${socket.id} joined org room org:${organizationId}`);
        } else {
          socket.emit('error:unauthorized', { message: 'Cannot join room: not an organization member' });
        }
      } catch {
        socket.emit('error', { message: 'Failed to join organization room' });
      }
    });

    // Join Project Room
    socket.on('join:project', async ({ projectId, organizationId }: { projectId: string; organizationId: string }) => {
      try {
        const project = await prisma.project.findFirst({
          where: { id: projectId, organizationId },
        });

        if (!project) {
          socket.emit('error:unauthorized', { message: 'Project not found in organization' });
          return;
        }

        const isMember = await prisma.organizationMember.findFirst({
          where: { organizationId, userId: authSocket.data.userId },
        });

        if (isMember || authSocket.data.isSuperAdmin) {
          socket.join(`project:${projectId}`);
          socket.emit('joined:project', { projectId, status: 'success' });
        } else {
          socket.emit('error:unauthorized', { message: 'Cannot join project room' });
        }
      } catch {
        socket.emit('error', { message: 'Failed to join project room' });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  ioInstance = io;
  return io;
}

export function getSocketIO(): Server | null {
  return ioInstance;
}

export function emitToOrganization(organizationId: string, event: string, data: unknown): void {
  if (ioInstance) {
    ioInstance.to(`org:${organizationId}`).emit(event, data);
  }
}

export function emitToProject(projectId: string, event: string, data: unknown): void {
  if (ioInstance) {
    ioInstance.to(`project:${projectId}`).emit(event, data);
  }
}

function parseCookie(cookieHeader: string, cookieName: string): string | null {
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === cookieName) {
      return decodeURIComponent(value || '');
    }
  }
  return null;
}
