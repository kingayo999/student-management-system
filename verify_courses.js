
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    const codes = ['ENT211', 'GET201', 'GET209', 'GET203', 'GET211', 'BUT-GST207', 'BUT-ICT215', 'BUT-GET205', 'GET207'];
    const { data, error } = await supabase
        .from('courses')
        .select('code, name, credit_unit, id')
        .in('code', codes);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Verified Courses:', data.length);
        data.forEach(c => console.log(`- ${c.code}: ${c.name} (${c.credit_unit})`));
    }
}

verify();
