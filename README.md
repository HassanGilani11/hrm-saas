# HRM SaaS - Modern Human Resource Management System

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat&logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

A comprehensive, multi-tenant Human Resource Management Management (HRM) SaaS application built with the latest web technologies. Designed for small to medium-sized businesses to manage employees, attendance, leaves, and payroll efficiently.

## 🚀 Key Features

### 👥 Employee Management
- Complete onboarding workflow
- Document management (upload & expiry tracking)
- Profile management with salary history
- Advanced search and filtering

### 📅 Attendance System
- GPS-enabled daily Check-in/Check-out
- Real-time location capture
- Automated working hours calculation
- Attendance calendar and history views

### 🏖️ Leave Management
- Customizable leave types (Sick, Casual, Paid, etc.)
- Allocations and carry-forward logic
- Approval workflow for managers
- Leave balance tracking and visualization

### 💰 Payroll Processing
- Configurable Salary Structures (Earnings/Deductions)
- Automated monthly payroll generation
- Attendance-based deduction calculation
- Payslip generation and history

### 🏢 Organization Control
- Multi-tenancy via Row Level Security (RLS)
- Dynamic RBAC (Super Admin, HR Admin, Manager, Employee)
- Department and Designation hierarchy management

## 🛠️ Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Forms:** React Hook Form + Zod
- **State Management:** TanStack Query + React Context

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ installed
- A [Supabase](https://supabase.com/) account and project
- Git installed

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hrm-saas
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Database Setup**
   - Run the migration SQL files located in `database/migrations` in your Supabase SQL Editor to set up the schema, triggers, and RLS policies.
   - Alternatively, refer to `docs/DATABASE.md` for the complete schema.

5. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```bash
src/
├── app/                    # Next.js App Router (Pages & API)
│   ├── (auth)/             # Authentication routes
│   ├── (dashboard)/        # Protected dashboard routes
│   └── layout.tsx          # Root layout
├── components/             # Reusable UI components
│   ├── ui/                 # shadcn/ui primitives
│   ├── employees/          # Employee-related components
│   ├── payroll/            # Payroll-related components
│   └── ...
├── lib/                    # Utilities
│   ├── supabase/           # Supabase client initialization
│   └── utils.ts            # Helper functions
├── types/                  # TypeScript definitions
└── middleware.ts           # Auth & Multi-tenancy middleware
```

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:

- [**Features**](docs/FEATURES.md): Detailed breakdown of all functionalities.
- [**Architecture**](docs/ARCHITECTURE.md): System design, data flow, and security.
- [**Database**](docs/DATABASE.md): Schema reference and relationships.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
