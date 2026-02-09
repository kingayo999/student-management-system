-- ==========================================
-- BELLSTECH SMS - STUDENT EXPANSION PACK
-- ==========================================

-- 1. EXPAND STUDENTS TABLE
-- Add new fields for profile completeness
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS passport_url TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS college TEXT DEFAULT 'College of Engineering',
ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Nigerian',
ADD COLUMN IF NOT EXISTS state_of_origin TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('Male', 'Female', 'Other'));

-- 2. CREATE PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  purpose TEXT NOT NULL, -- e.g., 'Tuition Fee 2025/2026', 'Acceptance Fee'
  status TEXT NOT NULL CHECK (status IN ('pending', 'successful', 'failed')),
  reference TEXT UNIQUE NOT NULL, -- Transaction ID
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS for Payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own payments." ON payments
  FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all payments." ON payments
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

-- 3. CREATE RESULTS TABLE (Simplified for Demo)
CREATE TABLE IF NOT EXISTS results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  semester TEXT NOT NULL, -- e.g., 'First', 'Second'
  session TEXT NOT NULL, -- e.g., '2025/2026'
  score DECIMAL(5, 2),
  grade TEXT, -- e.g., 'A', 'B'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(student_id, course_id, session, semester)
);

-- RLS for Results
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own results." ON results
  FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Staff/Admins can manage results." ON results
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

-- 4. ACCOMMODATION TABLE (Hostel Management)
CREATE TABLE IF NOT EXISTS accommodations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  hostel_name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  bed_space TEXT,
  session TEXT NOT NULL,
  status TEXT DEFAULT 'allocated', -- 'allocated', 'pending', 'vacated'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS for Accommodation
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own accommodation." ON accommodations
  FOR SELECT USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

CREATE POLICY "Staff/Admins can manage accommodation." ON accommodations
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));


-- 5. SEED DATA FOR DEMO PURPOSES
-- This assumes you have at least one student user. 
-- You might need to adjust the student_id lookup if no students exist yet.
-- (Commented out to prevent errors if running on empty DB)

/*
INSERT INTO payments (student_id, amount, purpose, status, reference)
SELECT id, 500000.00, 'Tuition Fee 2025/2026', 'successful', 'REF-' || floor(random() * 1000000)::text
FROM students LIMIT 1;

INSERT INTO payments (student_id, amount, purpose, status, reference)
SELECT id, 25000.00, 'Medical Fee', 'pending', 'REF-' || floor(random() * 1000000)::text
FROM students LIMIT 1;
*/
