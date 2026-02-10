-- ==========================================
-- STEP-BY-STEP MIGRATION (Run each step separately)
-- ==========================================
-- Run these one at a time in Supabase SQL Editor
-- Check the output after each step before proceeding

-- ==========================================
-- STEP 1: Make old department column nullable
-- ==========================================
-- Run this first
ALTER TABLE students ALTER COLUMN department DROP NOT NULL;

-- Verify: Should return "Command completed successfully"
SELECT 'Step 1 complete: department column is now nullable' AS status;

-- ==========================================
-- STEP 2: Add new department_id column
-- ==========================================
-- Run this second
ALTER TABLE students ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

-- Verify: Check if column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'students' AND column_name = 'department_id';

-- ==========================================
-- STEP 3: Add college column
-- ==========================================
-- Run this third
ALTER TABLE students ADD COLUMN IF NOT EXISTS college TEXT;

-- Verify: Check if column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'students' AND column_name = 'college';

-- ==========================================
-- STEP 4: Drop old department column
-- ==========================================
-- Run this fourth (only after steps 1-3 succeed)
ALTER TABLE students DROP COLUMN IF EXISTS department;

-- Verify: Old column should be gone
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'students' AND column_name = 'department';
-- Should return no rows

-- ==========================================
-- STEP 5: Verify final schema
-- ==========================================
-- Run this to see the final result
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;
