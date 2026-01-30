-- ==========================================
-- FIX: Robust Auth Trigger & Dependencies
-- ==========================================

-- 1. Redefine leave balance trigger with SECURITY DEFINER to avoid permission issues
CREATE OR REPLACE FUNCTION public.trigger_initialize_leave_balances()
RETURNS TRIGGER AS $$
DECLARE
    leave_type_record RECORD;
    current_year INTEGER;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    FOR leave_type_record IN 
        SELECT * FROM public.leave_types 
        WHERE organization_id = NEW.organization_id 
        AND is_active = true
    LOOP
        INSERT INTO public.leave_balances (
            organization_id,
            employee_id,
            leave_type_id,
            year,
            allocated,
            used,
            pending
        ) VALUES (
            NEW.organization_id,
            NEW.id,
            leave_type_record.id,
            current_year,
            leave_type_record.default_days,
            0,
            0
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Redefine handle_new_user with SECURITY DEFINER and explicit casting
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
        'FREE'::public.subscription_plan, 
        'ACTIVE'::public.subscription_status
    )
    RETURNING id INTO org_id;

    -- 2. Create Public User
    INSERT INTO public.users (id, organization_id, email, role, is_active)
    VALUES (new.id, org_id, new.email, 'SUPER_ADMIN'::public.user_role, true);

    -- 3. Create Default Department
    INSERT INTO public.departments (organization_id, name, description, is_active)
    VALUES (org_id, 'Administration', 'Default department for admins', true)
    RETURNING id INTO dept_id;

    -- 4. Create Default Designation
    INSERT INTO public.designations (organization_id, name, level, is_active)
    VALUES (org_id, 'Owner', 1, true)
    RETURNING id INTO desig_id;

    -- 5. Create Employee Record (User ID must match auth.users ID)
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
        '', 
        '2000-01-01', 
        'OTHER'::public.gender,
        'FULL_TIME'::public.employment_type,
        current_date,
        'ACTIVE'::public.employee_status,
        dept_id,
        desig_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Re-create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
