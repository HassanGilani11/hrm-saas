# Feature Specifications

Complete specifications for all HRM SaaS features in Phase 1.

## Module 1: Authentication & Multi-tenancy

### 1.1 User Registration & Organization Setup

**User Story:** As a new user, I want to create an account and set up my organization so I can start using the HRM system.

**Acceptance Criteria:**
- ✅ User can register with email and password
- ✅ Organization name and slug are collected
- ✅ Organization slug must be unique
- ✅ First user automatically becomes SUPER_ADMIN
- ✅ Email verification sent (optional for MVP)
- ✅ User redirected to organization setup wizard

**UI Components:**
- Registration form with validation
- Organization setup wizard (3 steps)
  1. Company details
  2. Department setup
  3. Designation setup

**API Endpoints:**
- `POST /api/auth/register`
- `POST /api/organizations/setup`

**Database Tables:**
- `organizations`
- `users` (linked to auth.users)

**Validations:**
```typescript
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  organizationName: z.string().min(2).max(100),
  organizationSlug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
})
```

---

### 1.2 User Login

**User Story:** As a registered user, I want to log in to access my organization's HRM data.

**Acceptance Criteria:**
- ✅ User can login with email/password
- ✅ Invalid credentials show error message
- ✅ Successful login redirects to dashboard
- ✅ Session persists across page refreshes
- ✅ "Remember me" option (optional)

**UI Components:**
- Login form
- Password visibility toggle
- "Forgot password" link
- Social login (future)

---

### 1.3 Role-Based Access Control (RBAC)

**Roles:**

| Role | Permissions |
|------|-------------|
| **SUPER_ADMIN** | Full access to everything |
| **HR_ADMIN** | Manage employees, attendance, leaves, payroll |
| **MANAGER** | View team, approve team leaves, view team attendance |
| **EMPLOYEE** | View own data, apply leave, mark attendance |

**Implementation:**
```typescript
const permissions = {
  SUPER_ADMIN: ['*'],
  HR_ADMIN: ['employees.*', 'attendance.*', 'leaves.*', 'payroll.*'],
  MANAGER: ['employees.read', 'leaves.approve_team', 'attendance.view_team'],
  EMPLOYEE: ['profile.*', 'attendance.self', 'leaves.apply'],
}

function hasPermission(userRole: Role, permission: string): boolean {
  const userPermissions = permissions[userRole]
  return userPermissions.includes('*') || userPermissions.includes(permission)
}
```

---

## Module 2: Employee Management

### 2.1 Add Employee

**User Story:** As an HR Admin, I want to add new employees to the system with all their details.

**Acceptance Criteria:**
- ✅ Form with all employee fields
- ✅ Validation for required fields
- ✅ Upload profile picture
- ✅ Auto-generate employee ID
- ✅ Send invitation email to employee
- ✅ Create user account automatically
- ✅ Initialize leave balances

**Form Sections:**
1. **Personal Information**
   - First Name, Last Name
   - Email, Phone
   - Date of Birth
   - Gender
   - Blood Group
   - Marital Status
   - Profile Image

2. **Employment Information**
   - Employee ID (auto-generated)
   - Department
   - Designation
   - Reporting Manager
   - Employment Type
   - Joining Date
   - Confirmation Date (optional)

3. **Address Information**
   - Current Address
   - Permanent Address

4. **Emergency Contacts**
   - Name, Relationship, Phone (multiple)

**Validations:**
```typescript
const employeeSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^[0-9]{10}$/),
  dateOfBirth: z.date().max(new Date()),
  departmentId: z.string().uuid(),
  designationId: z.string().uuid(),
  joiningDate: z.date(),
  // ... other fields
})
```

---

### 2.2 View Employees

**User Story:** As an HR Admin, I want to see a list of all employees with filtering and search.

**Acceptance Criteria:**
- ✅ Table view with key employee info
- ✅ Search by name, email, employee ID
- ✅ Filter by department, designation, status
- ✅ Sort by any column
- ✅ Pagination (50 per page)
- ✅ Export to CSV/Excel
- ✅ Click to view full profile

**Table Columns:**
- Profile Picture
- Employee ID
- Name
- Email
- Department
- Designation
- Status
- Actions (View, Edit, Delete)

**Filters:**
- Department (multi-select)
- Designation (multi-select)
- Status (Active, Inactive, On Leave, Resigned)
- Employment Type

---

### 2.3 Employee Profile

**User Story:** As any user, I want to view detailed employee information.

**Acceptance Criteria:**
- ✅ All employee details displayed
- ✅ Documents section with uploads
- ✅ Attendance summary (last 30 days)
- ✅ Leave balance display
- ✅ Salary information (HR only)
- ✅ Edit button (HR only)
- ✅ Organizational hierarchy view

**Sections:**
1. Personal Info
2. Employment Info
3. Documents
4. Attendance & Leaves
5. Salary (HR only)
6. Activity Log

---

### 2.4 Document Management

