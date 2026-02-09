-- ==========================================
-- BELLSTECH STUDENT MANAGEMENT SYSTEM (SMS)
-- COMPLETE DATABASE SCHEMA
-- ==========================================

-- 0. EXTENSIONS & INITIAL SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clear existing tables if necessary (CAUTION: Destructive)
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS announcements CASCADE;
-- DROP TABLE IF EXISTS results CASCADE;
-- DROP TABLE IF EXISTS student_courses CASCADE;
-- DROP TABLE IF EXISTS accommodations CASCADE;
-- DROP TABLE IF EXISTS payments CASCADE;
-- DROP TABLE IF EXISTS courses CASCADE;
-- DROP TABLE IF EXISTS staff CASCADE;
-- DROP TABLE IF EXISTS students CASCADE;
-- DROP TABLE IF EXISTS departments CASCADE;
-- DROP TABLE IF EXISTS colleges CASCADE;
-- DROP TABLE IF EXISTS academic_sessions CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- 1. CORE IDENTITY & ACCESS CONTROL
-- Profiles linked to Supabase Auth
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'student')) DEFAULT 'student',
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure profiles columns exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- 2. UNIVERSITY HIERARCHY
-- Colleges (Faculties)
CREATE TABLE IF NOT EXISTS colleges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL, -- e.g. 'College of Natural and Applied Sciences'
    code TEXT UNIQUE NOT NULL, -- e.g. 'CONAS'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Departments
CREATE TABLE IF NOT EXISTS departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE NOT NULL,
    name TEXT UNIQUE NOT NULL, -- e.g. 'Computer Science'
    code TEXT UNIQUE NOT NULL, -- e.g. 'CSC'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Academic Sessions
CREATE TABLE IF NOT EXISTS academic_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL, -- e.g. '2025/2026'
    is_current BOOLEAN DEFAULT false,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. USERS (STAFF & STUDENTS)
-- Staff Table
CREATE TABLE IF NOT EXISTS staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    staff_no TEXT UNIQUE NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    designation TEXT, -- e.g. 'Lecturer', 'Dean'
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on-leave')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure staff columns exist
ALTER TABLE staff ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on-leave'));

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    reg_no TEXT UNIQUE NOT NULL, -- Matric Number
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    level TEXT NOT NULL CHECK (level IN ('100', '200', '300', '400', '500', 'PG')),
    college TEXT NOT NULL, -- Redundant for performance, but good for quick filters
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'withdrawn')),
    passport_url TEXT,
    address TEXT,
    nationality TEXT DEFAULT 'Nigerian',
    state_of_origin TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- Ensure students columns exist (Migration for existing tables)
ALTER TABLE students ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS passport_url TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Nigerian';
ALTER TABLE students ADD COLUMN IF NOT EXISTS state_of_origin TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 4. ACADEMIC RECORDS
-- Courses
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL, -- e.g. 'CSC 101'
    credit_unit INTEGER NOT NULL CHECK (credit_unit > 0),
    level TEXT NOT NULL,
    semester TEXT NOT NULL CHECK (semester IN ('First', 'Second')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure courses columns exist
ALTER TABLE courses ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE CASCADE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS level TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS semester TEXT CHECK (semester IN ('First', 'Second'));

-- Enrollment (Student-Course mapping)
CREATE TABLE IF NOT EXISTS student_courses (
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    session_id UUID REFERENCES academic_sessions(id) ON DELETE CASCADE,
    semester TEXT NOT NULL CHECK (semester IN ('First', 'Second')),
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'dropped', 'completed')),
    PRIMARY KEY (student_id, course_id, session_id)
);

-- Results
CREATE TABLE IF NOT EXISTS results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES academic_sessions(id) ON DELETE CASCADE NOT NULL,
    semester TEXT NOT NULL,
    score DECIMAL(5, 2) CHECK (score >= 0 AND score <= 100),
    grade TEXT,
    grade_point DECIMAL(3, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_id, course_id, session_id)
);

-- 5. OPERATIONS
-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'NGN',
    purpose TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'successful', 'failed')),
    reference TEXT UNIQUE NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Accommodations
