/**
 * Application-wide constants
 * Centralizes magic strings and numbers for better maintainability
 */

// User Roles
export const ROLES = {
    ADMIN: 'admin',
    STAFF: 'staff',
    STUDENT: 'student',
};

// Student Status
export const STUDENT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    GRADUATED: 'graduated',
    WITHDRAWN: 'withdrawn',
};

// Timeouts (in milliseconds)
export const TIMEOUTS = {
    FEEDBACK_DURATION: 5000,
    PROFILE_FETCH: 10000,
    RETRY_BASE: 1000,
    MAX_RETRIES: 2,
};

// Course Levels
export const COURSE_LEVELS = {
    LEVEL_100: '100',
    LEVEL_200: '200',
    LEVEL_300: '300',
    LEVEL_400: '400',
    LEVEL_500: '500',
    POSTGRADUATE: 'PG',
};

// Semesters
export const SEMESTERS = {
    FIRST: 'First',
    SECOND: 'Second',
};

// Payment Status
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
};

// Enrollment Status
export const ENROLLMENT_STATUS = {
    REGISTERED: 'registered',
    DROPPED: 'dropped',
    COMPLETED: 'completed',
};

// Local Storage Keys
export const STORAGE_KEYS = {
    PROFILE: 'registry_profile',
    THEME: 'theme_preference',
};

// API Error Codes
export const ERROR_CODES = {
    DUPLICATE: '23505',
    NOT_FOUND: 'PGRST116',
    UNAUTHORIZED: '401',
    FORBIDDEN: '403',
    TIMEOUT: 'ETIMEDOUT',
};

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
};

// File Upload
export const UPLOAD_LIMITS = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],
};
