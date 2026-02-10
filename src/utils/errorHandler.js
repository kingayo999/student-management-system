/**
 * Centralized Error Handler
 * Transforms backend errors into user-friendly messages
 * Logs technical details for debugging
 */

/**
 * Common error messages mapping
 */
const ERROR_MESSAGES = {
    // Authentication errors
    'Invalid login credentials': 'Invalid email or password. Please try again.',
    'User not found': 'No account found with those credentials.',
    'Email not confirmed': 'Please verify your email before logging in.',

    // Permission errors
    'Access denied': 'You don\'t have permission to perform this action.',
    'PGRST116': 'Access denied. Please check your permissions.',
    'JWT expired': 'Your session has expired. Please log in again.',

    // Network errors
    'Failed to fetch': 'Connection issue. Please check your internet and try again.',
    'Network request failed': 'Unable to connect. Please try again.',
    'timeout': 'Request timed out. Please try again.',

    // Database errors
    '23505': 'This record already exists.',
    '23503': 'Cannot delete: record is being used elsewhere.',
    'PGRST301': 'Unable to complete operation. Please try again.',

    // Validation errors
    'Invalid Registration Identifier': 'Please enter a valid registration number.',
    'Identity Authorization UID': 'Please select a profile to link.',
    'Departmental node': 'Please select a department.',
};

/**
 * Get user-friendly error message
 * @param {Error|string} error - The error object or message
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
    if (!error) return 'An unexpected error occurred. Please try again.';

    const errorMessage = typeof error === 'string' ? error : error.message || error.error_description || '';
    const errorCode = error?.code || error?.status || '';

    // Check for specific error codes first
    if (errorCode && ERROR_MESSAGES[errorCode]) {
        return ERROR_MESSAGES[errorCode];
    }

    // Check for error message patterns
    for (const [pattern, message] of Object.entries(ERROR_MESSAGES)) {
        if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
            return message;
        }
    }

    // Return generic message for unknown errors
    return 'An unexpected error occurred. Please try again.';
};

/**
 * Check if error is a network error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
    if (!error) return false;

    const message = error.message || '';
    return (
        message.includes('fetch') ||
        message.includes('network') ||
        message.includes('timeout') ||
        error.name === 'NetworkError' ||
        error.name === 'TimeoutError'
    );
};

/**
 * Check if error is an authentication error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export const isAuthError = (error) => {
    if (!error) return false;

    const message = error.message || '';
    const code = error.code || error.status || '';

    return (
        code === 401 ||
        code === 403 ||
        message.includes('credentials') ||
        message.includes('unauthorized') ||
        message.includes('JWT')
    );
};

/**
 * Main error handler
 * Logs technical details and returns user-friendly message
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred (e.g., 'login', 'fetch_students')
 * @returns {string} User-friendly error message
 */
export const handleError = (error, context = 'operation') => {
    // Log technical details for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
        console.error(`[Error in ${context}]:`, error);
    }

    // Return user-friendly message
    return getErrorMessage(error);
};

/**
 * Format validation errors into user-friendly messages
 * @param {Object} validationErrors - Object with field names as keys and error messages as values
 * @returns {Object} Formatted validation errors
 */
export const formatValidationErrors = (validationErrors) => {
    const formatted = {};

    for (const [field, message] of Object.entries(validationErrors)) {
        formatted[field] = getErrorMessage(message);
    }

    return formatted;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
    if (!password || password.length < 6) {
        return {
            isValid: false,
            message: 'Password must be at least 6 characters long.'
        };
    }

    return {
        isValid: true,
        message: ''
    };
};

/**
 * Validate registration number format
 * @param {string} regNo - Registration number to validate
 * @returns {Object} Validation result
 */
export const validateRegNo = (regNo) => {
    if (!regNo || regNo.trim().length === 0) {
        return {
            isValid: false,
            message: 'Registration number is required.'
        };
    }

    if (!regNo.match(/^[A-Z0-9/\-]{5,20}$/i)) {
        return {
            isValid: false,
            message: 'Registration number must be 5-20 characters (letters, numbers, /, -).'
        };
    }

    return {
        isValid: true,
        message: ''
    };
};
