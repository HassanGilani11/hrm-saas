-- =====================================================
-- HRM SaaS Database Schema
-- Version: 1.0.0
-- Last Updated: January 2026
-- =====================================================
-- This script creates all tables, indexes, triggers, and RLS policies
-- for the HRM SaaS application
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE subscription_plan AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'INACTIVE', 'TRIAL', 'CANCELLED');
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE');
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE marital_status AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');
CREATE TYPE employment_type AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN');
CREATE TYPE employee_status AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'RESIGNED', 'TERMINATED');
CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE', 'HOLIDAY', 'WEEKEND');
CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE holiday_type AS ENUM ('PUBLIC', 'RESTRICTED', 'COMPANY');
CREATE TYPE salary_status AS ENUM ('DRAFT', 'PROCESSED', 'APPROVED', 'PAID');
CREATE TYPE document_type AS ENUM ('RESUME', 'ID_PROOF', 'ADDRESS_PROOF', 'EDUCATION_CERTIFICATE', 'EXPERIENCE_LETTER', 'OFFER_LETTER', 'EMPLOYMENT_CONTRACT', 'OTHER');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Organizations Table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address JSONB,
    logo_url TEXT,
    subscription_plan subscription_plan DEFAULT 'FREE',
    subscription_status subscription_status DEFAULT 'TRIAL',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users Table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'EMPLOYEE',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments Table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    head_id UUID, -- Will add foreign key constraint after employees table is created
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Designations Table
CREATE TABLE designations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees Table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    employee_id VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender NOT NULL,
    blood_group VARCHAR(10),
    marital_status marital_status DEFAULT 'SINGLE',
    profile_image_url TEXT,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    designation_id UUID NOT NULL REFERENCES designations(id) ON DELETE RESTRICT,
    manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    employment_type employment_type NOT NULL,
    joining_date DATE NOT NULL,
    confirmation_date DATE,
    resignation_date DATE,
    status employee_status DEFAULT 'ACTIVE',
    current_address JSONB,
    permanent_address JSONB,
    emergency_contacts JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, employee_id),
    UNIQUE(organization_id, email)
);

-- Now add the foreign key constraint to departments.head_id
ALTER TABLE departments
ADD CONSTRAINT fk_departments_head_id
FOREIGN KEY (head_id) REFERENCES employees(id) ON DELETE SET NULL;

-- =====================================================
-- ATTENDANCE MODULE
-- =====================================================

-- Attendances Table
CREATE TABLE attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    check_in_location JSONB,
    check_out_location JSONB,
    working_hours DECIMAL(4, 2),
    overtime_hours DECIMAL(4, 2) DEFAULT 0,
    status attendance_status DEFAULT 'PRESENT',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, employee_id, date)
);

-- =====================================================
-- LEAVE MANAGEMENT MODULE
-- =====================================================

-- Leave Types Table
CREATE TABLE leave_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    description TEXT,
    default_days INTEGER NOT NULL,
    carry_forward BOOLEAN DEFAULT false,
    max_carry_forward INTEGER,
    is_paid BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

-- Leave Balances Table
CREATE TABLE leave_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    allocated INTEGER NOT NULL,
    used DECIMAL(4, 1) DEFAULT 0,
    pending DECIMAL(4, 1) DEFAULT 0,
    available DECIMAL(4, 1) GENERATED ALWAYS AS (allocated - used - pending) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, employee_id, leave_type_id, year)
);

-- Leaves Table
CREATE TABLE leaves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days DECIMAL(4, 1) NOT NULL,
    is_half_day BOOLEAN DEFAULT false,
    reason TEXT NOT NULL,
    status leave_status DEFAULT 'PENDING',
    approver_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    approver_notes TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Holidays Table
CREATE TABLE holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    type holiday_type DEFAULT 'PUBLIC',
    is_optional BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, date, name)
);

-- =====================================================
-- PAYROLL MODULE
-- =====================================================

-- Salary Structures Table
CREATE TABLE salary_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    components JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Salaries Table
CREATE TABLE salaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    basic_salary DECIMAL(12, 2) NOT NULL,
    earnings JSONB,
    deductions JSONB,
    gross_salary DECIMAL(12, 2) NOT NULL,
    net_salary DECIMAL(12, 2) NOT NULL,
    status salary_status DEFAULT 'DRAFT',
    payment_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, employee_id, month, year)
);

