import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';
import { act } from 'react';

describe('useDebounce', () => {
    it('should return initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('test', 500));
        expect(result.current).toBe('test');
    });

    it('should debounce value changes', async () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            { initialProps: { value: 'initial' } }
        );

        expect(result.current).toBe('initial');

        rerender({ value: 'updated' });
        expect(result.current).toBe('initial'); // Still old value

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 350));
        });

        expect(result.current).toBe('updated'); // Now updated
    });
});
