import http from 'http';
import { app } from './app.js';
import { env } from './config/env.js';

const server = http.createServer(app);

server.listen(env.PORT, () => {
  console.info(`🚀 API Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});
