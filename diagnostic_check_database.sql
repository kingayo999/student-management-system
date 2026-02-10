-- ==========================================
-- DIAGNOSTIC: Check Current Database State
-- ==========================================
-- Run this to see what's in your database

-- 1. Check if colleges exist
SELECT 'Colleges' AS table_name, COUNT(*) AS count FROM colleges;

-- 2. Check if departments exist
SELECT 'Departments' AS table_name, COUNT(*) AS count FROM departments;

-- 3. Check students table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;

-- 4. Check all students (including those without departments)
SELECT 
    s.id,
    s.reg_no,
    s.level,
    s.status,
    s.department_id,
    s.college,
    s.deleted_at,
    p.full_name,
    p.email,
    d.name AS department_name,
    c.name AS college_name
FROM students s
LEFT JOIN profiles p ON s.user_id = p.id
LEFT JOIN departments d ON s.department_id = d.id
LEFT JOIN colleges c ON d.college_id = c.id
ORDER BY s.created_at DESC;

-- 5. Check if there are any students with deleted_at NOT NULL
SELECT 
    COUNT(*) AS soft_deleted_students
FROM students
WHERE deleted_at IS NOT NULL;

-- 6. Check profiles that are students but don't have student records
SELECT 
    p.id,
    p.full_name,
    p.email,
    p.role
FROM profiles p
LEFT JOIN students s ON p.id = s.user_id
WHERE p.role = 'student' AND s.id IS NULL;
