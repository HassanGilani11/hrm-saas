-- Consolidation of Payroll Schema
-- RUN THIS IN THE SUPABASE SQL EDITOR

-- 1. Create employee_salary_settings table
CREATE TABLE IF NOT EXISTS employee_salary_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    salary_structure_id UUID REFERENCES salary_structures(id) ON DELETE SET NULL,
    base_salary DECIMAL(12, 2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) DEFAULT 'BANK_TRANSFER', -- BANK_TRANSFER, CHEQUE, CASH
    bank_details JSONB DEFAULT '{}',
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, employee_id)
);

-- 2. Add Indexes
CREATE INDEX IF NOT EXISTS idx_employee_salary_settings_org_id ON employee_salary_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_employee_salary_settings_emp_id ON employee_salary_settings(employee_id);

-- 3. Add RLS Policies for employee_salary_settings
ALTER TABLE employee_salary_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage salary settings" ON employee_salary_settings
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE organization_id = employee_salary_settings.organization_id 
            AND role IN ('HR_ADMIN', 'SUPER_ADMIN')
        )
    );

CREATE POLICY "Employees can view own salary settings" ON employee_salary_settings
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM employees 
            WHERE id = employee_salary_settings.employee_id
        )
    );

-- 4. Ensure RLS for salary_structures (if missing)
ALTER TABLE salary_structures ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'salary_structures' AND policyname = 'Admins can manage salary structures') THEN
        CREATE POLICY "Admins can manage salary structures" ON salary_structures
            FOR ALL
            USING (
                auth.uid() IN (
                    SELECT id FROM users 
                    WHERE organization_id = salary_structures.organization_id 
                    AND role IN ('HR_ADMIN', 'SUPER_ADMIN')
                )
            );
    END IF;
END $$;

-- 5. Ensure RLS for salaries (if missing)
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'salaries' AND policyname = 'Admins can manage salaries') THEN
        CREATE POLICY "Admins can manage salaries" ON salaries
            FOR ALL
            USING (
                auth.uid() IN (
                    SELECT id FROM users 
                    WHERE organization_id = salaries.organization_id 
                    AND role IN ('HR_ADMIN', 'SUPER_ADMIN')
                )
            );
    END IF;
END $$;

-- 6. Updated At Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_employee_salary_settings_updated_at') THEN
        CREATE TRIGGER update_employee_salary_settings_updated_at
            BEFORE UPDATE ON employee_salary_settings
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
