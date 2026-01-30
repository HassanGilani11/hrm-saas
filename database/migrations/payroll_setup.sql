-- Payroll Setup Migration

-- 1. Create employee_salary_settings table
CREATE TABLE IF NOT EXISTS employee_salary_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    salary_structure_id UUID REFERENCES salary_structures(id) ON DELETE SET NULL,
    base_salary DECIMAL(12, 2) NOT NULL DEFAULT 0, -- CTC or Basic depending on structure
    payment_method VARCHAR(50) DEFAULT 'BANK_TRANSFER', -- BANK_TRANSFER, CHEQUE, CASH
    bank_details JSONB DEFAULT '{}', -- { account_number, bank_name, ifsc, etc. }
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, employee_id)
);

-- 2. Add Indexes
CREATE INDEX IF NOT EXISTS idx_employee_salary_settings_org_id ON employee_salary_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_employee_salary_settings_emp_id ON employee_salary_settings(employee_id);

-- 3. Add RLS Policies
ALTER TABLE employee_salary_settings ENABLE ROW LEVEL SECURITY;

-- HR_ADMIN and SUPER_ADMIN can view and manage all salary settings
CREATE POLICY "Admins can view all salary settings" ON employee_salary_settings
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE organization_id = employee_salary_settings.organization_id 
            AND role IN ('HR_ADMIN', 'SUPER_ADMIN')
        )
    );

CREATE POLICY "Admins can insert salary settings" ON employee_salary_settings
    FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE organization_id = employee_salary_settings.organization_id 
            AND role IN ('HR_ADMIN', 'SUPER_ADMIN')
        )
    );

CREATE POLICY "Admins can update salary settings" ON employee_salary_settings
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE organization_id = employee_salary_settings.organization_id 
            AND role IN ('HR_ADMIN', 'SUPER_ADMIN')
        )
    );

CREATE POLICY "Admins can delete salary settings" ON employee_salary_settings
    FOR DELETE
    USING (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE organization_id = employee_salary_settings.organization_id 
            AND role IN ('HR_ADMIN', 'SUPER_ADMIN')
        )
    );

-- Employees can view their own salary settings (Read-only)
CREATE POLICY "Employees can view own salary settings" ON employee_salary_settings
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM employees 
            WHERE id = employee_salary_settings.employee_id
        )
    );

-- 4. Add trigger for updated_at
CREATE TRIGGER update_employee_salary_settings_updated_at
    BEFORE UPDATE ON employee_salary_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