**User Story:** As an employee, I want to upload and manage my documents.

**Acceptance Criteria:**
- ✅ Upload multiple document types
- ✅ Preview documents
- ✅ Download documents
- ✅ Delete documents (own or HR)
- ✅ Track expiry dates
- ✅ Notification for expiring documents

**Document Types:**
- Resume
- ID Proof
- Address Proof
- Education Certificates
- Experience Letters
- Offer Letter
- Employment Contract
- Other

**Storage:**
- Supabase Storage
- Bucket: `employee-documents`
- Path: `{org_id}/{employee_id}/{document_id}.{ext}`

---

## Module 3: Attendance System

### 3.1 Employee Check-in/Check-out

**User Story:** As an employee, I want to mark my attendance daily.

**Acceptance Criteria:**
- ✅ Check-in button visible on dashboard
- ✅ Request GPS location permission
- ✅ Capture check-in time and location
- ✅ Check-out button appears after check-in
- ✅ Calculate working hours on check-out
- ✅ Show today's status (checked in/out)
- ✅ Prevent multiple check-ins per day

**UI Flow:**
```
1. Employee sees "Check In" button
2. Click button → Request location
3. Location captured → API call
4. Success message + show "Check Out" button
5. At end of day, click "Check Out"
6. Working hours calculated and displayed
```

**Business Rules:**
- One check-in per day
- Check-in between 6 AM - 11 AM (configurable)
- Late if after 9:30 AM
- Half-day if check-in after 12 PM
- Working hours = check-out - check-in (minus breaks)

---

### 3.2 Attendance Calendar

**User Story:** As an employee, I want to see my attendance history in a calendar view.

**Acceptance Criteria:**
- ✅ Monthly calendar view
- ✅ Color-coded days (Present, Absent, Leave, Holiday)
- ✅ Click day to see details
- ✅ Navigate between months
- ✅ Summary stats (Present: X, Absent: Y, Leaves: Z)

**Color Coding:**
- 🟢 Green: Present
- 🔴 Red: Absent
- 🟡 Yellow: Half-day
- 🔵 Blue: Leave
- ⚪ Gray: Holiday/Weekend

---

### 3.3 Admin Attendance Management

**User Story:** As an HR Admin, I want to view and manage attendance for all employees.

**Acceptance Criteria:**
- ✅ View all employees' attendance
- ✅ Manual attendance marking for absent employees
- ✅ Edit check-in/check-out times
- ✅ Mark as present/absent/half-day
- ✅ Bulk operations (mark multiple as present)
- ✅ Attendance reports

**Views:**
1. **Daily View**: List of all employees with today's status
2. **Monthly View**: Calendar for selected employee
3. **Reports**: Attendance summary by department/employee

---

### 3.4 Attendance Reports

**User Story:** As an HR Admin, I want to generate attendance reports.

**Acceptance Criteria:**
- ✅ Date range selection
- ✅ Employee/Department filter
- ✅ Export to Excel/PDF
- ✅ Show metrics:
  - Total present days
  - Total absent days
  - Average working hours
  - Late arrivals
  - Early departures

---

## Module 4: Leave Management

### 4.1 Configure Leave Types

**User Story:** As an HR Admin, I want to configure different types of leaves.

**Acceptance Criteria:**
- ✅ Add/edit/delete leave types
- ✅ Set annual allocation
- ✅ Set carry-forward rule
- ✅ Mark as paid/unpaid
- ✅ Set max consecutive days
- ✅ Enable/disable leave type

**Default Leave Types:**
| Type | Code | Days | Carry Forward | Paid |
|------|------|------|---------------|------|
| Sick Leave | SL | 12 | Yes | Yes |
| Casual Leave | CL | 12 | No | Yes |
| Paid Leave | PL | 18 | Yes | Yes |
| Unpaid Leave | UL | Unlimited | N/A | No |

---

### 4.2 Apply for Leave

**User Story:** As an employee, I want to apply for leave.

**Acceptance Criteria:**
- ✅ Select leave type
- ✅ Select date range
- ✅ Half-day option
- ✅ Enter reason
- ✅ See available balance before submitting
- ✅ Cannot apply if balance insufficient
- ✅ Notification sent to manager

**Form:**
```
Leave Type: [Dropdown]
Start Date: [Date Picker]
End Date: [Date Picker]
Half Day: [Checkbox]
Reason: [Textarea]

Available Balance: X days
Days Requested: Y days

[Cancel] [Submit]
```

**Validations:**
- Start date >= today
- End date >= start date
- Available balance >= requested days
- Reason required (min 10 chars)

---

### 4.3 Approve/Reject Leaves

**User Story:** As a manager, I want to approve or reject leave applications from my team.

**Acceptance Criteria:**
- ✅ See pending leave requests
- ✅ View employee details and leave balance
- ✅ Approve or reject with one click
- ✅ Add notes when rejecting
- ✅ Notification sent to employee
- ✅ Leave balance updated on approval

