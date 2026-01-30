# Database Schema Documentation

## Overview

HRM SaaS uses PostgreSQL (via Supabase) with Row-Level Security (RLS) for multi-tenancy.

## Entity Relationship Diagram
```
organizations (1) ──< (M) users
organizations (1) ──< (M) employees
organizations (1) ──< (M) departments
organizations (1) ──< (M) designations
organizations (1) ──< (M) leave_types
organizations (1) ──< (M) holidays

employees (1) ──< (M) documents
employees (1) ──< (M) attendances
employees (1) ──< (M) leaves
employees (1) ──< (M) salaries
employees (1) ──< (M) leave_balances

employees (M) ──> (1) departments
employees (M) ──> (1) designations
employees (1) ──> (1) users
employees (M) ──> (1) employees (manager)

leaves (M) ──> (1) leave_types
leave_balances (M) ──> (1) leave_types
```

## Complete SQL Schema

> **Note:** Run this in Supabase SQL Editor
```sql
[Insert the complete SQL schema from the previous prompt here]
```

## Table Descriptions

### Core Tables

#### `organizations`
**Purpose:** Stores organization/company information  
**RLS:** Users can only see their own organization  
**Key Fields:**
- `slug`: Unique URL identifier
- `subscription_plan`: Billing plan
- `settings`: JSONB for flexible configuration

#### `users`
**Purpose:** User accounts (extends Supabase auth.users)  
**RLS:** Users see only users in their organization  
**Key Fields:**
- `role`: ENUM (SUPER_ADMIN, HR_ADMIN, MANAGER, EMPLOYEE)
- `organization_id`: FK to organizations
- `is_active`: Soft delete flag

#### `employees`
**Purpose:** Employee profiles and employment details  
**RLS:** Users see only employees in their organization  
**Key Fields:**
- `employee_id`: Company-specific employee ID
- `user_id`: Link to users table
- `manager_id`: Self-referencing FK for hierarchy
- `status`: ENUM (ACTIVE, INACTIVE, ON_LEAVE, RESIGNED, TERMINATED)

#### `departments`
**Purpose:** Organizational departments  
**Example:** Engineering, HR, Sales, Marketing  
**Key Fields:**
- `head_id`: Employee who heads the department

#### `designations`
**Purpose:** Job titles/positions  
**Example:** Software Engineer, HR Manager, CEO  
**Key Fields:**
- `level`: Hierarchy level (1=lowest, higher=senior)

### Attendance Module

#### `attendances`
**Purpose:** Daily attendance records  
**Unique Constraint:** (employee_id, date)  
**Key Fields:**
- `check_in/check_out`: Timestamps
- `check_in_location/check_out_location`: JSONB with GPS coordinates
- `working_hours`: Calculated field
- `status`: ENUM (PRESENT, ABSENT, HALF_DAY, LEAVE, HOLIDAY, WEEKEND)

**Business Rules:**
- One record per employee per day
- Working hours calculated on check-out
- Overtime calculated if working_hours > 8

### Leave Management

#### `leave_types`
**Purpose:** Configurable leave categories  
**Examples:** Sick Leave, Casual Leave, Paid Leave  
**Key Fields:**
- `code`: Short identifier (SL, CL, PL)
- `default_days`: Annual allocation
- `carry_forward`: Whether unused leaves carry to next year
- `is_paid`: Whether leave is paid or unpaid

#### `leave_balances`
**Purpose:** Track leave balances per employee per year  
**Unique Constraint:** (employee_id, leave_type_id, year)  
**Key Fields:**
- `allocated`: Total leaves for the year
- `used`: Leaves taken
- `pending`: Leaves applied but not approved
- `available`: Computed column (allocated - used - pending)

**Business Rules:**
- Automatically initialized when employee is created
- Updated when leave is applied/approved/rejected

#### `leaves`
**Purpose:** Leave applications  
**Key Fields:**
- `status`: ENUM (PENDING, APPROVED, REJECTED, CANCELLED)
- `days`: Can be fractional (0.5 for half-day)
- `approver_id`: Employee who approved/rejected

**Business Rules:**
- Cannot apply if `available` balance < `days`
- Deducts from `available` immediately (into `pending`)
- Moves from `pending` to `used` on approval
- Restores `available` on rejection

#### `holidays`
**Purpose:** Company holiday calendar  
**Key Fields:**
- `type`: ENUM (PUBLIC, RESTRICTED, COMPANY)
- `is_optional`: Whether employees can choose to work

### Payroll Module

#### `salary_structures`
**Purpose:** Templates for salary components  
**Key Fields:**
- `components`: JSONB array of earning/deduction items
```json
  [
    {"name": "Basic", "type": "earning", "value": 50000, "isPercentage": false},
    {"name": "HRA", "type": "earning", "value": 40, "isPercentage": true},
    {"name": "PF", "type": "deduction", "value": 12, "isPercentage": true}
  ]
```

#### `salaries`
**Purpose:** Monthly salary records  
**Unique Constraint:** (employee_id, month, year)  
**Key Fields:**
- `basic_salary`: Base salary
- `earnings`: JSONB array of earnings breakdown
- `deductions`: JSONB array of deductions
- `gross_salary`: Total earnings
- `net_salary`: Take-home (gross - deductions)
- `status`: ENUM (DRAFT, PROCESSED, APPROVED, PAID)

**Business Rules:**
- One record per employee per month
- Processed based on attendance
- Status workflow: DRAFT → PROCESSED → APPROVED → PAID

### Documents Module

