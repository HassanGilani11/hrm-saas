-- Fix data ownership for SyntexDev
-- Updates placeholder organization_ids (0000...0001) to the actual SyntexDev organization ID

-- Set the variables for the session (manually in SQL editor)
-- Actual SyntexDev ID: 6369108c-91c3-41d4-9a2d-a3292c199450
-- Placeholder ID: 00000000-0000-0000-0000-000000000001

UPDATE public.salary_structures SET organization_id = '6369108c-91c3-41d4-9a2d-a3292c199450' WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE public.leave_types SET organization_id = '6369108c-91c3-41d4-9a2d-a3292c199450' WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE public.designations SET organization_id = '6369108c-91c3-41d4-9a2d-a3292c199450' WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE public.departments SET organization_id = '6369108c-91c3-41d4-9a2d-a3292c199450' WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE public.holidays SET organization_id = '6369108c-91c3-41d4-9a2d-a3292c199450' WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE public.leave_balances SET organization_id = '6369108c-91c3-41d4-9a2d-a3292c199450' WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE public.leaves SET organization_id = '6369108c-91c3-41d4-9a2d-a3292c199450' WHERE organization_id = '00000000-0000-0000-0000-000000000001';

-- Update remaining placeholder employees (skipping conflicts)
UPDATE public.employees
SET organization_id = '6369108c-91c3-41d4-9a2d-a3292c199450'
WHERE organization_id = '00000000-0000-0000-0000-000000000001'
AND employee_id NOT IN (SELECT employee_id FROM public.employees WHERE organization_id = '6369108c-91c3-41d4-9a2d-a3292c199450')
AND email NOT IN (SELECT email FROM public.employees WHERE organization_id = '6369108c-91c3-41d4-9a2d-a3292c199450');
