import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { handleError } from '../utils/errorHandler';
import { ROLES } from '../constants';

/**
 * Custom hook for managing payment-related operations.
 * Provides functionality for fetching history and recording new payments.
 * 
 * @returns {Object} Payment management methods and state
 */
export const usePayments = () => {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [payments, setPayments] = useState([]);

    /**
     * Fetch payment history for the current user
     */
    const fetchPayments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (!profile) return;

            let query = supabase
                .from('payments')
                .select('*')
                .order('created_at', { ascending: false });

            // Admin sees all, Staff/Student see relevant (RLS handles student, but logic helps)
            if (profile.role === ROLES.STUDENT) {
                // RLS should handle this, but explicit query is safe
                // No extra filter needed if policies are set correctly
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;
            setPayments(data || []);

        } catch (err) {
            console.error('Error fetching payments:', err);
            setError(handleError(err, 'fetch_payments'));
        } finally {
            setLoading(false);
        }
    }, [profile]);

    /**
     * Record a new payment via RPC
     * @param {Object} paymentData - { amount, purpose }
     */
    const recordPayment = async (paymentData) => {
        setLoading(true);
        setError(null);
        try {
            const reference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const { data, error: rpcError } = await supabase.rpc('record_student_payment', {
                p_amount: parseFloat(paymentData.amount),
                p_purpose: paymentData.purpose,
                p_reference: reference
            });

            if (rpcError) throw rpcError;

            if (!data.success) {
                throw new Error(data.message);
            }

            // Refresh list
            await fetchPayments();
            return data;
        } catch (err) {
            console.error('Error recording payment:', err);
            const msg = handleError(err, 'record_payment');
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

    return {
        payments,
        loading,
        error,
        fetchPayments,
        recordPayment
    };
};
