-- ==========================================
-- BELLSTECH SMS - HARDENED DATABASE SETUP
-- ==========================================

-- 1. CORE TABLES

-- Create profiles table (Linked to Auth.Users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
COMMENT ON TABLE profiles IS 'Stores extended user information for both staff and students.';

-- Create students table (Academic Data)
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  reg_no TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  level TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
COMMENT ON TABLE students IS 'Main student directory supporting soft-deletes via deleted_at.';

-- Create courses table (Curriculum)
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  credit_unit INTEGER NOT NULL CHECK (credit_unit > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create enrollments (Intersection Table)
CREATE TABLE student_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(student_id, course_id)
);

-- Create audit_logs table (System Compliance)
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES (EXPLICIT & DOCUMENTED)

-- PROFILES
-- Policy: Everyone can view names; privacy handled at app level if needed.
CREATE POLICY "Profiles are readable by authenticated users." ON profiles FOR SELECT USING (auth.role() = 'authenticated');
-- Policy: Users manage their own identity.
CREATE POLICY "Users can only update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- STUDENTS
-- Policy: Restrict staff to viewing non-deleted student records only.
CREATE POLICY "Staff can view active student records." ON students
  FOR SELECT USING (
    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')))
    AND (deleted_at IS NULL OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  );
-- Policy: Students are siloed to their own data.
CREATE POLICY "Students can only access their own active record." ON students
  FOR SELECT USING (user_id = auth.uid() AND deleted_at IS NULL);
-- Policy: Soft Delete Enforcement
CREATE POLICY "Only admins can perform soft deletes." ON students
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- COURSES
-- Policy: Read access is universal for authenticated users.
CREATE POLICY "Courses are viewable by all authenticated users." ON courses FOR SELECT USING (auth.role() = 'authenticated');
-- Policy: Restricted write access to maintain curriculum integrity.
CREATE POLICY "Only administrators can manage course records." ON courses
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- STUDENT COURSES
-- Policy: Academic transparency for students.
CREATE POLICY "Students can view their own enrollments." ON student_courses
  FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
-- Policy: Staff/Admin enrollment management.
CREATE POLICY "Staff can manage all enrollments." ON student_courses
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

-- AUDIT LOGS
-- Policy: Security compliance monitoring restricted to higher roles.
CREATE POLICY "Admins have full visibility of system logs." ON audit_logs
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
-- Policy: Staff focused on student operational logs.
CREATE POLICY "Staff can view student-related audit logs." ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'staff')
    AND entity = 'students'
  );
-- Policy: Permit insert from app logic for all authenticated sessions.
CREATE POLICY "Allow authenticated sessions to create logs." ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. FUNCTIONS & TRIGGERS

-- Robust handler for new Auth signup (metadata extraction)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'SMS User'), 
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Server-Side Analytics Aggregate (Admin Restricted)
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    'total_students', (SELECT count(*) FROM students),
    'active_students', (SELECT count(*) FROM students WHERE status = 'active' AND deleted_at IS NULL),
    'inactive_students', (SELECT count(*) FROM students WHERE status = 'inactive' AND deleted_at IS NULL),
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

-- 5. INITIAL SEED DATA
INSERT INTO courses (name, code, credit_unit) VALUES
('Introduction to Computing', 'CSC 101', 3),
('General Physics I', 'PHY 101', 4),
('Engineering Mathematics I', 'ENG 101', 3),
('General Chemistry I', 'CHM 101', 4),
('Introduction to Food Science', 'FST 101', 2),
('Principles of Economics', 'ECO 101', 3),
('Object Oriented Programming', 'CSC 201', 3),
('Thermodynamics', 'MCE 201', 3),
('Accounting Principles', 'ACC 101', 3);

