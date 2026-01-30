# Database SQL Files - Quick Reference

## 📁 Files Created

### 1. [schema.sql](file:///d:/NextJSProjects/hrm-saas/database/schema.sql)
**Purpose:** Complete database schema  
**Size:** ~800 lines  
**Contains:**
- ✅ 13 database tables
- ✅ 12 ENUM types
- ✅ 40+ indexes for performance
- ✅ Auto-update triggers for all tables
- ✅ Leave balance initialization trigger
- ✅ Row-Level Security (RLS) policies
- ✅ Multi-tenancy helper functions

**Run this FIRST in Supabase SQL Editor**

### 2. [seed.sql](file:///d:/NextJSProjects/hrm-saas/database/seed.sql)
**Purpose:** Development test data  
**Size:** ~300 lines  
**Contains:**
- ✅ 1 Test organization
- ✅ 7 Departments (Engineering, HR, Sales, etc.)
- ✅ 25 Designations (all levels)
- ✅ 7 Leave types (SL, CL, PL, etc.)
- ✅ 8 Holidays (2026 calendar)
- ✅ 1 Salary structure template

**Run this SECOND after creating an auth user**

### 3. [setup_storage.sql](file:///d:/NextJSProjects/hrm-saas/database/migrations/setup_storage.sql)
**Purpose:** Setup Supabase Storage  
**Size:** ~30 lines  
**Contains:**
- ✅ `employees` bucket creation
- ✅ Storage policies for upload/view

**Run this THIRD to enable image uploads**

### 4. [setup_auth_trigger.sql](file:///d:/NextJSProjects/hrm-saas/database/migrations/setup_auth_trigger.sql)
**Purpose:** Automate User/Org Creation  
**Size:** ~80 lines  
**Contains:**
- ✅ Trigger on `auth.users`
- ✅ Auto-creates Organization, User, Employee, Dept, Designation

**Run this FOURTH to enable Sign Up**

### 3. [README.md](file:///d:/NextJSProjects/hrm-saas/database/README.md)
**Purpose:** Setup instructions  
**Contains:**
- Step-by-step setup guide
- User creation instructions
- Troubleshooting tips
- Customization examples

## 🚀 Quick Setup (3 Steps)

### Step 1: Run Schema
```sql
-- In Supabase SQL Editor, run schema.sql
-- Takes ~30 seconds
```

### Step 2: Run Seed Data
```sql
-- In Supabase SQL Editor, run seed.sql
-- Takes ~5 seconds
```

### Step 3: Run Storage Setup
```sql
-- In Supabase SQL Editor, run setup_storage.sql
-- Enables image uploads
```

### Step 4: Create & Link User

1. **Supabase Auth Dashboard** → Create user with email/password
2. **Copy the User ID**
3. **Run this query** (replace the ID):

```sql
INSERT INTO users (id, organization_id, email, role, is_active)
VALUES (
    '<YOUR-AUTH-USER-ID>',
    '00000000-0000-0000-0000-000000000001',
    'admin@testcompany.com',
    'SUPER_ADMIN',
    true
);
```

## ✅ What You Get

After running these files:

| Feature | Status |
|---------|--------|
| Multi-tenant database | ✅ Ready |
| Row-Level Security | ✅ Enabled |
| Employee management | ✅ Tables created |
| Attendance tracking | ✅ Tables created |
| Leave management | ✅ Tables created |
| Payroll system | ✅ Tables created |
| Test organization | ✅ Seeded |
| Departments | ✅ 7 ready to use |
| Designations | ✅ 25 ready to use |
| Leave types | ✅ 7 configured |

## 🎯 Test Your Setup

After setup, verify everything works:

```bash
# Start dev server
npm run dev

# Visit these URLs:
# http://localhost:3000/login         ← Login
# http://localhost:3000/dashboard     ← Dashboard
# http://localhost:3000/employees     ← List (empty)
# http://localhost:3000/employees/new ← CREATE YOUR FIRST EMPLOYEE!
```

## 📊 Database Tables Reference

### Core Tables
- `organizations` - Company/tenant data
- `users` - User accounts (linked to auth)
- `departments` - Organizational units
- `designations` - Job titles
- `employees` - Employee profiles ⭐

### Attendance
- `attendances` - Daily attendance
- `holidays` - Company calendar

### Leave Management
- `leave_types` - Leave categories
- `leave_balances` - Employee balances
- `leaves` - Leave applications

### Payroll
- `salary_structures` - Salary templates
- `salaries` - Monthly payroll

### Documents
- `documents` - File storage metadata

## 🔒 Security Features

All tables have:
- ✅ RLS enabled
- ✅ Organization isolation
- ✅ Automatic timestamps
- ✅ Foreign key constraints
- ✅ Unique constraints where needed

## 💡 Key Features

### Auto-Generated Employee IDs
Format: `EMP2026001`, `EMP2026002`, etc.

### Leave Balance Auto-Initialization
New employees automatically get leave balances for all active leave types.

### Multi-Tenancy
RLS policies ensure data isolation between organizations.

## 🐛 Common Issues

**Build fails with TypeScript errors?**
- Normal until schema is created
- Run `schema.sql` and `seed.sql`
- Restart dev server

**Can't log in?**
- Create user in Supabase Auth first
- Run the INSERT query to link user
- Use the same email in both places

**Form shows "Setup Required"?**
- Departments/designations missing
- Run `seed.sql` to create them

## 📚 Documentation

Full details in:
- [schema.sql](file:///d:/NextJSProjects/hrm-saas/database/schema.sql) - Complete schema
- [seed.sql](file:///d:/NextJSProjects/hrm-saas/database/seed.sql) - Test data
- [README.md](file:///d:/NextJSProjects/hrm-saas/database/README.md) - Full instructions

---

**Ready to proceed!** Run the SQL files in Supabase and your employee creation form will be fully functional.
