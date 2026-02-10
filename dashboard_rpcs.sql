-- ==========================================
-- ROLE-SPECIFIC DASHBOARD RPC FUNCTIONS
-- ==========================================
-- These functions provide optimized, role-specific data for dashboards
-- with proper access control enforced at the database level

-- ==========================================
-- ADMIN DASHBOARD STATISTICS
-- ==========================================
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Ensure only admins can call this function
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;

    SELECT json_build_object(
        'total_students', (
            SELECT COUNT(*) 
            FROM students 
            WHERE deleted_at IS NULL
        ),
        'active_students', (
            SELECT COUNT(*) 
            FROM students 
            WHERE status = 'active' AND deleted_at IS NULL
        ),
        'inactive_students', (
            SELECT COUNT(*) 
            FROM students 
            WHERE status = 'inactive' AND deleted_at IS NULL
        ),
        'graduated_students', (
            SELECT COUNT(*) 
            FROM students 
            WHERE status = 'graduated' AND deleted_at IS NULL
        ),
        'withdrawn_students', (
            SELECT COUNT(*) 
            FROM students 
            WHERE status = 'withdrawn' AND deleted_at IS NULL
        ),
        'total_courses', (
            SELECT COUNT(*) 
            FROM courses
        ),
        'students_per_department', (
            SELECT json_object_agg(COALESCE(d.name, 'Unassigned'), count)
            FROM (
                SELECT 
                    s.department_id,
                    COUNT(*) as count
                FROM students s
                WHERE s.deleted_at IS NULL
                GROUP BY s.department_id
            ) AS dept_counts
            LEFT JOIN departments d ON dept_counts.department_id = d.id
        ),
        'recent_registrations', (
            SELECT COUNT(*) 
            FROM students 
            WHERE deleted_at IS NULL 
            AND created_at > NOW() - INTERVAL '30 days'
        ),
        'enrollments_per_course', (
            SELECT json_object_agg(course_name, count)
            FROM (
                SELECT 
                    c.code || ' - ' || c.name as course_name,
                    COUNT(sc.student_id) as count
                FROM courses c
                LEFT JOIN student_courses sc ON c.id = sc.course_id
                GROUP BY c.id, c.code, c.name
                ORDER BY COUNT(sc.student_id) DESC
            ) AS course_counts
        ),
        'total_staff', (
            SELECT COUNT(*) 
            FROM staff
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- STAFF DASHBOARD STATISTICS
-- ==========================================
CREATE OR REPLACE FUNCTION get_staff_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Ensure only staff or admin can call this function
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('staff', 'admin')) THEN
        RAISE EXCEPTION 'Access denied: Staff role required';
    END IF;

    SELECT json_build_object(
        'total_students', (
            SELECT COUNT(*) 
            FROM students 
            WHERE deleted_at IS NULL
        ),
        'active_students', (
            SELECT COUNT(*) 
            FROM students 
            WHERE status = 'active' AND deleted_at IS NULL
        ),
        'inactive_students', (
            SELECT COUNT(*) 
            FROM students 
            WHERE status = 'inactive' AND deleted_at IS NULL
        ),
        'students_per_department', (
            SELECT json_object_agg(COALESCE(d.name, 'Unassigned'), count)
            FROM (
                SELECT 
                    s.department_id,
                    COUNT(*) as count
                FROM students s
                WHERE s.deleted_at IS NULL
                GROUP BY s.department_id
            ) AS dept_counts
            LEFT JOIN departments d ON dept_counts.department_id = d.id
        ),
        'total_enrollments', (
            SELECT COUNT(*) 
            FROM student_courses
        ),
        'recent_activity', (
            SELECT json_agg(activity_data)
            FROM (
                SELECT 
                    s.reg_no,
                    p.full_name,
                    s.status,
                    s.created_at
                FROM students s
                JOIN profiles p ON s.user_id = p.id
                WHERE s.deleted_at IS NULL
                ORDER BY s.created_at DESC
                LIMIT 10
            ) AS activity_data
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- STUDENT DASHBOARD DATA
-- ==========================================
CREATE OR REPLACE FUNCTION get_student_dashboard_data()
RETURNS JSON AS $$
DECLARE
    result JSON;
    student_record RECORD;
BEGIN
    -- Ensure user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Access denied: Authentication required';
    END IF;

    -- Get student record
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
        d.name as department_name,
        c.name as college_name
    INTO student_record
    FROM students s
    LEFT JOIN departments d ON s.department_id = d.id
    LEFT JOIN colleges c ON d.college_id = c.id
    WHERE s.user_id = auth.uid() AND s.deleted_at IS NULL;

    -- If no student record found, return empty object
    IF NOT FOUND THEN
        RETURN json_build_object(
            'student_found', false,
            'message', 'No student record found'
        );
    END IF;

    -- Build complete student dashboard data
    SELECT json_build_object(
        'student_found', true,
        'student_info', json_build_object(
            'id', student_record.id,
            'reg_no', student_record.reg_no,
            'level', student_record.level,
            'status', student_record.status,
            'college', COALESCE(student_record.college_name, student_record.college),
            'department', student_record.department_name,
            'passport_url', student_record.passport_url,
            'address', student_record.address,
            'nationality', student_record.nationality,
            'state_of_origin', student_record.state_of_origin,
            'date_of_birth', student_record.date_of_birth,
            'gender', student_record.gender
        ),
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
                    sc.status as enrollment_status,
                    sc.session_id
                FROM student_courses sc
                JOIN courses c ON sc.course_id = c.id
                WHERE sc.student_id = student_record.id
                ORDER BY c.level, c.semester, c.code
            ) AS course_data
        ),
        'current_session', (
            SELECT json_build_object(
                'id', acs.id,
                'name', acs.name,
                'is_current', acs.is_current,
                'start_date', acs.start_date,
                'end_date', acs.end_date
            )
            FROM academic_sessions acs
            WHERE acs.is_current = true
            LIMIT 1
        ),
        'payment_status', (
            SELECT json_build_object(
                'total_paid', COALESCE(SUM(amount), 0),
                'last_payment_date', MAX(payment_date),
                'pending_count', COUNT(*) FILTER (WHERE status = 'pending')
            )
            FROM payments
            WHERE student_id = student_record.id
        ),
        'academic_summary', (
            SELECT json_build_object(
                'total_courses_enrolled', COUNT(*),
                'completed_courses', COUNT(*) FILTER (WHERE status = 'completed'),
                'active_courses', COUNT(*) FILTER (WHERE status = 'registered')
            )
            FROM student_courses
            WHERE student_id = student_record.id
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- GRANT EXECUTE PERMISSIONS
-- ==========================================
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_staff_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_student_dashboard_data() TO authenticated;
