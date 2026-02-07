import { supabase } from '../services/supabase';

/**
 * Logs an action to the audit_logs table.
 * Does not block main execution if logging fails.
 * 
 * @param {string} action - The action performed (e.g., 'update_student', 'create_course')
 * @param {string} entity - The entity affected (e.g., 'students', 'courses')
 * @param {string} entityId - The ID of the affected entity
 */
export const logAudit = async (action, entity, entityId = null) => {
    if (!supabase) return;

    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Fire and forget insert to not block UI
        supabase
            .from('audit_logs')
            .insert([
                {
                    actor_id: user.id,
                    action,
                    entity,
                    entity_id: entityId?.toString(),
                }
            ])
            .then(({ error }) => {
                if (error) console.warn('Audit Logging Warning:', error.message);
            });

    } catch (err) {
        console.warn('Logging utility failed:', err.message);
    }
};
