# HRM SaaS - Human Resource Management System

A comprehensive, multi-tenant HRM SaaS application built with Next.js 14, Supabase, and shadcn/ui.

## 🎯 Project Overview

**Target Users:** Small to medium businesses (10-500 employees)  
**Current Phase:** Phase 1 - MVP Core Features  
**Tech Stack:** Next.js 14, Supabase, TypeScript, Tailwind CSS, shadcn/ui

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account
- Git

### Installation

1. **Clone & Install**
```bash
   git clone <repository-url>
   cd hrm-saas
   npm install
```

2. **Setup Supabase**
```bash
   # Create new Supabase project at https://supabase.com
   # Copy your project URL and anon key
   cp .env.example .env.local
   # Fill in your Supabase credentials
```

3. **Run Database Migrations**
```bash
   # Copy the SQL from docs/DATABASE.md
   # Run in Supabase SQL Editor
```

4. **Generate TypeScript Types**
```bash
   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.types.ts
```

5. **Install shadcn/ui**
```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button card input label select textarea form table dialog dropdown-menu avatar badge calendar popover separator tabs toast
```

6. **Start Development Server**
```bash
   npm run dev
```

## 📁 Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn components
│   ├── layout/           # Layout components
│   └── [module]/         # Feature components
├── lib/                  # Utilities & config
│   ├── supabase/        # Supabase clients
│   ├── validations/     # Zod schemas
│   └── utils.ts         # Helper functions
├── hooks/               # Custom React hooks
├── services/            # Business logic
├── types/               # TypeScript types
└── styles/              # Global styles
```

## 🎨 Core Modules

### Phase 1 (Current - MVP)
- ✅ Authentication & Multi-tenancy
- ✅ Employee Management
- ✅ Attendance System
- ✅ Leave Management
- ✅ Basic Payroll

### Phase 2 (Next)
- Performance Management
- Recruitment (ATS)
- Time Tracking
- Advanced Payroll
- Reports & Analytics

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Forms:** React Hook Form + Zod
- **State Management:** TanStack Query + Zustand
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **API:** Next.js API Routes / Server Actions
- **ORM:** Supabase Client

### DevOps
- **Hosting:** Vercel
- **Database:** Supabase
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry (optional)

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and architecture
- [Database](docs/DATABASE.md) - Database schema and relationships
- [Features](docs/FEATURES.md) - Detailed feature specifications
- [API](docs/API.md) - API endpoints documentation
- [Components](docs/COMPONENTS.md) - Component usage guide
- [Deployment](docs/DEPLOYMENT.md) - Deployment instructions

## 🔐 Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📝 Development Guidelines

1. **Code Style**
   - Use TypeScript for type safety
   - Follow ESLint rules
   - Use Prettier for formatting
   - Write meaningful commit messages

2. **Component Guidelines**
   - Use Server Components by default
   - Add 'use client' only when needed
   - Keep components small and focused
   - Use proper TypeScript types

3. **Database**
   - Always use RLS policies
   - Include organization_id in all queries
   - Use transactions for related operations
   - Add proper indexes

4. **Security**
   - Never expose service role key
   - Validate all user inputs
   - Use RLS for data isolation
   - Implement proper RBAC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Documentation: `/docs` folder
- Issues: GitHub Issues
- Email: support@yourhrm.com

## 🗺️ Roadmap

See [ROADMAP.md](docs/ROADMAP.md) for detailed development plan.

---

**Built with ❤️ using Next.js and Supabase**