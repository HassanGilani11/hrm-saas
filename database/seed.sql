-- =====================================================
-- HRM SaaS Seed Data
-- Version: 1.0.0
-- Purpose: Development and testing seed data
-- =====================================================
-- Run this AFTER running schema.sql
-- Make sure to replace <placeholders> with actual IDs
-- =====================================================

-- =====================================================
-- STEP 1: Create Test Organization
-- =====================================================

INSERT INTO organizations (id, name, slug, email, phone, subscription_plan, subscription_status)
VALUES (
    '00000000-0000-0000-0000-000000000001', -- Use this ID for all seed data
    'Test Company',
    'test-company',
    'admin@testcompany.com',
    '1234567890',
    'PRO',
    'ACTIVE'
) ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- STEP 2: Create Test User in Supabase Auth First!
-- =====================================================
-- Go to Supabase Dashboard > Authentication > Users
-- Click "Add User" and create a user with:
--   Email: admin@testcompany.com
--   Password: (choose a secure password)
-- Copy the generated User ID and use it in the query below

-- After creating user in Auth, link to users table:
-- Replace <YOUR-AUTH-USER-ID> with the actual ID from Supabase Auth

/*
INSERT INTO users (id, organization_id, email, role, is_active)
VALUES (
    '<YOUR-AUTH-USER-ID>', -- REPLACE THIS with actual auth user ID
    '00000000-0000-0000-0000-000000000001',
    'admin@testcompany.com',
    'SUPER_ADMIN',
    true
);
*/

-- =====================================================
-- STEP 3: Create Departments
-- =====================================================

