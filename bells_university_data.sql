-- ==========================================
-- BELLS UNIVERSITY OF TECHNOLOGY
-- COLLEGES AND DEPARTMENTS DATA
-- ==========================================
-- This script populates the colleges and departments tables
-- with the complete academic structure of Bells University

-- Clear existing data (optional - remove if you want to preserve existing data)
-- TRUNCATE TABLE departments CASCADE;
-- TRUNCATE TABLE colleges CASCADE;

-- ==========================================
-- 1. INSERT COLLEGES
-- ==========================================

INSERT INTO colleges (name, code) VALUES
('College of Engineering', 'COLENG'),
('College of Environmental Sciences', 'COLENVS'),
('College of Food, Agricultural Science and Technology', 'COLFAST'),
('College of Information and Communications Technology', 'COLICT'),
('College of Management Sciences', 'COLMANS'),
('College of Natural and Applied Sciences', 'COLNAS')
ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 2. INSERT DEPARTMENTS
-- ==========================================

-- Get college IDs for reference
DO $$
DECLARE
    coleng_id UUID;
    colenvs_id UUID;
    colfast_id UUID;
    colict_id UUID;
    colmans_id UUID;
    colnas_id UUID;
BEGIN
    -- Fetch college IDs
    SELECT id INTO coleng_id FROM colleges WHERE code = 'COLENG';
    SELECT id INTO colenvs_id FROM colleges WHERE code = 'COLENVS';
    SELECT id INTO colfast_id FROM colleges WHERE code = 'COLFAST';
    SELECT id INTO colict_id FROM colleges WHERE code = 'COLICT';
    SELECT id INTO colmans_id FROM colleges WHERE code = 'COLMANS';
    SELECT id INTO colnas_id FROM colleges WHERE code = 'COLNAS';

    -- ==========================================
    -- COLLEGE OF ENGINEERING (COLENG)
    -- ==========================================
    INSERT INTO departments (college_id, name, code) VALUES
    (coleng_id, 'Biomedical Engineering', 'BME'),
    (coleng_id, 'Civil Engineering', 'CVE'),
    (coleng_id, 'Computer Engineering', 'CPE'),
    (coleng_id, 'Electrical/Electronics Engineering', 'EEE'),
    (coleng_id, 'Mechanical Engineering', 'MEE'),
    (coleng_id, 'Mechatronics Engineering', 'MCE'),
    (coleng_id, 'Telecommunications Engineering', 'TCE')
    ON CONFLICT (code) DO NOTHING;

    -- ==========================================
    -- COLLEGE OF ENVIRONMENTAL SCIENCES (COLENVS)
    -- ==========================================
    INSERT INTO departments (college_id, name, code) VALUES
    (colenvs_id, 'Architecture', 'ARC'),
    (colenvs_id, 'Building Technology', 'BLD'),
    (colenvs_id, 'Estate Management', 'EST'),
    (colenvs_id, 'Quantity Surveying', 'QSV'),
    (colenvs_id, 'Surveying and Geoinformatics', 'SGI'),
    (colenvs_id, 'Urban and Regional Planning', 'URP')
    ON CONFLICT (code) DO NOTHING;

    -- ==========================================
    -- COLLEGE OF FOOD, AGRICULTURAL SCIENCE AND TECHNOLOGY (COLFAST)
    -- ==========================================
    INSERT INTO departments (college_id, name, code) VALUES
    (colfast_id, 'Agriculture and Agricultural Technology', 'AGR'),
    (colfast_id, 'Agronomy', 'AGN'),
    (colfast_id, 'Agribusiness', 'AGB'),
    (colfast_id, 'Fisheries and Animal Sciences', 'FAS'),
    (colfast_id, 'Biotechnology', 'BTC'),
    (colfast_id, 'Culinary Science and Hospitality Management', 'CSH'),
    (colfast_id, 'Food Technology', 'FDT'),
    (colfast_id, 'Food Science with Business', 'FSB'),
    (colfast_id, 'Nutrition and Dietetics', 'NTD')
    ON CONFLICT (code) DO NOTHING;

    -- ==========================================
    -- COLLEGE OF INFORMATION AND COMMUNICATIONS TECHNOLOGY (COLICT)
    -- ==========================================
    INSERT INTO departments (college_id, name, code) VALUES
    (colict_id, 'Computer Science and Technology', 'CSC'),
    (colict_id, 'Information Technology', 'IFT')
    ON CONFLICT (code) DO NOTHING;

    -- ==========================================
    -- COLLEGE OF MANAGEMENT SCIENCES (COLMANS)
    -- ==========================================
    INSERT INTO departments (college_id, name, code) VALUES
    (colmans_id, 'Accounting', 'ACC'),
    (colmans_id, 'Business Administration', 'BUS'),
    (colmans_id, 'Business Computing and IT', 'BCI'),
    (colmans_id, 'Economics', 'ECO'),
    (colmans_id, 'Finance and Banking', 'FIN'),
    (colmans_id, 'Human Resources Management', 'HRM'),
    (colmans_id, 'International Business', 'INB'),
    (colmans_id, 'Marketing', 'MKT'),
    (colmans_id, 'Project Management and Logistics', 'PML'),
    (colmans_id, 'Transport Management and Planning', 'TMP')
    ON CONFLICT (code) DO NOTHING;

    -- ==========================================
    -- COLLEGE OF NATURAL AND APPLIED SCIENCES (COLNAS)
    -- ==========================================
    INSERT INTO departments (college_id, name, code) VALUES
    (colnas_id, 'Applied Mathematics with Statistics', 'AMS'),
    (colnas_id, 'Biochemistry', 'BCH'),
    (colnas_id, 'Industrial Chemistry', 'CHM'),
    (colnas_id, 'Microbiology', 'MCB'),
    (colnas_id, 'Physics with Electronics', 'PHY')
    ON CONFLICT (code) DO NOTHING;

END $$;

-- ==========================================
-- 3. VERIFICATION QUERIES
-- ==========================================

-- View all colleges with department counts
SELECT 
    c.name AS college_name,
    c.code AS college_code,
    COUNT(d.id) AS department_count
FROM colleges c
LEFT JOIN departments d ON c.id = d.college_id
GROUP BY c.id, c.name, c.code
ORDER BY c.name;

-- View all departments organized by college
SELECT 
    c.name AS college_name,
    c.code AS college_code,
    d.name AS department_name,
    d.code AS department_code
FROM colleges c
LEFT JOIN departments d ON c.id = d.college_id
ORDER BY c.name, d.name;

-- Summary statistics
SELECT 
    'Total Colleges' AS metric,
    COUNT(*) AS count
FROM colleges
UNION ALL
SELECT 
    'Total Departments' AS metric,
    COUNT(*) AS count
FROM departments;
