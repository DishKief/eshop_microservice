export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details?: any;

    constructor(message:string, statusCode:number, isOperational = true, details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
    }
}

// Not found error
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

// Validation error (use for Joi/zod/reack-hook-form validation errors)
export class ValidationError extends AppError {
    constructor(message = 'Validation failed', details?: any) {
        super(message, 400, true, details);
    }
}

// Authentication error
export class AuthenticationError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

// Forbidden error (For Insufficient permissions)
export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden access') {
        super(message, 403);
    }
}

// Database Error (For MongoDB/PostgreSQL errors)
export class DatabaseError extends AppError {
    constructor(message = 'Database error', details?: any) {
        super(message, 500, true, details);
    }
}

// Rate Limit Error (If user exceeds rate limit)
export class RateLimitError extends AppError {
    constructor(message = 'Too many requests, please try again later!') {
        super(message, 429);
    }
}