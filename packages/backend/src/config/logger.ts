import winston from 'winston';
import path from 'path';

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: consoleFormat
  })
];

// Add file transports in production or when LOG_TO_FILE is enabled
if (process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true') {
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 10
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 10
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exitOnError: false
});

// Create a stream for HTTP request logging (Morgan)
export const loggerStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

// Add request ID to logger for tracing
export const addRequestId = (requestId: string) => {
  return logger.child({ requestId });
};

// Helper functions for common log patterns
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