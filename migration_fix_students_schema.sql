-- ==========================================
-- SCHEMA MIGRATION: STUDENTS TABLE
-- Fix department column conflict
-- ==========================================
-- This script migrates from the old schema (department TEXT) 
-- to the new schema (department_id UUID + college TEXT)

-- STEP 1: Drop the old NOT NULL constraint on department if it exists
-- This allows us to work with the column safely
ALTER TABLE students 
ALTER COLUMN department DROP NOT NULL;

-- STEP 2: Add new columns if they don't exist
-- These are the columns from the complete schema
ALTER TABLE students ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS passport_url TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Nigerian';
ALTER TABLE students ADD COLUMN IF NOT EXISTS state_of_origin TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('Male', 'Female', 'Other'));
ALTER TABLE students ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- STEP 3: Migrate existing data (if any students exist with old department TEXT)
-- This attempts to match old department names to new department IDs
-- You may need to customize this based on your existing data
DO $$
DECLARE
    dept_record RECORD;
BEGIN
    -- Only run if the old department column exists and has data
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'students' AND column_name = 'department'
    ) THEN
        -- Try to match old department text to new department names
        FOR dept_record IN 
            SELECT DISTINCT department FROM students WHERE department IS NOT NULL
        LOOP
            UPDATE students s
            SET department_id = d.id,
                college = c.code
            FROM departments d
            JOIN colleges c ON d.college_id = c.id
            WHERE s.department = dept_record.department
            AND d.name ILIKE '%' || dept_record.department || '%'
            AND s.department_id IS NULL;
        END LOOP;
    END IF;
END $$;

-- STEP 4: Drop the old department column
-- This removes the TEXT column that's causing the conflict
ALTER TABLE students DROP COLUMN IF EXISTS department;

-- STEP 5: Update the level constraint to match the complete schema
-- Ensure the level column has the correct CHECK constraint
DO $$
BEGIN
    -- Drop existing constraint if it exists
    ALTER TABLE students DROP CONSTRAINT IF EXISTS students_level_check;
    
    -- Add the correct constraint
    ALTER TABLE students ADD CONSTRAINT students_level_check 
    CHECK (level IN ('100', '200', '300', '400', '500', 'PG'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- STEP 6: Update the status constraint to match the complete schema
DO $$
BEGIN
    -- Drop existing constraint if it exists
    ALTER TABLE students DROP CONSTRAINT IF EXISTS students_status_check;
    
    -- Add the correct constraint
    ALTER TABLE students ADD CONSTRAINT students_status_check 
    CHECK (status IN ('active', 'inactive', 'graduated', 'withdrawn'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- STEP 7: Verification - Check the new schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;

-- STEP 8: Show any students that still need department assignment
SELECT 
    id,
    reg_no,
    department_id,
    college,
    level,
    status
FROM students
WHERE department_id IS NULL;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Old department TEXT column removed';
    RAISE NOTICE 'New department_id UUID column ready';
    RAISE NOTICE 'Please review the verification queries above';
END $$;
