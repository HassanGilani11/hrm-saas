-- Simple Force Update Script
-- This uses standard SQL commands to avoid "DO $$" syntax errors

-- 1. Update Leave Types (For ID ending in 0)
UPDATE public.leave_types
SET organization_id = '6369108c-91c3-41d4-9a2d-a3292c199450'
WHERE organization_id = '00000000-0000-0000-0000-000000000000';

-- 2. Update Leave Types (For ID ending in 1)
UPDATE public.leave_types
SET organization_id = '6369108c-91c3-41d4-9a2d-a3292c199450'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';

-- 3. Update Holidays (For ID ending in 0)
UPDATE public.holidays
SET organization_id = '6369108c-91c3-41d4-9a2d-a3292c199450'
WHERE organization_id = '00000000-0000-0000-0000-000000000000';

-- 4. Update Holidays (For ID ending in 1)
UPDATE public.holidays
SET organization_id = '6369108c-91c3-41d4-9a2d-a3292c199450'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';

-- 5. IMPORTANT: Re-run allocation if you haven't already
-- (You can run the allocate_leave_balances.sql script after this succeeds)
