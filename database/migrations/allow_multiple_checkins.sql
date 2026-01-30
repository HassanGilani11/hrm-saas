-- Remove unique constraint to allow multiple check-ins per day
ALTER TABLE public.attendances 
DROP CONSTRAINT IF EXISTS attendances_organization_id_employee_id_date_key;

-- We still want to index query by date+employee, but allow duplicates
DROP INDEX IF EXISTS idx_attendances_employee_date;
CREATE INDEX idx_attendances_employee_date ON public.attendances(employee_id, date);
