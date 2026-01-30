# System Architecture

## Overview

HRM SaaS is a multi-tenant application built with a modern serverless architecture using Next.js and Supabase.

## Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Browser │  │  Mobile  │  │  Desktop │  │   API    │   │
│  │   App    │  │   App    │  │   App    │  │ Clients  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                          │
        ┌─────────────────▼──────────────────┐
        │      NEXT.JS APPLICATION           │
        │  ┌──────────────────────────────┐  │
        │  │     App Router (RSC)         │  │
        │  ├──────────────────────────────┤  │
        │  │  Server Components           │  │
        │  │  - Dashboard Pages           │  │
        │  │  - Data Fetching             │  │
        │  ├──────────────────────────────┤  │
        │  │  Client Components           │  │
        │  │  - Interactive UI            │  │
        │  │  - Forms & Modals            │  │
        │  ├──────────────────────────────┤  │
        │  │  Server Actions              │  │
        │  │  - Mutations                 │  │
        │  │  - Form Submissions          │  │
        │  ├──────────────────────────────┤  │
        │  │  API Routes                  │  │
        │  │  - External Integrations     │  │
        │  │  - Webhooks                  │  │
        │  └──────────────────────────────┘  │
        └─────────────┬──────────────────────┘
                      │
        ┌─────────────▼──────────────────┐
        │      SUPABASE PLATFORM         │
        │  ┌──────────────────────────┐  │
        │  │  PostgreSQL Database     │  │
        │  │  - Tables                │  │
        │  │  - RLS Policies          │  │
        │  │  - Functions             │  │
        │  │  - Triggers              │  │
        │  ├──────────────────────────┤  │
        │  │  Authentication          │  │
        │  │  - User Management       │  │
        │  │  - JWT Tokens            │  │
        │  │  - MFA (future)          │  │
        │  ├──────────────────────────┤  │
        │  │  Storage                 │  │
        │  │  - Documents             │  │
        │  │  - Images                │  │
        │  │  - Salary Slips          │  │
        │  ├──────────────────────────┤  │
        │  │  Realtime                │  │
        │  │  - Live Updates          │  │
        │  │  - Presence              │  │
        │  └──────────────────────────┘  │
        └────────────────────────────────┘
```

## Multi-Tenancy Design

### Strategy: Row-Level Security (RLS)

Every table includes an `organization_id` column. Supabase RLS policies ensure users can only access data from their organization.

**Benefits:**
- Simple implementation
- Automatic enforcement
- No application-level checks needed
- Cost-effective for small to medium scale

**Implementation:**
```sql
-- Example RLS Policy
CREATE POLICY "Users can view their organization's data"
  ON employees FOR ALL
  USING (organization_id = get_user_organization_id());
```

### User Context Flow
```
1. User logs in → Supabase Auth creates JWT
2. JWT contains user_id
3. Middleware extracts user_id → queries organization_id
4. All queries automatically filtered by organization_id via RLS
```

## Data Flow

### Authentication Flow
```
1. User submits credentials
   ↓
2. Supabase Auth validates
   ↓
3. JWT token generated
   ↓
4. Token stored in cookie
   ↓
5. Subsequent requests include token
   ↓
6. Middleware validates token
   ↓
7. User context available in components
```

### Data Mutation Flow
```
1. User submits form
   ↓
2. Client-side validation (Zod)
   ↓
3. Server Action called
   ↓
4. Server-side validation
   ↓
5. Business logic execution
   ↓
6. Database mutation via Supabase
   ↓
7. RLS policies enforce security
   ↓
8. Response returned
   ↓
