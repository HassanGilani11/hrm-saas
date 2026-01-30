-- Trigger function to handle new user creation
-- This function automatically creates:
-- 1. Organization
-- 2. Public User
-- 3. Default Department
-- 4. Default Designation
-- 5. Employee Record

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
    dept_id UUID;
    desig_id UUID;
    company_name TEXT;
    first_name TEXT;
    last_name TEXT;
    emp_code TEXT;
BEGIN
    -- Get metadata
    company_name := COALESCE(new.raw_user_meta_data->>'company_name', 'My Organization');
    first_name := COALESCE(new.raw_user_meta_data->>'first_name', 'Admin');
    last_name := COALESCE(new.raw_user_meta_data->>'last_name', 'User');

    -- 1. Create Organization
    INSERT INTO public.organizations (name, slug, email, subscription_plan, subscription_status)
    VALUES (
        company_name, 
        lower(regexp_replace(company_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(new.id::text from 1 for 4), 
        new.email, 
        'FREE', 
        'ACTIVE'
    )
    RETURNING id INTO org_id;

    -- 2. Create Public User
    INSERT INTO public.users (id, organization_id, email, role, is_active)
    VALUES (new.id, org_id, new.email, 'SUPER_ADMIN', true);

    -- 3. Create Default Department (Administration)
    INSERT INTO public.departments (organization_id, name, description, is_active)
    VALUES (org_id, 'Administration', 'Default department for admins', true)
    RETURNING id INTO dept_id;

    -- 4. Create Default Designation (Owner/Admin)
    INSERT INTO public.designations (organization_id, name, level, is_active)
    VALUES (org_id, 'Owner', 1, true)
    RETURNING id INTO desig_id;

    -- 5. Create Employee Record
    emp_code := 'EMP' || to_char(current_date, 'YYYY') || '001';

    INSERT INTO public.employees (
        organization_id,
        user_id,
        employee_id,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        gender,
        employment_type,
        joining_date,
        status,
        department_id,
        designation_id
    )
    VALUES (
        org_id,
        new.id,
        emp_code,
        first_name,
        last_name,
        new.email,
        '', -- Phone placeholder
        '2000-01-01', -- DOB placeholder (Required by schema)
        'OTHER',
        'FULL_TIME',
        current_date,
        'ACTIVE',
        dept_id,
        desig_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
