// First created Week 2 by Zane Beidas
// --------

/**
 * Base error for backend errors.
 */
export class BackendError extends Error {
    
    constructor(message, options = {}) {
        super(message);
        this.name = this.constructor.name;
        if (options.code != null) this.code = options.code;
        if (options.status != null) this.status = options.status;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}


// ======== DATABASE ERRORS ========

/**
 * Extends database error-- For database specific errors
 * WILL START AT CODE -100 FOR DATABASE ERRORS
 */
export class DatabaseError extends BackendError {
    constructor(message, options = {}) {
        super(message, options);
    }
}

/**
 * Extends database error-- For not found errors
 * WILL USE CODE -100 FOR NOT FOUND THINGS
 */
export class NotFoundError extends DatabaseError {
    constructor(message) {
        super(message, { status: 404, code: -100 });
    }
}

/**
 * Extends database error-- For unique constraint violation errors
 * WILL USE CODE -101 FOR UNIQUE CONSTRAINT VIOLATION ERRORS
 */
export class UniqueViolationError extends DatabaseError {
    constructor(message) {
        super(message, { status: 409, code: -101 });
    }
}

/**
 * Extends database error-- For foreign key violation errors
 * WILL USE CODE -102 FOR FOREIGN KEY VIOLATION ERRORS
 */
export class ForeignKeyViolationError extends DatabaseError {
    constructor(message) {
        super(message, { status: 409, code: -102 });
    }
}

/**
 * Extends database error-- For check violation errors
 * WILL USE CODE -103 FOR CHECK VIOLATION ERRORS
 */
export class CheckViolationError extends DatabaseError {
    constructor(message) {
        super(message, { status: 409, code: -103 });
    }
}


// ======== AUTH ERRORS ========

/**
 * Extends backend error-- For auth specific errors
 * WILL START AT CODE -200 FOR AUTH ERRORS
 */
export class AuthError extends BackendError {
    constructor(message, options = {}) {
        super(message, options);
    }
}

/**
 * Extends auth error-- For invalid credentials errors
 * WILL USE CODE -200 FOR INVALID CREDENTIALS ERRORS
 */
export class InvalidCredentialsError extends AuthError {
    constructor(message) {
        super(message, { status: 401, code: -200 });
    }
}

/**
 * Extends auth error-- For missing token errors
 * WILL USE CODE -201 FOR MISSING TOKEN ERRORS
 */
export class MissingTokenError extends AuthError {
    constructor(message) {
        super(message, { status: 401, code: -201 });
    }
}

/**
 * Extends auth error-- For expired token errors
 * WILL USE CODE -202 FOR EXPIRED TOKEN ERRORS
 */
export class ExpiredTokenError extends AuthError {
    constructor(message) {
        super(message, { status: 401, code: -202 });
    }
}

/**
 * Extends auth error-- For invalid token errors
 * WILL USE CODE -203 FOR INVALID TOKEN ERRORS
 */
export class InvalidTokenError extends AuthError {
    constructor(message) {
        super(message, { status: 401, code: -203 });
    }
}

/**
 * Extends auth error-- For token verification errors
 * WILL USE CODE -204 FOR TOKEN VERIFICATION ERRORS
 */
export class TokenVerificationError extends AuthError {
    constructor(message) {
        super(message, { status: 500, code: -204 });
    }
}

/**
 * Extends auth error-- For forbidden errors
 * WILL USE CODE -205 FOR FORBIDDEN ERRORS
 */
export class ForbiddenError extends AuthError {
    constructor(message) {
        super(message, { status: 403, code: -205 });
    }
}


// ======== VALIDATION ERROR ========

/**
 * Extends backend error-- For validation errors
 * WILL USE CODE -300 FOR VALIDATION ERRORS
 */
export class ValidationError extends BackendError {
    constructor(message) {
        super(message, { status: 400, code: -300 });
    }
}


// ======== INTERNAL SERVER ERROR ========

/**
 * Extends backend error-- For internal server errors
 * WILL USE CODE -400 FOR INTERNAL SERVER ERRORS
 */
export class InternalServerError extends BackendError {
    constructor(message) {
        super(message, { status: 500, code: -400 });
    }
}