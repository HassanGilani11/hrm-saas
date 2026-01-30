-- Fix RLS policies for employees table
-- This ensures users can see employees from their organization

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Isolate employees by organization" ON employees;

-- Recreate the get_user_organization_id function to ensure it's properly set
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
    SELECT organization_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Create SELECT policy for employees
CREATE POLICY "Users can view employees in their organization"
    ON employees FOR SELECT
    USING (organization_id = get_user_organization_id());

-- Create INSERT policy for employees (HR_ADMIN and SUPER_ADMIN only)
CREATE POLICY "HR admins can insert employees"
    ON employees FOR INSERT
    WITH CHECK (
        organization_id = get_user_organization_id() 
        AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('HR_ADMIN', 'SUPER_ADMIN')
        )
    );

-- Create UPDATE policy for employees
CREATE POLICY "HR admins can update employees"
    ON employees FOR UPDATE
    USING (
        organization_id = get_user_organization_id() 
        AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('HR_ADMIN', 'SUPER_ADMIN', 'MANAGER')
        )
    );

-- Create DELETE policy for employees
CREATE POLICY "Admins can delete employees"
    ON employees FOR DELETE
    USING (
        organization_id = get_user_organization_id() 
        AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('SUPER_ADMIN')
        )
    );

-- Ensure RLS is enabled
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