-- =====================================================
-- DOCUMENTS MODULE
-- =====================================================

-- Documents Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type document_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    expiry_date DATE,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Organizations
CREATE INDEX idx_organizations_slug ON organizations(slug);

-- Users
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Departments
CREATE INDEX idx_departments_organization_id ON departments(organization_id);
CREATE INDEX idx_departments_is_active ON departments(is_active);

-- Designations
CREATE INDEX idx_designations_organization_id ON designations(organization_id);
CREATE INDEX idx_designations_is_active ON designations(is_active);

-- Employees
CREATE INDEX idx_employees_organization_id ON employees(organization_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_employees_designation_id ON employees(designation_id);
CREATE INDEX idx_employees_manager_id ON employees(manager_id);
CREATE INDEX idx_employees_email ON employees(email);

-- Attendances
CREATE INDEX idx_attendances_organization_id ON attendances(organization_id);
CREATE INDEX idx_attendances_employee_id ON attendances(employee_id);
CREATE INDEX idx_attendances_date ON attendances(date);
CREATE INDEX idx_attendances_employee_date ON attendances(employee_id, date);

-- Leave Types
CREATE INDEX idx_leave_types_organization_id ON leave_types(organization_id);
CREATE INDEX idx_leave_types_is_active ON leave_types(is_active);

-- Leave Balances
CREATE INDEX idx_leave_balances_organization_id ON leave_balances(organization_id);
CREATE INDEX idx_leave_balances_employee_id ON leave_balances(employee_id);
CREATE INDEX idx_leave_balances_year ON leave_balances(year);

-- Leaves
CREATE INDEX idx_leaves_organization_id ON leaves(organization_id);
CREATE INDEX idx_leaves_employee_id ON leaves(employee_id);
CREATE INDEX idx_leaves_status ON leaves(status);
CREATE INDEX idx_leaves_employee_status ON leaves(employee_id, status);

-- Holidays
CREATE INDEX idx_holidays_organization_id ON holidays(organization_id);
CREATE INDEX idx_holidays_date ON holidays(date);

-- Salary Structures
CREATE INDEX idx_salary_structures_organization_id ON salary_structures(organization_id);
CREATE INDEX idx_salary_structures_is_active ON salary_structures(is_active);

-- Salaries
CREATE INDEX idx_salaries_organization_id ON salaries(organization_id);
CREATE INDEX idx_salaries_employee_id ON salaries(employee_id);
CREATE INDEX idx_salaries_month_year ON salaries(month, year);

-- Documents
CREATE INDEX idx_documents_organization_id ON documents(organization_id);
CREATE INDEX idx_documents_employee_id ON documents(employee_id);
CREATE INDEX idx_documents_type ON documents(type);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_designations_updated_at BEFORE UPDATE ON designations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendances_updated_at BEFORE UPDATE ON attendances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_types_updated_at BEFORE UPDATE ON leave_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON leave_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leaves_updated_at BEFORE UPDATE ON leaves FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_holidays_updated_at BEFORE UPDATE ON holidays FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_salary_structures_updated_at BEFORE UPDATE ON salary_structures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_salaries_updated_at BEFORE UPDATE ON salaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Initialize leave balances for new employees
CREATE OR REPLACE FUNCTION trigger_initialize_leave_balances()
RETURNS TRIGGER AS $$
DECLARE
    leave_type_record RECORD;
    current_year INTEGER;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    FOR leave_type_record IN 
        SELECT * FROM leave_types 
        WHERE organization_id = NEW.organization_id 
        AND is_active = true
    LOOP
        INSERT INTO leave_balances (
            organization_id,
            employee_id,
            leave_type_id,
            year,
            allocated,
            used,
            pending
        ) VALUES (
            NEW.organization_id,
            NEW.id,
            leave_type_record.id,
            current_year,
            leave_type_record.default_days,
            0,
            0
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply leave balance initialization trigger
CREATE TRIGGER after_employee_insert
AFTER INSERT ON employees
FOR EACH ROW
EXECUTE FUNCTION trigger_initialize_leave_balances();

-- =====================================================
-- ROW-LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Helper function: Get user's organization ID
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
    SELECT organization_id FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- RLS Policies: Organizations
CREATE POLICY "Users can view their own organization"
    ON organizations FOR SELECT
    USING (id = get_user_organization_id());

CREATE POLICY "Users can update their own organization"
    ON organizations FOR UPDATE
    USING (id = get_user_organization_id());

-- RLS Policies: Users
CREATE POLICY "Users can view users in their organization"
    ON users FOR SELECT
    USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can update their own record"
    ON users FOR UPDATE
    USING (id = auth.uid());

-- RLS Policies: Departments
CREATE POLICY "Isolate departments by organization"
    ON departments FOR ALL
    USING (organization_id = get_user_organization_id());

-- RLS Policies: Designations
CREATE POLICY "Isolate designations by organization"
    ON designations FOR ALL
    USING (organization_id = get_user_organization_id());

-- RLS Policies: Employees
CREATE POLICY "Isolate employees by organization"
    ON employees FOR ALL
    USING (organization_id = get_user_organization_id());

-- RLS Policies: Attendances
CREATE POLICY "Isolate attendances by organization"
    ON attendances FOR ALL
    USING (organization_id = get_user_organization_id());

-- RLS Policies: Leave Types
CREATE POLICY "Isolate leave types by organization"
    ON leave_types FOR ALL
    USING (organization_id = get_user_organization_id());

-- RLS Policies: Leave Balances
CREATE POLICY "Isolate leave balances by organization"
    ON leave_balances FOR ALL
    USING (organization_id = get_user_organization_id());

-- RLS Policies: Leaves
CREATE POLICY "Isolate leaves by organization"
    ON leaves FOR ALL
    USING (organization_id = get_user_organization_id());

-- RLS Policies: Holidays
CREATE POLICY "Isolate holidays by organization"
    ON holidays FOR ALL
    USING (organization_id = get_user_organization_id());

-- RLS Policies: Salary Structures
CREATE POLICY "Isolate salary structures by organization"
    ON salary_structures FOR ALL
    USING (organization_id = get_user_organization_id());

-- RLS Policies: Salaries
CREATE POLICY "Isolate salaries by organization"
    ON salaries FOR ALL
    USING (organization_id = get_user_organization_id());

-- RLS Policies: Documents
CREATE POLICY "Isolate documents by organization"
    ON documents FOR ALL
    USING (organization_id = get_user_organization_id());

-- =====================================================
-- INITIAL SEED DATA (Optional - for development)
-- =====================================================

-- Note: Uncomment and modify these for your development environment
-- You can also run these separately after schema creation

/*
-- Example Organization
INSERT INTO organizations (name, slug, email, subscription_plan, subscription_status)
VALUES ('Test Company', 'test-company', 'admin@test.com', 'FREE', 'ACTIVE');

-- Note: Users must be created through Supabase Auth first, then linked here
-- Example: 
-- INSERT INTO users (id, organization_id, email, role)
-- VALUES ('<auth-user-id>', '<org-id>', 'admin@test.com', 'SUPER_ADMIN');

-- Example Departments
INSERT INTO departments (organization_id, name, is_active)
VALUES 
    ('<org-id>', 'Engineering', true),
    ('<org-id>', 'Human Resources', true),
    ('<org-id>', 'Sales', true),
    ('<org-id>', 'Marketing', true),
    ('<org-id>', 'Operations', true);

-- Example Designations
INSERT INTO designations (organization_id, name, level, is_active)
VALUES 
    ('<org-id>', 'Software Engineer', 3, true),
    ('<org-id>', 'Senior Software Engineer', 4, true),
    ('<org-id>', 'Tech Lead', 5, true),
    ('<org-id>', 'Engineering Manager', 6, true),
    ('<org-id>', 'HR Manager', 5, true),
    ('<org-id>', 'HR Executive', 3, true);

-- Example Leave Types
INSERT INTO leave_types (organization_id, name, code, default_days, is_paid, carry_forward, is_active)
VALUES 
    ('<org-id>', 'Sick Leave', 'SL', 12, true, true, true),
    ('<org-id>', 'Casual Leave', 'CL', 12, true, false, true),
    ('<org-id>', 'Paid Leave', 'PL', 18, true, true, true),
    ('<org-id>', 'Unpaid Leave', 'UL', 0, false, false, true);
*/

-- =====================================================
-- SCHEMA CREATION COMPLETE
-- =====================================================

-- Verify schema
SELECT 'Schema created successfully!' AS status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
