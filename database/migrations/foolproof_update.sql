-- Foolproof Update Script (CORRECTED ID)
-- Run this in Supabase SQL Editor and check the "Results" or "Messages" tab

DO $$
DECLARE
    target_org_id UUID;
    -- The screenshot shows the ID ends in 1, not 0!
    placeholder_id_1 UUID := '00000000-0000-0000-0000-000000000001'; 
    placeholder_id_0 UUID := '00000000-0000-0000-0000-000000000000';
    count_before INTEGER;
    count_after INTEGER;
    current_user_text TEXT;
BEGIN
    -- 1. Check who is running this
    SELECT current_user INTO current_user_text;
    RAISE NOTICE 'Running as user: %', current_user_text;

    -- 2. Find target Organization ID
    SELECT id INTO target_org_id FROM organizations WHERE name = 'SyntexDev' LIMIT 1;
    
    IF target_org_id IS NULL THEN
        RAISE NOTICE 'WARNING: Could not find Organization "SyntexDev". Using hardcoded ID if you prefer.';
        -- Fallback to the ID you likely want if the name query fails
        target_org_id := '6369108c-91c3-41d4-9a2d-a3292c199450';
    END IF;

    RAISE NOTICE 'Target Organization ID: %', target_org_id;

    -- 3. Check for rows to update
    SELECT count(*) INTO count_before FROM leave_types 
    WHERE organization_id IN (placeholder_id_1, placeholder_id_0);
    
    RAISE NOTICE 'Found % rows with placeholder IDs in leave_types', count_before;

    -- 4. Perform Update on Leave Types
    UPDATE public.leave_types 
    SET organization_id = target_org_id 
    WHERE organization_id IN (placeholder_id_1, placeholder_id_0);
    
    GET DIAGNOSTICS count_after = ROW_COUNT;
    RAISE NOTICE 'Successfully updated % rows in leave_types', count_after;

    -- 5. Perform Update on Holidays
    UPDATE public.holidays 
    SET organization_id = target_org_id 
    WHERE organization_id IN (placeholder_id_1, placeholder_id_0);
    
    GET DIAGNOSTICS count_after = ROW_COUNT;
    RAISE NOTICE 'Successfully updated % rows in holidays', count_after;

END $$;
