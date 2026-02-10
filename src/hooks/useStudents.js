import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { handleError } from '../utils/errorHandler';
import { logAudit } from '../utils/logger';

/**
 * Custom hook for managing student-related operations.
 * Provides functionality for fetching, creating, updating, and deactivating students.
 * Includes error handling and audit logging.
 * 
 * @returns {Object} Student management methods and state
 */
export const useStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('students')
                .select(`
                    *,
                    profiles:user_id (full_name),
                    departments:department_id (name, code)
                `)
                .is('deleted_at', null);

            if (error) throw error;
            setStudents(data || []);
        } catch (err) {
            setError(handleError(err, 'fetch_students'));
        } finally {
            setLoading(false);
        }
    }, []);

    const createStudent = async (studentData) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('students')
                .insert([{
                    ...studentData,
                    reg_no: studentData.reg_no.toUpperCase()
                }])
                .select()
                .single();

            if (error) {
                if (error.code === '23505') throw new Error('Registration ID already exists in the mainframe.');
                throw error;
            }

            await logAudit('create_student', 'students', data.id);
            await fetchStudents(); // Refresh list
            return { success: true, data };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const updateStudent = async (id, updates) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('students')
                .update({
                    ...updates,
                    reg_no: updates.reg_no?.toUpperCase()
                })
                .eq('id', id);

            if (error) throw error;

            await logAudit('update_student', 'students', id);
            await fetchStudents(); // Refresh list
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const deactivateStudent = async (id) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('students')
                .update({
                    deleted_at: new Date().toISOString(),
                    status: 'inactive'
                })
                .eq('id', id);

            if (error) throw error;

            await logAudit('deactivate_student', 'students', id);
            setStudents(prev => prev.filter(s => s.id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, error: 'Authorization failure: Could not deactivate record.' };
        } finally {
            setLoading(false);
        }
    };

    return {
        students,
        loading,
        error,
        fetchStudents,
        createStudent,
        updateStudent,
        deactivateStudent
    };
};
