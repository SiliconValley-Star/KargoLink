"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggers = exports.addRequestId = exports.loggerStream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
}), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({
    format: 'HH:mm:ss'
}), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
        log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return log;
}));
const logsDir = path_1.default.join(process.cwd(), 'logs');
const transports = [
    new winston_1.default.transports.Console({
        level: process.env.LOG_LEVEL || 'info',
        format: consoleFormat
    })
];
if (process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true') {
    transports.push(new winston_1.default.transports.File({
        filename: path_1.default.join(logsDir, 'error.log'),
        level: 'error',
        format: logFormat,
        maxsize: 5242880,
        maxFiles: 10
    }), new winston_1.default.transports.File({
        filename: path_1.default.join(logsDir, 'combined.log'),
        format: logFormat,
        maxsize: 5242880,
        maxFiles: 10
    }));
}
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports,
    exitOnError: false
});
exports.loggerStream = {
    write: (message) => {
        exports.logger.info(message.trim());
    }
};
const addRequestId = (requestId) => {
    return exports.logger.child({ requestId });
};
exports.addRequestId = addRequestId;
exports.loggers = {
    auth: exports.logger.child({ service: 'auth' }),
    api: exports.logger.child({ service: 'api' }),
    database: exports.logger.child({ service: 'database' }),
    payment: exports.logger.child({ service: 'payment' }),
    cargo: exports.logger.child({ service: 'cargo' }),
    email: exports.logger.child({ service: 'email' }),
    sms: exports.logger.child({ service: 'sms' })
};
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map