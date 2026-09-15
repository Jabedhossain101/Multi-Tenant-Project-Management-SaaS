import http from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { initSocketServer } from './sockets/socket.server.js';
import { logger } from './utils/logger.js';

const server = http.createServer(app);

// Initialize real-time Socket.IO server
initSocketServer(server);

server.listen(env.PORT, () => {
  logger.info(`🚀 API Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});

const shutdown = (signal: string) => {
  logger.info(`${signal} signal received: closing HTTP server`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
