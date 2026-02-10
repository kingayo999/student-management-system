import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { handleError } from '../utils/errorHandler';
import { logAudit } from '../utils/logger';

/**
 * Custom hook for managing course-related operations.
 * Provides functionality for fetching, creating, updating, and deleting courses.
 * Includes error handling and audit logging.
 * 
 * @returns {Object} Course management methods and state
 */
export const useCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('courses')
                .select(`
                    *,
                    departments:department_id (name, code)
                `)
                .order('code');
            if (error) throw error;
            setCourses(data || []);
        } catch (err) {
            setError(handleError(err, 'fetch_courses'));
        } finally {
            setLoading(false);
        }
    }, []);

    const createCourse = async (courseData) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('courses')
                .insert([{
                    ...courseData,
                    code: courseData.code.toUpperCase()
                }])
                .select()
                .single();

            if (error) {
                if (error.code === '23505') throw new Error('Course code already exists in the mainframe.');
                throw error;
            }

            await logAudit('create_course', 'courses', data.id);
            await fetchCourses(); // Refresh list
            return { success: true, data };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const updateCourse = async (id, updates) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('courses')
                .update({
                    ...updates,
                    code: updates.code?.toUpperCase()
                })
                .eq('id', id);

            if (error) throw error;

            await logAudit('update_course', 'courses', id);
            await fetchCourses(); // Refresh list
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const deleteCourse = async (id) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await logAudit('delete_course', 'courses', id);
            setCourses(prev => prev.filter(c => c.id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, error: 'Authorization failure: Could not delete course.' };
        } finally {
            setLoading(false);
        }
    };

    return {
        courses,
        loading,
        error,
        fetchCourses,
        createCourse,
        updateCourse,
        deleteCourse
    };
};
