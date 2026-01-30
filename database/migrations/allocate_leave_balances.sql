-- Allocate Leave Balances (Pure SQL Version)
-- This script does NOT use "DO $$" blocks to avoid syntax errors in your editor.

-- Insert balances for all employees matching their organization's leave types
INSERT INTO leave_balances (
    organization_id,
    employee_id,
    leave_type_id,
    year,
    allocated,
    used,
    pending
)
SELECT 
    e.organization_id,
    e.id AS employee_id,
    lt.id AS leave_type_id,
    2026 AS year,          -- Hardcoded for current year
    lt.default_days,
    0 AS used,
    0 AS pending
FROM employees e
JOIN leave_types lt ON e.organization_id = lt.organization_id
WHERE lt.is_active = true
ON CONFLICT (organization_id, employee_id, leave_type_id, year) 
DO NOTHING;

-- Verification: Select count of created balances
SELECT count(*) as total_balances_created FROM leave_balances WHERE year = 2026;
