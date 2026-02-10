-- ==========================================
-- COMPLETE SETUP SCRIPT
-- Run this in order after migration
-- ==========================================
-- This script should be run in the following order:
-- 1. migration_fix_students_schema.sql (fixes the schema)
-- 2. bells_university_data.sql (populates colleges and departments)
-- 3. This file (optional: adds sample data for testing)

-- ==========================================
-- OPTIONAL: ADD SAMPLE ACADEMIC SESSION
-- ==========================================
INSERT INTO academic_sessions (name, is_current, start_date, end_date) VALUES
('2025/2026', true, '2025-09-01', '2026-07-31')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- VERIFICATION: Check Complete Setup
-- ==========================================

-- 1. Check colleges
SELECT 'Colleges' AS entity, COUNT(*) AS count FROM colleges;

-- 2. Check departments by college
SELECT 
    c.name AS college,
    COUNT(d.id) AS department_count
FROM colleges c
LEFT JOIN departments d ON c.id = d.college_id
GROUP BY c.name
ORDER BY c.name;

-- 3. Check students table schema
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'students'
AND column_name IN ('department_id', 'college', 'level', 'status')
ORDER BY ordinal_position;

-- 4. Check if students can be enrolled
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM colleges) AND EXISTS (SELECT 1 FROM departments)
        THEN 'Ready for student enrollment ✓'
        ELSE 'Missing colleges or departments data ✗'
    END AS status;