CREATE TABLE IF NOT EXISTS accommodations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    hostel_name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    bed_space TEXT,
    session_id UUID REFERENCES academic_sessions(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'allocated' CHECK (status IN ('allocated', 'pending', 'vacated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'staff', 'admin')),
    is_priority BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. SECURITY & AUDITING
-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================
-- 7. INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_reg_no ON students(reg_no);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_results_student ON results(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);

-- ==========================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- HELPER FUNCTIONS FOR ROLE CHECKS (Performance Optimized)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'staff'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 8.1 PROFILES POLICIES
DO $$ 
BEGIN 
    -- Drop all potential old names and new names to ensure a clean slate
    DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
    DROP POLICY IF EXISTS "Users can edit own profile" ON profiles;
    DROP POLICY IF EXISTS "Admins have full access" ON profiles;
    DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
    DROP POLICY IF EXISTS "Students can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own name/avatar" ON profiles;
    
    CREATE POLICY "Admins have full access" ON profiles FOR ALL USING (is_admin());
    CREATE POLICY "Staff can view all profiles" ON profiles FOR SELECT USING (is_staff());
    CREATE POLICY "Students can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "Users can update own name/avatar" ON profiles FOR UPDATE USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id AND role = role);
END $$;

-- 8.2 STUDENTS POLICIES
DO $$ 
BEGIN 
    DROP POLICY IF EXISTS "Students can view themselves" ON students;
    DROP POLICY IF EXISTS "Staff can view students" ON students;
    DROP POLICY IF EXISTS "Admins can manage students" ON students;
    DROP POLICY IF EXISTS "Admins have full access" ON students;
    DROP POLICY IF EXISTS "Staff can view and update students" ON students;
    DROP POLICY IF EXISTS "Staff can update students" ON students;
    DROP POLICY IF EXISTS "Students can view own record" ON students;

    CREATE POLICY "Admins have full access" ON students FOR ALL USING (is_admin());
    CREATE POLICY "Staff can view and update students" ON students 
        FOR SELECT USING (is_staff());
    CREATE POLICY "Staff can update students" ON students 
        FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());
    CREATE POLICY "Students can view own record" ON students FOR SELECT USING (user_id = auth.uid());
END $$;

-- 8.3 COURSES & INFRASTRUCTURE
DO $$ 
BEGIN 
    DROP POLICY IF EXISTS "Everyone can view academic infrastructure" ON colleges;
    DROP POLICY IF EXISTS "Admins manage colleges" ON colleges;
    DROP POLICY IF EXISTS "Public view colleges" ON colleges;

    CREATE POLICY "Admins manage colleges" ON colleges FOR ALL USING (is_admin());
    CREATE POLICY "Public view colleges" ON colleges FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Everyone can view departments" ON departments;
    DROP POLICY IF EXISTS "Admins manage departments" ON departments;
    DROP POLICY IF EXISTS "Public view departments" ON departments;

    CREATE POLICY "Admins manage departments" ON departments FOR ALL USING (is_admin());
    CREATE POLICY "Public view departments" ON departments FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Everyone can view courses" ON courses;
    DROP POLICY IF EXISTS "Admins manage academic infrastructure" ON courses;
    DROP POLICY IF EXISTS "Admins manage courses" ON courses;
    DROP POLICY IF EXISTS "Public view courses" ON courses;

    CREATE POLICY "Admins manage courses" ON courses FOR ALL USING (is_admin());
    CREATE POLICY "Public view courses" ON courses FOR SELECT USING (true);
END $$;

-- 8.4 ENROLLMENTS (student_courses)
DO $$ 
BEGIN 
    DROP POLICY IF EXISTS "Staff can view student enrollments" ON student_courses;
    DROP POLICY IF EXISTS "Admins have full access" ON student_courses;
    DROP POLICY IF EXISTS "Staff manage enrollments" ON student_courses;
    DROP POLICY IF EXISTS "Students can view own enrollments" ON student_courses;
    DROP POLICY IF EXISTS "Admins can manage enrollments" ON student_courses;
    DROP POLICY IF EXISTS "Students view own enrollments" ON student_courses;

    CREATE POLICY "Admins have full access" ON student_courses FOR ALL USING (is_admin());
    CREATE POLICY "Staff manage enrollments" ON student_courses FOR ALL USING (is_staff());
    CREATE POLICY "Students view own enrollments" ON student_courses 
        FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
END $$;

-- 8.5 RESULTS
DO $$ 
BEGIN 
    DROP POLICY IF EXISTS "Students see own results" ON results;
    DROP POLICY IF EXISTS "Staff manage results" ON results;
    DROP POLICY IF EXISTS "Admins have full access" ON results;
    DROP POLICY IF EXISTS "Students view own results" ON results;

    CREATE POLICY "Admins have full access" ON results FOR ALL USING (is_admin());
    CREATE POLICY "Staff manage results" ON results FOR ALL USING (is_staff());
    CREATE POLICY "Students view own results" ON results 
        FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
END $$;

-- 8.6 PAYMENTS
DO $$ 
BEGIN 
    DROP POLICY IF EXISTS "Students see own payments" ON payments;
    DROP POLICY IF EXISTS "Admins see all payments" ON payments;
    DROP POLICY IF EXISTS "Admins have full access" ON payments;
    DROP POLICY IF EXISTS "Students view own payments" ON payments;

    CREATE POLICY "Admins have full access" ON payments FOR ALL USING (is_admin());
    CREATE POLICY "Students view own payments" ON payments 
        FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));
END $$;

-- ==========================================
-- 9. TRIGGERS & FUNCTIONS
-- ==========================================

-- Trigger to create a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'SMS User'), 
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if trigger exists before creating
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    END IF;
END $$;

-- 10. DASHBOARD STATS (RPC)
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_students', (SELECT COUNT(*) FROM students WHERE deleted_at IS NULL),
        'total_staff', (SELECT COUNT(*) FROM staff),
        'total_courses', (SELECT COUNT(*) FROM courses),
        'pending_payments', (SELECT COUNT(*) FROM payments WHERE status = 'pending'),
        'recent_announcements', (SELECT COUNT(*) FROM announcements WHERE created_at > NOW() - INTERVAL '7 days')
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
