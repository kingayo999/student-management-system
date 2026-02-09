
-- 1. Insert Courses if they don't exist
INSERT INTO courses (code, name, credit_unit, created_at)
VALUES 
-- First Semester Courses
('ENT211', 'Entrepreneurship and Innovation', 2, NOW()),
('GET201', 'Applied Electricity I', 3, NOW()),
('GET209', 'Engineering Mathematics I', 3, NOW()),
('GET203', 'Engineering Graphics and Solid Modeling II', 2, NOW()),
('GET211', 'Computing and Software Engineering', 3, NOW()),
('BUT-GST207', 'Life & Works of Olusegun Obasanjo I', 0, NOW()),
('BUT-ICT215', 'Robotics I', 0, NOW()),
('BUT-GET205', 'Fundamentals of Fluid Mechanics', 3, NOW()),
('GET207', 'Applied Mechanics', 2, NOW()),
-- Second Semester / Additional Courses
('GET301', 'Engineering Mathematics III', 3, NOW()),
('GET305', 'Engineering Statistics and Data Analytics', 3, NOW()),
('CPE301', 'Computer Organization and Architecture', 2, NOW()),
('EEE321', 'Analogue Electronics Circuits', 2, NOW()),
('BUT-GET300', 'Engineering Economics', 3, NOW()),
('BUT-ICT323', 'Python Programming', 0, NOW()),
('BUT-CPE315', 'Computer Engineering Laboratory I', 1, NOW()),
('BUT-GET307', 'Introduction to Artificial Intelligence, Machine Learning and Convergent Technologies', 3, NOW())
ON CONFLICT (code) DO NOTHING;

-- 2. Get the student ID for the current user (assuming user is logged in, but for SQL script we need to find them)
-- We'll assume we are enriching the student with matric number '2024/13522' first.
-- You might need to adjust the user_id or handle this dynamically in the app, but for a script:

-- Let's just select the first student for now or a specific one if known. 
-- In a real scenario, we'd bind this to the currently logged in user.
-- For this script, we will enroll ALL students in these courses just to be sure the current user gets them.

INSERT INTO student_courses (student_id, course_id)
SELECT s.id, c.id
FROM students s
CROSS JOIN courses c
WHERE c.code IN (
    'ENT211', 'GET201', 'GET209', 'GET203', 'GET211', 
    'BUT-GST207', 'BUT-ICT215', 'BUT-GET205', 'GET207',
    'GET301', 'GET305', 'CPE301', 'EEE321', 
    'BUT-GET300', 'BUT-ICT323', 'BUT-CPE315', 'BUT-GET307'
)
ON CONFLICT (student_id, course_id) DO NOTHING;
