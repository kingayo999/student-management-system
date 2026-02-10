import DOMPurify from 'dompurify';

/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string} dirty - The potentially unsafe string
 * @param {Object} options - DOMPurify configuration options
 * @returns {string} The sanitized string
 */
export const sanitizeHTML = (dirty, options = {}) => {
    const defaultOptions = {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        ALLOWED_ATTR: ['href', 'title'],
        ALLOW_DATA_ATTR: false,
    };

    return DOMPurify.sanitize(dirty, { ...defaultOptions, ...options });
};

/**
 * Sanitizes plain text input (removes all HTML)
 * @param {string} text - The text to sanitize
 * @returns {string} Plain text without HTML
 */
export const sanitizeText = (text) => {
    return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
};

/**
 * Validates and sanitizes file uploads
 * @param {File} file - The file to validate
 * @param {Array<string>} allowedTypes - Array of allowed MIME types
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Object} Validation result {isValid: boolean, error: string}
 */
export const validateFile = (file, allowedTypes, maxSize) => {
    if (!file) {
        return { isValid: false, error: 'No file selected' };
    }

    if (!allowedTypes.includes(file.type)) {
        return { isValid: false, error: 'Invalid file type' };
    }

    if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
        return { isValid: false, error: `File size exceeds ${maxSizeMB}MB` };
    }

    return { isValid: true, error: null };
};

/**
 * Escapes special characters in a string for use in regex
 * @param {string} string - The string to escape
 * @returns {string} Escaped string
 */
export const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
