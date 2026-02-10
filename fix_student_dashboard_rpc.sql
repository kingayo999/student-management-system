-- ==========================================
-- QUICK FIX: Student Dashboard Error
-- ==========================================
-- This script ensures the RPC function is up to date
-- and handles NULL department_id gracefully

-- 1. Update the get_student_dashboard_data function to handle NULL gracefully
CREATE OR REPLACE FUNCTION get_student_dashboard_data()
RETURNS JSON AS $$
DECLARE
    result JSON;
    student_record RECORD;
    current_session_record RECORD;
BEGIN
    -- Ensure user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Access denied: Authentication required';
    END IF;

    -- Get student record with department and college info
    SELECT 
        s.id,
        s.reg_no,
        s.level,
        s.status,
        s.college,
        s.passport_url,
        s.address,
        s.nationality,
        s.state_of_origin,
        s.date_of_birth,
        s.gender,
        COALESCE(d.name, 'Not Assigned') as department_name,
        COALESCE(c.name, s.college, 'Not Assigned') as college_name
    INTO student_record
    FROM students s
    LEFT JOIN departments d ON s.department_id = d.id
    LEFT JOIN colleges c ON d.college_id = c.id
    WHERE s.user_id = auth.uid() AND (s.deleted_at IS NULL OR s.deleted_at IS NULL);

    -- If no student record found, return empty object
    IF NOT FOUND THEN
        RETURN json_build_object(
            'student_found', false,
            'message', 'No student record found for this user'
        );
    END IF;

    -- Get current academic session
    SELECT id, name INTO current_session_record
    FROM academic_sessions
    WHERE is_current = true
    LIMIT 1;

    -- Build complete student dashboard data
    SELECT json_build_object(
        'student_found', true,
        'student_info', json_build_object(
            'id', student_record.id,
            'reg_no', student_record.reg_no,
            'level', student_record.level,
            'status', student_record.status,
            'college', student_record.college_name,
            'department', student_record.department_name,
            'passport_url', student_record.passport_url,
            'address', student_record.address,
            'nationality', student_record.nationality,
            'state_of_origin', student_record.state_of_origin,
            'date_of_birth', student_record.date_of_birth,
            'gender', student_record.gender
        ),
        'current_session', CASE 
            WHEN current_session_record.id IS NOT NULL THEN
                json_build_object(
                    'id', current_session_record.id,
                    'name', current_session_record.name
                )
            ELSE NULL
        END,
        'enrolled_courses', (
            SELECT COALESCE(json_agg(course_data), '[]'::json)
            FROM (
                SELECT 
                    c.id,
                    c.code,
                    c.name,
                    c.credit_unit,
                    c.level,
                    c.semester,
                    sc.status as enrollment_status
                FROM student_courses sc
                JOIN courses c ON sc.course_id = c.id
                WHERE sc.student_id = student_record.id
                ORDER BY c.code
            ) course_data
        ),
        'academic_summary', json_build_object(
            'total_courses_enrolled', (
                SELECT COUNT(*) FROM student_courses WHERE student_id = student_record.id
            ),
            'active_courses', (
                SELECT COUNT(*) FROM student_courses 
                WHERE student_id = student_record.id AND status = 'registered'
            ),
            'completed_courses', (
                SELECT COUNT(*) FROM student_courses 
                WHERE student_id = student_record.id AND status = 'completed'
            )
        ),
        'payment_status', json_build_object(
            'total_paid', COALESCE((
                SELECT SUM(amount) FROM payments 
                WHERE student_id = student_record.id AND status = 'completed'
            ), 0),
            'pending_count', (
                SELECT COUNT(*) FROM payments 
                WHERE student_id = student_record.id AND status = 'pending'
            )
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_student_dashboard_data() TO authenticated;

-- Test the function (run this to see if it works)
SELECT get_student_dashboard_data();
