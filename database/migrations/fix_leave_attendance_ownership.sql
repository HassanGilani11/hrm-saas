-- Fix data ownership for Leave Types and Holidays
-- Updates placeholder organization_ids (0000...0000) to the actual SyntexDev organization ID

DO $$
DECLARE
    syntex_org_id UUID := '6369108c-91c3-41d4-9a2d-a3292c199450';
    placeholder_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- Update Leave Types
    UPDATE public.leave_types
    SET organization_id = syntex_org_id
    WHERE organization_id = placeholder_id;

    -- Update Holidays
    UPDATE public.holidays
    SET organization_id = syntex_org_id
    WHERE organization_id = placeholder_id;

END $$;
