"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPaginatedResponse = exports.sendSuccessResponse = exports.notFoundHandler = exports.catchAsync = exports.errorHandler = exports.HTTP_STATUS = exports.AppError = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const logger_1 = require("../config/logger");
const environment_1 = require("../config/environment");
class AppError extends Error {
    statusCode;
    isOperational;
    code;
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    REQUEST_ENTITY_TOO_LARGE: 413,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};
const handleZodError = (error) => {
    const errors = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
    }));
    return new AppError('Validation failed', exports.HTTP_STATUS.UNPROCESSABLE_ENTITY);
};
const handlePrismaError = (error) => {
    switch (error.code) {
        case 'P2002':
            return new AppError('A record with this value already exists', exports.HTTP_STATUS.CONFLICT);
        case 'P2025':
            return new AppError('Record not found', exports.HTTP_STATUS.NOT_FOUND);
        case 'P2003':
            return new AppError('Foreign key constraint failed', exports.HTTP_STATUS.BAD_REQUEST);
        case 'P2021':
            return new AppError('Table does not exist', exports.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        case 'P2022':
            return new AppError('Column does not exist', exports.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        default:
            return new AppError('Database operation failed', exports.HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
const handleJWTError = () => {
    return new AppError('Invalid token', exports.HTTP_STATUS.UNAUTHORIZED);
};
const handleJWTExpiredError = () => {
    return new AppError('Token expired', exports.HTTP_STATUS.UNAUTHORIZED);
};
const handleMulterError = (error) => {
    if (error.code === 'LIMIT_FILE_SIZE') {
        return new AppError('File too large', exports.HTTP_STATUS.BAD_REQUEST);
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
        return new AppError('Too many files', exports.HTTP_STATUS.BAD_REQUEST);
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return new AppError('Unexpected file field', exports.HTTP_STATUS.BAD_REQUEST);
    }
    return new AppError('File upload failed', exports.HTTP_STATUS.BAD_REQUEST);
};
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        success: false,
        error: {
            message: err.message,
            stack: err.stack,
            code: err.code,
            statusCode: err.statusCode,
        },
        timestamp: new Date().toISOString(),
    });
};
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            timestamp: new Date().toISOString(),
        });
    }
    else {
        logger_1.logger.error('Unknown error:', err);
        res.status(exports.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Something went wrong',
            timestamp: new Date().toISOString(),
        });
    }
};
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    logger_1.logger.error('Error caught by global handler:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
    });
    if (err instanceof zod_1.ZodError) {
        error = handleZodError(err);
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        error = handlePrismaError(err);
    }
    if (err.name === 'JsonWebTokenError') {
        error = handleJWTError();
    }
    if (err.name === 'TokenExpiredError') {
        error = handleJWTExpiredError();
    }
    if (err.name === 'MulterError') {
        error = handleMulterError(err);
    }
    if (!(error instanceof AppError)) {
        error = new AppError(error.message || 'Something went wrong', error.statusCode || exports.HTTP_STATUS.INTERNAL_SERVER_ERROR, false);
    }
    if (environment_1.config.nodeEnv === 'development') {
        sendErrorDev(error, res);
    }
    else {
        sendErrorProd(error, res);
    }
};
exports.errorHandler = errorHandler;
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
exports.catchAsync = catchAsync;
const notFoundHandler = (req, res, next) => {
    const err = new AppError(`Route ${req.originalUrl} not found`, exports.HTTP_STATUS.NOT_FOUND);
    next(err);
};
exports.notFoundHandler = notFoundHandler;
const sendSuccessResponse = (res, data = null, message = 'Success', statusCode = exports.HTTP_STATUS.OK) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    });
};
exports.sendSuccessResponse = sendSuccessResponse;
const sendPaginatedResponse = (res, data, totalCount, page, limit, message = 'Success') => {
    const totalPages = Math.ceil(totalCount / limit);
    res.status(exports.HTTP_STATUS.OK).json({
        success: true,
        message,
        data,
        meta: {
            currentPage: page,
            totalPages,
            totalItems: totalCount,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
        timestamp: new Date().toISOString(),
    });
};
exports.sendPaginatedResponse = sendPaginatedResponse;
exports.default = exports.errorHandler;
//# sourceMappingURL=errorHandler.js.map