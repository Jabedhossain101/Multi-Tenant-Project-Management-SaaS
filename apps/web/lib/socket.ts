import { io, Socket } from 'socket.io-client';
import { queryClient } from './query-client.js';

let socket: Socket | null = null;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? window.location.origin
    : 'http://localhost:5000');

export function getSocket(): Socket | null {
  return socket;
}

export function initSocket(): Socket {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    // Socket connected
  });

  socket.on('disconnect', () => {
    // Socket disconnected
  });

  // Global real-time cache invalidation listeners
  socket.on('task:created', () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  });

  socket.on('task:updated', (data: { taskId?: string }) => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    if (data?.taskId) {
      queryClient.invalidateQueries({ queryKey: ['task', data.taskId] });
    }
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  });

  socket.on('task:deleted', () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  });

  socket.on('comment:created', (data: { taskId?: string }) => {
    if (data?.taskId) {
      queryClient.invalidateQueries({ queryKey: ['comments', data.taskId] });
    }
  });

  socket.on('notification:new', () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
  });

  return socket;
}

export function joinOrganizationRoom(organizationId: string): void {
  const s = socket || initSocket();
  s.emit('join:organization', { organizationId });
}

export function joinProjectRoom(projectId: string, organizationId: string): void {
  const s = socket || initSocket();
  s.emit('join:project', { projectId, organizationId });
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
