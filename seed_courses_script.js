
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env file
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const courses = [
    { code: 'ENT211', name: 'Entrepreneurship and Innovation', credit_unit: 2 },
    { code: 'GET201', name: 'Applied Electricity I', credit_unit: 3 },
    { code: 'GET209', 'name': 'Engineering Mathematics I', credit_unit: 3 },
    { code: 'GET203', name: 'Engineering Graphics and Solid Modeling II', credit_unit: 2 },
    { code: 'GET211', name: 'Computing and Software Engineering', credit_unit: 3 },
    { code: 'BUT-GST207', name: 'Life & Works of Olusegun Obasanjo I', credit_unit: 0 },
    { code: 'BUT-ICT215', name: 'Robotics I', credit_unit: 0 },
    { code: 'BUT-GET205', name: 'Fundamentals of Fluid Mechanics', credit_unit: 3 },
    { code: 'GET207', name: 'Applied Mechanics', credit_unit: 2 }
];

async function seed() {
    console.log('Starting seed process...');

    // 1. Upsert Courses
    console.log('Upserting courses...');
    for (const course of courses) {
        const { error } = await supabase
            .from('courses')
            .upsert(course, { onConflict: 'code' })
            .select();

        if (error) {
            console.error(`Error upserting course ${course.code}:`, error);
        } else {
            console.log(`Upserted course: ${course.code}`);
        }
    }

    // 2. Get all students
    console.log('Fetching students...');
    const { data: students, error: studentError } = await supabase
        .from('students')
        .select('id');

    if (studentError) {
        console.error('Error fetching students:', studentError);
        return;
    }

    console.log(`Found ${students.length} students. Enrolling them in new courses...`);

    // 3. Enroll all students in these courses
    // Get proper course IDs first
    const { data: dbCourses } = await supabase
        .from('courses')
        .select('id, code')
        .in('code', courses.map(c => c.code));

    if (!dbCourses) {
        console.error('Failed to retrieve course IDs');
        return;
    }

    for (const student of students) {
        const enrollments = dbCourses.map(c => ({
            student_id: student.id,
            course_id: c.id
        }));

        const { error: enrollError } = await supabase
            .from('student_courses')
            .upsert(enrollments, { onConflict: 'student_id,course_id' });

        if (enrollError) {
            console.error(`Error enrolling student ${student.id}:`, enrollError);
        } else {
            console.log(`Enrolled student ${student.id} in ${enrollments.length} courses.`);
        }
    }

    console.log('Seeding complete!');
    process.exit(0);
}

seed();