INSERT INTO departments (organization_id, name, description, is_active)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Engineering', 'Software development and technical teams', true),
    ('00000000-0000-0000-0000-000000000001', 'Human Resources', 'HR and people operations', true),
    ('00000000-0000-0000-0000-000000000001', 'Sales', 'Sales and business development', true),
    ('00000000-0000-0000-0000-000000000001', 'Marketing', 'Marketing and brand management', true),
    ('00000000-0000-0000-0000-000000000001', 'Operations', 'Operations and administration', true),
    ('00000000-0000-0000-0000-000000000001', 'Finance', 'Finance and accounting', true),
    ('00000000-0000-0000-0000-000000000001', 'Customer Support', 'Customer success and support', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 4: Create Designations
-- =====================================================

INSERT INTO designations (organization_id, name, description, level, is_active)
VALUES 
    -- Engineering
    ('00000000-0000-0000-0000-000000000001', 'Junior Software Engineer', 'Entry-level software engineer', 2, true),
    ('00000000-0000-0000-0000-000000000001', 'Software Engineer', 'Mid-level software engineer', 3, true),
    ('00000000-0000-0000-0000-000000000001', 'Senior Software Engineer', 'Senior software engineer', 4, true),
    ('00000000-0000-0000-0000-000000000001', 'Tech Lead', 'Technical team lead', 5, true),
    ('00000000-0000-0000-0000-000000000001', 'Engineering Manager', 'Engineering team manager', 6, true),
    ('00000000-0000-0000-0000-000000000001', 'VP of Engineering', 'Vice President of Engineering', 8, true),
    
    -- HR
    ('00000000-0000-0000-0000-000000000001', 'HR Executive', 'HR operations executive', 3, true),
    ('00000000-0000-0000-0000-000000000001', 'HR Manager', 'Human resources manager', 5, true),
    ('00000000-0000-0000-0000-000000000001', 'Head of HR', 'Head of human resources', 7, true),
    
    -- Sales
    ('00000000-0000-0000-0000-000000000001', 'Sales Executive', 'Sales representative', 3, true),
    ('00000000-0000-0000-0000-000000000001', 'Senior Sales Executive', 'Senior sales representative', 4, true),
    ('00000000-0000-0000-0000-000000000001', 'Sales Manager', 'Sales team manager', 5, true),
    ('00000000-0000-0000-0000-000000000001', 'Sales Director', 'Director of sales', 7, true),
    
    -- Marketing
    ('00000000-0000-0000-0000-000000000001', 'Marketing Executive', 'Marketing executive', 3, true),
    ('00000000-0000-0000-0000-000000000001', 'Marketing Manager', 'Marketing manager', 5, true),
    ('00000000-0000-0000-0000-000000000001', 'Head of Marketing', 'Head of marketing', 7, true),
    
    -- Operations
    ('00000000-0000-0000-0000-000000000001', 'Operations Executive', 'Operations executive', 3, true),
    ('00000000-0000-0000-0000-000000000001', 'Operations Manager', 'Operations manager', 5, true),
    
    -- Finance
    ('00000000-0000-0000-0000-000000000001', 'Accountant', 'Accountant', 3, true),
    ('00000000-0000-0000-0000-000000000001', 'Finance Manager', 'Finance manager', 5, true),
    ('00000000-0000-0000-0000-000000000001', 'CFO', 'Chief Financial Officer', 9, true),
    
    -- Support
    ('00000000-0000-0000-0000-000000000001', 'Support Executive', 'Customer support executive', 2, true),
    ('00000000-0000-0000-0000-000000000001', 'Support Manager', 'Customer support manager', 5, true),
    
    -- Management
    ('00000000-0000-0000-0000-000000000001', 'CEO', 'Chief Executive Officer', 10, true),
    ('00000000-0000-0000-0000-000000000001', 'CTO', 'Chief Technology Officer', 9, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 5: Create Leave Types
-- =====================================================

INSERT INTO leave_types (organization_id, name, code, description, default_days, carry_forward, max_carry_forward, is_paid, is_active)
VALUES 
    (
        '00000000-0000-0000-0000-000000000001', 
        'Sick Leave', 
        'SL', 
        'Leave for medical reasons or illness',
        12, 
        true, 
        6, 
        true, 
        true
    ),
    (
        '00000000-0000-0000-0000-000000000001', 
        'Casual Leave', 
        'CL', 
        'Leave for personal work or emergencies',
        12, 
        false, 
        null, 
        true, 
        true
    ),
    (
        '00000000-0000-0000-0000-000000000001', 
        'Paid Leave', 
        'PL', 
        'Annual paid vacation leave',
        18, 
        true, 
        10, 
        true, 
        true
    ),
    (
        '00000000-0000-0000-0000-000000000001', 
        'Unpaid Leave', 
        'UL', 
        'Leave without pay',
        0, 
        false, 
        null, 
        false, 
        true
    ),
    (
        '00000000-0000-0000-0000-000000000001', 
        'Maternity Leave', 
        'ML', 
        'Maternity leave for mothers',
        180, 
        false, 
        null, 
        true, 
        true
    ),
    (
        '00000000-0000-0000-0000-000000000001', 
        'Paternity Leave', 
        'PTL', 
        'Paternity leave for fathers',
        15, 
        false, 
        null, 
        true, 
        true
    ),
    (
        '00000000-0000-0000-0000-000000000001', 
        'Bereavement Leave', 
        'BL', 
        'Leave for family bereavement',
        5, 
        false, 
        null, 
        true, 
        true
    )
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 6: Create Public Holidays (India 2026 example)
-- =====================================================

INSERT INTO holidays (organization_id, name, date, type, is_optional, description)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Republic Day', '2026-01-26', 'PUBLIC', false, 'Republic Day of India'),
    ('00000000-0000-0000-0000-000000000001', 'Holi', '2026-03-14', 'PUBLIC', false, 'Festival of Colors'),
    ('00000000-0000-0000-0000-000000000001', 'Good Friday', '2026-04-03', 'RESTRICTED', true, 'Christian holiday'),
    ('00000000-0000-0000-0000-000000000001', 'Independence Day', '2026-08-15', 'PUBLIC', false, 'Independence Day of India'),
    ('00000000-0000-0000-0000-000000000001', 'Gandhi Jayanti', '2026-10-02', 'PUBLIC', false, 'Birthday of Mahatma Gandhi'),
    ('00000000-0000-0000-0000-000000000001', 'Diwali', '2026-10-30', 'PUBLIC', false, 'Festival of Lights'),
    ('00000000-0000-0000-0000-000000000001', 'Christmas', '2026-12-25', 'PUBLIC', false, 'Christmas Day'),
    ('00000000-0000-0000-0000-000000000001', 'Company Foundation Day', '2026-01-01', 'COMPANY', false, 'Company anniversary')
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 7: Create Sample Salary Structure
-- =====================================================

INSERT INTO salary_structures (organization_id, name, description, components, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Standard Salary Structure',
    'Default salary structure for permanent employees',
    '[
        {"name": "Basic Salary", "type": "earning", "value": 100, "isPercentage": true, "baseComponent": null},
        {"name": "HRA", "type": "earning", "value": 40, "isPercentage": true, "baseComponent": "Basic Salary"},
        {"name": "DA", "type": "earning", "value": 20, "isPercentage": true, "baseComponent": "Basic Salary"},
        {"name": "Special Allowance", "type": "earning", "value": 10, "isPercentage": true, "baseComponent": "Basic Salary"},
        {"name": "PF", "type": "deduction", "value": 12, "isPercentage": true, "baseComponent": "Basic Salary"},
        {"name": "Professional Tax", "type": "deduction", "value": 200, "isPercentage": false, "baseComponent": null},
        {"name": "Income Tax", "type": "deduction", "value": 10, "isPercentage": true, "baseComponent": "Gross"}
    ]'::jsonb,
    true
) ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check what was created
SELECT 'Organizations created:' as info, COUNT(*) as count FROM organizations;
SELECT 'Departments created:' as info, COUNT(*) as count FROM departments;
SELECT 'Designations created:' as info, COUNT(*) as count FROM designations;
SELECT 'Leave types created:' as info, COUNT(*) as count FROM leave_types;
SELECT 'Holidays created:' as info, COUNT(*) as count FROM holidays;
SELECT 'Salary structures created:' as info, COUNT(*) as count FROM salary_structures;

-- Show departments
SELECT id, name, description FROM departments ORDER BY name;

-- Show designations (grouped by common roles)
SELECT id, name, level, description FROM designations ORDER BY level, name;

-- Show leave types
SELECT name, code, default_days, is_paid, carry_forward FROM leave_types ORDER BY name;

-- Show holidays for 2026
SELECT name, date, type, is_optional FROM holidays WHERE EXTRACT(YEAR FROM date) = 2026 ORDER BY date;

-- =====================================================
-- NEXT STEPS
-- =====================================================

/*
AFTER running this seed data:

1. Create a user in Supabase Auth Dashboard
2. Uncomment and run the INSERT query in STEP 2 with your actual auth user ID
3. Log in to the application with that user
4. You should now be able to:
   - Access the dashboard at /dashboard
   - View employees list at /employees
   - Add new employees at /employees/new

The form will now work because:
✓ Organizations exist
✓ Departments exist (required for employee form)
✓ Designations exist (required for employee form)
✓ Leave types exist (for auto-balance initialization)
✓ User has SUPER_ADMIN role (can create employees)
*/

-- =====================================================
-- SEED DATA COMPLETE
-- =====================================================

SELECT 'Seed data created successfully! Remember to create a user in Supabase Auth and link it to the users table.' AS status;
