-- Force update Organization ID for Leave Types and Holidays
-- Directly using IDs to avoid any variable scoping issues

-- 1. Update Leave Types where ID is 0000...
UPDATE public.leave_types
SET organization_id = '6369108c-91c3-41d4-9a2d-a3292c199450'
WHERE organization_id = '00000000-0000-0000-0000-000000000000';

-- 2. Update Holidays where ID is 0000...
UPDATE public.holidays
SET organization_id = '6369108c-91c3-41d4-9a2d-a3292c199450'
WHERE organization_id = '00000000-0000-0000-0000-000000000000';

-- 3. Verify the update (Optional - select to check)
SELECT id, name, organization_id FROM public.leave_types;
