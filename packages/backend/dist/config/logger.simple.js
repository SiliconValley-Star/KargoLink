"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggers = exports.addRequestId = exports.loggerStream = exports.logger = void 0;
exports.logger = {
    info: (message, meta) => {
        console.log(`[INFO] ${new Date().toISOString()}: ${message}`, meta || '');
    },
    error: (message, error) => {
        console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '');
    },
    warn: (message, meta) => {
        console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, meta || '');
    },
    debug: (message, meta) => {
        console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, meta || '');
    },
    child: (meta) => ({
        info: (message, extraMeta) => exports.logger.info(message, { ...meta, ...extraMeta }),
        error: (message, error) => exports.logger.error(message, error),
        warn: (message, extraMeta) => exports.logger.warn(message, { ...meta, ...extraMeta }),
        debug: (message, extraMeta) => exports.logger.debug(message, { ...meta, ...extraMeta })
    })
};
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
//# sourceMappingURL=logger.simple.js.map