**UI:**
```
Pending Leave Requests (5)

[Card 1]
John Doe - Sick Leave
Dates: Jan 15 - Jan 17 (3 days)
Reason: Not feeling well
Available Balance: 8 days

[Approve] [Reject]

[Card 2]
...
```

---

### 4.4 Leave Calendar

**User Story:** As an employee, I want to see a calendar with my leaves and team's leaves.

**Acceptance Criteria:**
- ✅ Monthly calendar view
- ✅ My leaves highlighted
- ✅ Team leaves visible (if manager)
- ✅ Holidays marked
- ✅ Legend for colors

---

### 4.5 Leave Balance Tracking

**User Story:** As an employee, I want to see my leave balance at all times.

**Acceptance Criteria:**
- ✅ Balance shown on dashboard
- ✅ Breakdown by leave type
- ✅ Shows: Allocated, Used, Pending, Available
- ✅ Progress bars for visual representation

**Display:**
```
Leave Balance (2024)

Sick Leave (SL)
━━━━━━━━━░░░░░░░░░░  8/12 used (4 available)

Casual Leave (CL)
━━━━━░░░░░░░░░░░░░░  5/12 used (7 available)

Paid Leave (PL)
━━━━━━━━━━━━━░░░░░░  13/18 used (5 available)
```

---

## Module 5: Basic Payroll

### 5.1 Configure Salary Structure

**User Story:** As an HR Admin, I want to create salary structure templates.

**Acceptance Criteria:**
- ✅ Create named templates
- ✅ Add earnings components
- ✅ Add deduction components
- ✅ Mark as percentage or fixed amount
- ✅ Preview calculation

**Example:**
```
Salary Structure: Standard Template

Earnings:
+ Basic Salary: 50,000 (fixed)
+ HRA: 40% of basic = 20,000
+ DA: 20% of basic = 10,000
+ Special Allowance: 5,000 (fixed)
------------------------
Gross: 85,000

Deductions:
- PF: 12% of basic = 6,000
- Tax: 10% of gross = 8,500
------------------------
Net Salary: 70,500
```

---

### 5.2 Assign Salary to Employee

**User Story:** As an HR Admin, I want to assign salary structure to employees.

**Acceptance Criteria:**
- ✅ Select employee
- ✅ Select salary structure template
- ✅ Set basic salary
- ✅ Preview net salary
- ✅ Set effective date
- ✅ Save salary configuration

---

### 5.3 Process Monthly Payroll

**User Story:** As an HR Admin, I want to process payroll for all employees for a given month.

**Acceptance Criteria:**
- ✅ Select month and year
- ✅ Click "Process Payroll"
- ✅ System calculates salary for all active employees
- ✅ Attendance-based deductions applied
- ✅ Preview before finalizing
- ✅ Generate salary slips for all

**Algorithm:**
```
For each active employee:
1. Get basic salary
2. Calculate earnings (HRA, DA, etc.)
3. Get attendance for month
4. Calculate absent days
5. Deduct salary for absent days
6. Calculate deductions (PF, Tax)
7. Net Salary = Gross - Deductions
8. Create salary record
9. Generate PDF salary slip
```

---

### 5.4 View Salary Slip

**User Story:** As an employee, I want to view and download my salary slips.

**Acceptance Criteria:**
- ✅ List of all salary slips by month
- ✅ Click to view slip
- ✅ Download as PDF
- ✅ Shows full breakdown

**Salary Slip Format:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ACME CORPORATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Salary Slip for January 2024

Employee: John Doe
Employee ID: EMP001
Department: Engineering
Designation: Senior Developer

EARNINGS:
Basic Salary         50,000.00
HRA (40%)           20,000.00
DA (20%)            10,000.00
Special Allowance    5,000.00
                   -----------
Gross Salary        85,000.00

DEDUCTIONS:
PF (12%)             6,000.00
Professional Tax       200.00
Income Tax          8,500.00
                   -----------
Total Deductions    14,700.00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NET SALARY          70,300.00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Payment Date: Jan 30, 2024
```

---

## Settings Module

### Organization Settings
- Company name, logo
- Address, contact details
- Timezone, currency
- Working hours
- Week start day

### Department Management
- Add/edit/delete departments
- Assign department heads

### Designation Management
- Add/edit/delete designations
- Set hierarchy levels

### Holiday Calendar
- Add holidays
- Mark as optional
- Import holidays (future)

### Leave Type Configuration
- Covered in Module 4

---

## Dashboard

**For Employees:**
- Today's attendance status
- Quick check-in/check-out
- Leave balance summary
- Upcoming holidays
- Recent pay slips

**For Managers:**
- Team attendance today
- Pending leave approvals
- Team on leave today
- Quick stats

**For HR Admins:**
- Total employees
- Present today / Absent / On leave
- Pending approvals
- Recent activities
- Charts (attendance trends, leave usage)

---

**Version:** 1.0.0  
**Last Updated:** January 2026