/* eslint-disable no-console */
export interface LogMeta {
  requestId?: string;
  userId?: string;
  organizationId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  [key: string]: unknown;
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    console.info(
      JSON.stringify({
        level: 'INFO',
        timestamp: new Date().toISOString(),
        message,
        ...meta,
      }),
    );
  },

  warn(message: string, meta?: LogMeta) {
    console.warn(
      JSON.stringify({
        level: 'WARN',
        timestamp: new Date().toISOString(),
        message,
        ...meta,
      }),
    );
  },

  error(message: string, error?: unknown, meta?: LogMeta) {
    const errorDetails =
      error instanceof Error
        ? { errorName: error.name, errorMessage: error.message, stack: error.stack }
        : { error };

    console.error(
      JSON.stringify({
        level: 'ERROR',
        timestamp: new Date().toISOString(),
        message,
        ...errorDetails,
        ...meta,
      }),
    );
  },

  debug(message: string, meta?: LogMeta) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(
        JSON.stringify({
          level: 'DEBUG',
          timestamp: new Date().toISOString(),
          message,
          ...meta,
        }),
      );
    }
  },
};
