"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
/**
 * Global error handling middleware for handling various types of errors
 * including multer file upload errors and request size limit errors
 */
const errorHandler = (error, req, res, next) => {
    console.error('Error caught by global handler:', error);
    // Handle multer file upload errors
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: 'File too large. Maximum file size is 500MB.',
            error: 'FILE_TOO_LARGE',
            details: 'Please upload a smaller file or compress your file before uploading.'
        });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
            success: false,
            message: 'Too many files. Maximum 50 files allowed per request.',
            error: 'TOO_MANY_FILES'
        });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            message: 'Unexpected field name for file upload.',
            error: 'UNEXPECTED_FIELD'
        });
    }
    if (error.code === 'LIMIT_PART_COUNT') {
        return res.status(400).json({
            success: false,
            message: 'Too many parts in multipart form.',
            error: 'TOO_MANY_PARTS'
        });
    }
    if (error.code === 'LIMIT_FIELD_KEY') {
        return res.status(400).json({
            success: false,
            message: 'Field name too long.',
            error: 'FIELD_NAME_TOO_LONG'
        });
    }
    if (error.code === 'LIMIT_FIELD_VALUE') {
        return res.status(400).json({
            success: false,
            message: 'Field value too long.',
            error: 'FIELD_VALUE_TOO_LONG'
        });
    }
    if (error.code === 'LIMIT_FIELD_COUNT') {
        return res.status(400).json({
            success: false,
            message: 'Too many fields.',
            error: 'TOO_MANY_FIELDS'
        });
    }
    // Handle request entity too large errors (JSON/form data)
    if (error.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            message: 'Request entity too large. Maximum payload size is 500MB.',
            error: 'PAYLOAD_TOO_LARGE',
            details: 'Please reduce the size of your request data.'
        });
    }
    // Handle invalid file type errors
    if (error.message && error.message.includes('Invalid file type')) {
        return res.status(400).json({
            success: false,
            message: error.message,
            error: 'INVALID_FILE_TYPE'
        });
    }
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            error: 'VALIDATION_ERROR',
            details: messages
        });
    }
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `Duplicate value for field: ${field}`,
            error: 'DUPLICATE_KEY_ERROR',
            field: field
        });
    }
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
            error: 'INVALID_TOKEN'
        });
    }
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired',
            error: 'TOKEN_EXPIRED'
        });
    }
    // Handle Cast errors (invalid ObjectId)
    if (error.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format',
            error: 'INVALID_ID'
        });
    }
    // Generic error handler
    const statusCode = error.statusCode || error.status || 500;
    res.status(statusCode).json(Object.assign({ success: false, message: error.message || 'Internal server error', error: error.name || 'UNKNOWN_ERROR' }, (process.env.NODE_ENV === 'development' && { stack: error.stack })));
};
exports.errorHandler = errorHandler;
/**
 * Middleware to handle 404 routes
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        error: 'NOT_FOUND'
    });
};
exports.notFoundHandler = notFoundHandler;
