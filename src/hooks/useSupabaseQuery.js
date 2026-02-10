import { useState, useEffect } from 'react';
import { handleError } from '../utils/errorHandler';

/**
 * Custom hook for Supabase queries with loading and error states
 * @param {Function} queryFn - Async function that performs the Supabase query
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {Object} Query state (data, loading, error, refetch)
 */
export const useSupabaseQuery = (queryFn, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const executeQuery = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await queryFn();
            setData(result);
        } catch (err) {
            const errorMessage = handleError(err, 'fetch_data');
            setError(errorMessage);
            console.error('Query error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        executeQuery();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    const refetch = () => {
        executeQuery();
    };

    return { data, loading, error, refetch };
};