9. UI updated (optimistic or refetch)
```

## Component Architecture

### Server Components (Default)
- Used for: Data fetching, rendering static content
- Benefits: Better performance, smaller bundle, SEO-friendly
- Examples: Dashboard pages, lists, detail views

### Client Components ('use client')
- Used for: Interactivity, state management, browser APIs
- Examples: Forms, modals, interactive charts
- Keep minimal - only what needs client-side JS

### Composition Pattern
```tsx
// Server Component (page.tsx)
export default async function EmployeesPage() {
  const employees = await getEmployees() // Server-side fetch
  
  return (
    <div>
      <EmployeeTable employees={employees} /> {/* Client Component */}
    </div>
  )
}
```

## State Management

### Server State (TanStack Query)
- API data, database queries
- Automatic caching, refetching
- Optimistic updates

### Client State (Zustand)
- UI state (modals, sidebars)
- Form state (React Hook Form)
- Temporary data

### URL State (Next.js searchParams)
- Filters, pagination, sorting
- Shareable, bookmarkable

## Security Architecture

### Defense in Depth

**Layer 1: Supabase RLS**
- Database-level security
- Cannot be bypassed
- Automatic enforcement

**Layer 2: Server Actions**
- Input validation (Zod)
- Authorization checks
- Business logic validation

**Layer 3: API Routes**
- Rate limiting
- CORS policies
- Request validation

**Layer 4: Client Validation**
- User experience
- Early error detection
- Not security boundary

### Role-Based Access Control (RBAC)
```typescript
// Permission Matrix
const PERMISSIONS = {
  SUPER_ADMIN: ['*'], // All permissions
  HR_ADMIN: [
    'employees.create',
    'employees.read',
    'employees.update',
    'employees.delete',
    'attendance.manage',
    'leaves.approve',
    'payroll.process',
  ],
  MANAGER: [
    'employees.read',
    'attendance.read',
    'leaves.approve_team',
  ],
  EMPLOYEE: [
    'profile.read',
    'profile.update',
    'attendance.self',
    'leaves.apply',
  ],
}
```

## Performance Optimization

### Database
- Proper indexing on foreign keys
- Composite indexes for common queries
- Materialized views for reports (future)
- Connection pooling via Supabase

### Caching Strategy
- Server Components cached by default
- TanStack Query caches API responses
- Static pages cached at edge (Vercel)
- Storage assets cached via CDN

### Code Splitting
- Route-based automatic splitting
- Dynamic imports for heavy components
- Lazy loading for modals, charts

## Scalability Considerations

### Current Scale (Phase 1)
- Up to 1,000 organizations
- Up to 500 employees per organization
- ~500,000 total users

### Scaling Path
1. **Vertical scaling** (Supabase tier upgrade)
2. **Read replicas** for reporting
3. **Caching layer** (Redis) for hot data
4. **Background jobs** (BullMQ) for async tasks
5. **Microservices** if needed (unlikely)

## Deployment Architecture
```
┌──────────────────────────────────────────┐
│           Vercel Edge Network            │
│  ┌────────────────────────────────────┐  │
│  │  CDN (Static Assets, Images)       │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │  Edge Functions (Middleware)       │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │  Serverless Functions (API/RSC)    │  │
│  └────────────────────────────────────┘  │
└──────────────┬───────────────────────────┘
               │
┌──────────────▼───────────────────────────┐
│           Supabase (AWS)                 │
│  ┌────────────────────────────────────┐  │
│  │  PostgreSQL (Primary)              │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │  Storage (S3-compatible)           │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

## Error Handling

### Levels
1. **UI Level**: Toast notifications, inline errors
2. **Component Level**: Error boundaries
3. **API Level**: Structured error responses
4. **Database Level**: Transaction rollbacks

### Strategy
- User-friendly messages
- Detailed logs for debugging
- Sentry for error tracking (optional)
- Graceful degradation

## Monitoring & Observability

### Metrics to Track
- API response times
- Database query performance
- Error rates by endpoint
- User activity patterns
- Resource utilization

### Tools
- Vercel Analytics (built-in)
- Supabase Dashboard (queries, performance)
- Sentry (errors, optional)
- Custom dashboard (future)

## Technology Choices - Rationale

### Why Next.js?
- Modern React features (RSC)
- Excellent DX and performance
- Built-in optimizations
- Great deployment story (Vercel)

### Why Supabase?
- PostgreSQL with modern API
- Built-in auth and storage
- RLS for security
- Real-time capabilities
- Generous free tier

### Why not Prisma?
- Direct Supabase client is simpler
- Better integration with Supabase features
- Less abstraction = easier debugging
- TypeScript types auto-generated

### Why shadcn/ui?
- Copy-paste, not dependency
- Full customization
- Excellent accessibility
- Consistent design system

## Future Considerations

### Phase 2+
- WebSocket for real-time updates
- Background job queue
- Advanced analytics
- Mobile apps (React Native)
- API for third-party integrations
- Microservices if complexity grows

### Technical Debt to Avoid
- Over-engineering early
- Premature optimization
- Too many abstractions
- Skipping documentation
- Ignoring security

---

**Last Updated:** January 2026