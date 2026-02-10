import { describe, it, expect } from 'vitest';
import { handleError, validateRegNo, validateEmail } from '../utils/errorHandler';

describe('errorHandler', () => {
    describe('handleError', () => {
        it('should handle PostgreSQL duplicate key error', () => {
            const error = { code: '23505', message: 'duplicate key value' };
            const result = handleError(error, 'create_student');
            expect(result).toContain('already exists');
        });

        it('should handle network errors', () => {
            const error = { message: 'Network request failed' };
            const result = handleError(error, 'fetch_data');
            expect(result).toContain('network');
        });

        it('should return user-friendly message for unknown errors', () => {
            const error = { message: 'Unknown database error XYZ123' };
            const result = handleError(error, 'unknown_operation');
            expect(result).not.toContain('XYZ123');
            expect(result.length).toBeGreaterThan(0);
        });
    });

    describe('validateRegNo', () => {
        it('should validate correct registration number', () => {
            const result = validateRegNo('BU/CSC/2020/1234');
            expect(result.isValid).toBe(true);
        });

        it('should reject empty registration number', () => {
            const result = validateRegNo('');
            expect(result.isValid).toBe(false);
            expect(result.message).toBeTruthy();
        });

        it('should reject invalid format', () => {
            const result = validateRegNo('invalid');
            expect(result.isValid).toBe(false);
        });
    });

    describe('validateEmail', () => {
        it('should validate correct email', () => {
            const result = validateEmail('test@example.com');
            expect(result.isValid).toBe(true);
        });

        it('should reject invalid email', () => {
            const result = validateEmail('invalid-email');
            expect(result.isValid).toBe(false);
        });

        it('should reject empty email', () => {
            const result = validateEmail('');
            expect(result.isValid).toBe(false);
        });
    });
});