#### `documents`
**Purpose:** Store employee documents  
**Key Fields:**
- `type`: ENUM (RESUME, ID_PROOF, ADDRESS_PROOF, etc.)
- `file_url`: Supabase Storage URL
- `expiry_date`: For documents that expire

## Row-Level Security (RLS)

### Philosophy
Every table has RLS enabled. Users can only access data from their organization.

### Implementation Pattern
```sql
-- 1. Helper function to get user's organization
CREATE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- 2. RLS Policy on every table
CREATE POLICY "Isolate by organization"
  ON table_name FOR ALL
  USING (organization_id = get_user_organization_id());
```

### Policy Explanation
- `auth.uid()`: Current authenticated user ID from JWT
- `get_user_organization_id()`: Fetches user's organization
- `USING`: Automatically filters ALL queries

### Security Benefits
1. **Cannot be bypassed** - enforced at database level
2. **Zero-trust** - even compromised app code can't leak data
3. **Simple** - no need for organization checks in app code

## Indexes

### Automatic Indexes
- Primary keys
- Unique constraints
- Foreign keys

### Custom Indexes
```sql
-- Frequently queried fields
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_attendances_date ON attendances(date);
CREATE INDEX idx_leaves_status ON leaves(status);

-- Composite indexes for common queries
CREATE INDEX idx_attendances_employee_date ON attendances(employee_id, date);
CREATE INDEX idx_leaves_employee_status ON leaves(employee_id, status);
```

## Triggers & Functions

### Auto-Update Timestamps
```sql
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to all tables
CREATE TRIGGER update_[table]_updated_at 
  BEFORE UPDATE ON [table]
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### Initialize Leave Balances
```sql
-- Automatically creates leave balances when employee is added
CREATE TRIGGER after_employee_insert
  AFTER INSERT ON employees
  FOR EACH ROW
  EXECUTE FUNCTION trigger_initialize_leave_balances();
```

## Data Types & Constraints

### JSONB Fields

**When to use:**
- Flexible, schema-less data
- Arrays of objects
- Configuration data

**Examples:**
- `address`: Store full address object
- `emergency_contacts`: Array of contact objects
- `earnings/deductions`: Array of salary components

### ENUM Types

**Benefits:**
- Type safety
- Database-level validation
- Clear documentation

**Best Practices:**
- Use for fixed sets of values
- Keep list short (<20 values)
- Consider VARCHAR if values change frequently

## Queries & Performance

### Common Query Patterns

#### Get All Employees with Relations
```sql
SELECT 
  e.*,
  d.name as department_name,
  des.name as designation_name,
  m.first_name || ' ' || m.last_name as manager_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN designations des ON e.designation_id = des.id
LEFT JOIN employees m ON e.manager_id = m.id
WHERE e.organization_id = $1
  AND e.status = 'ACTIVE';
```

#### Get Attendance for Month
```sql
SELECT 
  a.*,
  e.first_name || ' ' || e.last_name as employee_name
FROM attendances a
JOIN employees e ON a.employee_id = e.id
WHERE a.organization_id = $1
  AND a.date >= $2
  AND a.date < $3
ORDER BY a.date DESC;
```

#### Get Leave Balance Summary
```sql
SELECT 
  lt.name,
  lt.code,
  lb.allocated,
  lb.used,
  lb.pending,
  lb.available
FROM leave_balances lb
JOIN leave_types lt ON lb.leave_type_id = lt.id
WHERE lb.employee_id = $1
  AND lb.year = $2;
```

### Performance Tips

1. **Always filter by organization_id first**
2. **Use proper indexes**
3. **Limit result sets**
4. **Use `select()` to specify needed columns**
5. **Avoid N+1 queries - use joins or batch fetches**

## Migrations Strategy

### File naming
```
migrations/
├── 001_initial_schema.sql
├── 002_add_performance_module.sql
├── 003_add_indexes.sql
```

### Best Practices
- One migration per feature
- Always test rollback
- Document breaking changes
- Keep migrations idempotent

## Backup & Recovery

### Supabase Features
- Automatic daily backups
- Point-in-time recovery
- Download backups manually

### Recommendations
- Enable daily backups
- Test restore procedure
- Keep local backup for development

## Data Seeding

### Development Data
```sql
-- Insert test organization
INSERT INTO organizations (name, slug, email) 
VALUES ('Test Corp', 'test-corp', 'admin@test.com');

-- Insert admin user (after auth.users created)
INSERT INTO users (id, organization_id, email, role) 
VALUES ('user-uuid', 'org-uuid', 'admin@test.com', 'SUPER_ADMIN');

-- Insert departments
INSERT INTO departments (organization_id, name) 
VALUES ('org-uuid', 'Engineering'), ('org-uuid', 'HR');

-- Insert leave types
INSERT INTO leave_types (organization_id, name, code, default_days) 
VALUES 
  ('org-uuid', 'Sick Leave', 'SL', 12),
  ('org-uuid', 'Casual Leave', 'CL', 12),
  ('org-uuid', 'Paid Leave', 'PL', 18);
```

## Type Generation

### Generate TypeScript Types
```bash
npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts
```

### Usage in Code
```typescript
import { Database } from '@/types/database.types'

type Employee = Database['public']['Tables']['employees']['Row']
type EmployeeInsert = Database['public']['Tables']['employees']['Insert']
type EmployeeUpdate = Database['public']['Tables']['employees']['Update']
```

---

**Schema Version:** 1.0.0  
**Last Updated:** January 2026