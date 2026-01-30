# Database Setup Instructions

This directory contains the SQL files needed to set up your HRM SaaS database in Supabase.

## Files

- **`schema.sql`** - Complete database schema with tables, indexes, triggers, and RLS policies
- **`seed.sql`** - Development seed data for testing

## Quick Start

### 1. Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### 2. Run Schema Migration

1. Open `schema.sql` in a text editor
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Ctrl/Cmd + Enter)
5. Wait for completion (should take 10-30 seconds)

You should see "Schema created successfully!" message and a list of created tables.

### 3. Run Seed Data (Development Only)

1. Open `seed.sql` in a text editor
2. Copy the entire contents
3. Paste into a new query in Supabase SQL Editor
4. Click **Run**

This creates:
- ✅ Test organization ("Test Company")
- ✅ 7 Departments (Engineering, HR, Sales, etc.)
- ✅ 25+ Designations (from Junior to C-level)
- ✅ 7 Leave types (Sick, Casual, Paid, etc.)
- ✅ Sample holidays for 2026
- ✅ Default salary structure template

### 4. Create Your First User

**Important:** Users must be created in Supabase Auth first, then linked to the `users` table.

#### Step 4.1: Create Auth User

1. Go to **Authentication** > **Users** in Supabase dashboard
2. Click **Add User** → **Create new user**
3. Fill in:
   - Email: `admin@testcompany.com` (or your email)
   - Password: (choose a secure password)
   - Auto Confirm User: ✅ (check this)
4. Click **Create user**
5. **Copy the User ID** from the users list (it looks like: `3fa85f64-5717-4562-b3fc-2c963f66afa6`)

#### Step 4.2: Link User to Organization

1. Go back to **SQL Editor**
2. Run this query (replace `<YOUR-AUTH-USER-ID>` with the copied ID):

```sql
INSERT INTO users (id, organization_id, email, role, is_active)
VALUES (
    '<YOUR-AUTH-USER-ID>',  -- REPLACE THIS!
    '00000000-0000-0000-0000-000000000001',
    'admin@testcompany.com',
    'SUPER_ADMIN',
    true
);
```

3. Click **Run**

### 5. Test the Application

Now you can test your application:

```bash
# Start the development server
npm run dev
```

Navigate to:
- `http://localhost:3000/login` - Log in with the user you created
- `http://localhost:3000/dashboard` - View the dashboard
- `http://localhost:3000/employees` - View employees list
- `http://localhost:3000/employees/new` - Create a new employee!

## What Gets Created

### Tables (13 total)

| Table | Purpose |
|-------|---------|
| `organizations` | Company/organization records |
| `users` | User accounts linked to auth.users |
| `departments` | Organizational departments |
| `designations` | Job titles and positions |
| `employees` | Employee profiles and details |
| `attendances` | Daily attendance records |
| `leave_types` | Configurable leave categories |
| `leave_balances` | Employee leave balances by year |
| `leaves` | Leave applications |
| `holidays` | Company holiday calendar |
| `salary_structures` | Salary templates |
| `salaries` | Monthly salary records |
| `documents` | Employee document storage |

### Security Features

- ✅ **Row-Level Security (RLS)** enabled on all tables
- ✅ **Multi-tenancy isolation** via organization_id
- ✅ **Automatic timestamps** (created_at, updated_at)
- ✅ **Leave balance auto-initialization** for new employees
- ✅ **Foreign key constraints** for data integrity

### Auto-Generated Features

When you create a new employee:
1. ✅ Employee ID auto-generated (format: EMP2026001)
2. ✅ Leave balances automatically initialized
3. ✅ Organization isolation enforced by RLS

## Customization

### Adding Your Own Data

After running the seed data, you can customize:

**Add more departments:**
```sql
INSERT INTO departments (organization_id, name, description, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'Legal', 'Legal and compliance', true);
```

**Add more designations:**
```sql
INSERT INTO designations (organization_id, name, level, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'Product Manager', 5, true);
```

**Add custom leave types:**
```sql
INSERT INTO leave_types (organization_id, name, code, default_days, is_paid, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'Work From Home', 'WFH', 24, true, true);
```

### For Production

For production deployment:
1. **DO NOT** use the seed data as-is
2. Create your actual organization data
3. Use strong, unique passwords
4. Enable email verification in Supabase Auth
5. Review and adjust RLS policies if needed
6. Set up proper backup schedules

## Troubleshooting

### Error: "relation does not exist"
- **Cause:** Schema not created yet
- **Solution:** Run `schema.sql` first before `seed.sql`

### Error: "duplicate key value violates unique constraint"
- **Cause:** Seed data already exists
- **Solution:** Safe to ignore, or clear data and re-run

### Error: "insert or update on table violates foreign key constraint"
- **Cause:** Organization ID doesn't match
- **Solution:** Use the organization ID from your seed data (`00000000-0000-0000-0000-000000000001`)

### Cannot log in to application
- **Cause:** User not linked to `users` table
- **Solution:** Complete Step 4.2 above to link auth user to organization

### TypeScript errors in application
- **Cause:** Old TypeScript cache
- **Solution:** Delete `.next` folder and restart dev server:
  ```bash
  rm -rf .next
  npm run dev
  ```

## Database Management

### View Data

Check what's in your database:

```sql
-- Count employees
SELECT COUNT(*) FROM employees;

-- List all departments
SELECT name FROM departments ORDER BY name;

-- View leave balances for an employee
SELECT lt.name, lb.allocated, lb.used, lb.available
FROM leave_balances lb
JOIN leave_types lt ON lb.leave_type_id = lt.id
WHERE lb.employee_id = '<employee-id>';
```

### Reset Database

To start fresh:

```sql
-- WARNING: This deletes ALL data
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then re-run schema.sql and seed.sql
```

## Support

If you encounter issues:
1. Check the Supabase logs (Dashboard > Database > Logs)
2. Verify RLS policies are enabled
3. Ensure your auth user exists
4. Check that organization_id matches across tables

## Next Steps

After setting up the database:
1. ✅ Test the employee creation form
2. ✅ Create a few test employees
3. ⏳ Implement employee profile views
4. ⏳ Add edit/delete functionality
5. ⏳ Build attendance module
6. ⏳ Implement leave management
7. ⏳ Add payroll features

---

**Database Schema Version:** 1.0.0  
**Last Updated:** January 2026
