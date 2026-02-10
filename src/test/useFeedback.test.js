import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFeedback } from '../hooks/useFeedback';

describe('useFeedback', () => {
    it('should initialize with empty feedback', () => {
        const { result } = renderHook(() => useFeedback());
        expect(result.current.feedback).toEqual({ type: '', message: '' });
    });

    it('should show feedback and clear after duration', async () => {
        const { result } = renderHook(() => useFeedback(1000));

        act(() => {
            result.current.showFeedback('success', 'Test message');
        });

        expect(result.current.feedback).toEqual({ type: 'success', message: 'Test message' });

        await new Promise(resolve => setTimeout(resolve, 1100));

        expect(result.current.feedback).toEqual({ type: '', message: '' });
    });

    it('should clear feedback manually', () => {
        const { result } = renderHook(() => useFeedback());

        act(() => {
            result.current.showFeedback('error', 'Error message');
        });

        expect(result.current.feedback.message).toBe('Error message');

        act(() => {
            result.current.clearFeedback();
        });

        expect(result.current.feedback).toEqual({ type: '', message: '' });
    });
});
