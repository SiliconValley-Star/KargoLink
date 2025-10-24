// Simple console logger - temporary fix for winston syslog issue
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, meta || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, meta || '');
  },
  debug: (message: string, meta?: any) => {
    console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, meta || '');
  },
  child: (meta: any) => ({
    info: (message: string, extraMeta?: any) => logger.info(message, { ...meta, ...extraMeta }),
    error: (message: string, error?: any) => logger.error(message, error),
    warn: (message: string, extraMeta?: any) => logger.warn(message, { ...meta, ...extraMeta }),
    debug: (message: string, extraMeta?: any) => logger.debug(message, { ...meta, ...extraMeta })
  })
};

export const loggerStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

export const addRequestId = (requestId: string) => {
  return logger.child({ requestId });
};

export const loggers = {
  auth: logger.child({ service: 'auth' }),
  api: logger.child({ service: 'api' }),
  database: logger.child({ service: 'database' }),
  payment: logger.child({ service: 'payment' }),
  cargo: logger.child({ service: 'cargo' }),
  email: logger.child({ service: 'email' }),
  sms: logger.child({ service: 'sms' })
};

export default logger;