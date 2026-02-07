-- TASK 1: AUDIT LOGGING
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read all audit logs
CREATE POLICY "Admins can read all audit logs" ON audit_logs
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Staff can read only logs related to students
CREATE POLICY "Staff can read student-related logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'staff')
    AND entity = 'students'
  );

-- Authenticated users can insert logs (to allow logging from app)
CREATE POLICY "Authenticated users can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- TASK 2: SOFT DELETES
ALTER TABLE students ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Update RLS for students to exclude soft-deleted records for normal roles
-- We need to DROP and RE-CREATE the policies to include the deleted_at check

DROP POLICY IF EXISTS "Staff can view students" ON students;
CREATE POLICY "Staff can view active students" ON students
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
    AND (deleted_at IS NULL OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  );

DROP POLICY IF EXISTS "Students can view own record" ON students;
CREATE POLICY "Students can view own active record" ON students
  FOR SELECT USING (user_id = auth.uid() AND deleted_at IS NULL);

-- TASK 3: ADMIN ANALYTICS (RPC)
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Ensure only admins can call this
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    'total_students', (SELECT count(*) FROM students),
    'active_students', (SELECT count(*) FROM students WHERE status = 'active' AND deleted_at IS NULL),
    'inactive_students', (SELECT count(*) FROM students WHERE status = 'inactive' AND deleted_at IS NULL),
    'soft_deleted_students', (SELECT count(*) FROM students WHERE deleted_at IS NULL), -- Inverted logic check
    'students_per_department', (
      SELECT json_object_agg(department, count)
      FROM (SELECT department, count(*) FROM students WHERE deleted_at IS NULL GROUP BY department) AS dept_counts
    ),
    'enrollments_per_course', (
      SELECT json_object_agg(course_name, count)
      FROM (
        SELECT c.name as course_name, count(sc.student_id)
        FROM courses c
        LEFT JOIN student_courses sc ON c.id = sc.course_id
        GROUP BY c.name
      ) AS course_counts
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
