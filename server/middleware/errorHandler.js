/**
 * Error Handler Middleware
 * 
 * Global error handling with structured responses.
 */
const { logger } = require('../config/logger');
const { ZodError } = require('zod');

// Custom API Error class
class ApiError extends Error {
    constructor(statusCode, code, message, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true;
    }

    static badRequest(message, details = null) {
        return new ApiError(400, 'BAD_REQUEST', message, details);
    }

    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, 'UNAUTHORIZED', message);
    }

    static forbidden(message = 'Forbidden') {
        return new ApiError(403, 'FORBIDDEN', message);
    }

    static notFound(message = 'Resource not found') {
        return new ApiError(404, 'NOT_FOUND', message);
    }

    static conflict(message, details = null) {
        return new ApiError(409, 'CONFLICT', message, details);
    }

    static internal(message = 'Internal server error') {
        return new ApiError(500, 'INTERNAL_ERROR', message);
    }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.error(err.stack || err.message);

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid input data',
                details: err.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            },
        });
    }

    // Handle known API errors
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                ...(err.details && { details: err.details }),
            },
        });
    }

    // Handle Supabase errors
    if (err.code && err.message && err.details) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'DATABASE_ERROR',
                message: err.message,
            },
        });
    }

    // Handle unknown errors
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'An unexpected error occurred'
                : err.message,
        },
    });
};

// Async handler wrapper to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { ApiError, errorHandler, asyncHandler };
