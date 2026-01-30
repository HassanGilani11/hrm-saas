# Master Development Prompt

## Context
You are building an HRM SaaS application. All project documentation is available in the `/docs` folder.

## Before You Start

**MANDATORY: Read these files first:**
1. `/docs/README.md` - Understand project setup
2. `/docs/ARCHITECTURE.md` - Understand system design
3. `/docs/DATABASE.md` - Understand data model
4. `/docs/FEATURES.md` - Understand feature requirements
5. `/.antigravityrules` - Understand coding standards

## Your Task

I will ask you to implement features from the HRM SaaS. For EVERY feature:

### Step 1: Reference Documentation
- Find the feature in `/docs/FEATURES.md`
- Read the complete specification
- Check database requirements in `/docs/DATABASE.md`
- Review architecture patterns in `/docs/ARCHITECTURE.md`

### Step 2: Plan Implementation
Before writing code, outline:
- Components needed (Server vs Client)
- Database queries required
- Validations needed
- UI/UX flow
- Error handling approach

### Step 3: Implement
- Follow `.antigravityrules` strictly
- Write TypeScript with proper types
- Use Server Components by default
- Implement proper error handling
- Add loading states
- Make it responsive

### Step 4: Quality Check
- No TypeScript errors
- No console errors
- Works on mobile
- Proper error handling
- Loading states present
- Follows design system

## File Structure Reference
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── employees/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── new/page.tsx
│   │   ├── attendance/page.tsx
│   │   ├── leaves/page.tsx
│   │   ├── payroll/page.tsx
│   │   └── layout.tsx
│   └── api/
├── components/
│   ├── ui/ (shadcn)
│   ├── layout/
│   └── [feature]/
├── lib/
│   ├── supabase/
│   ├── validations/
│   └── utils.ts
├── hooks/
├── services/
└── types/
```

## Example Usage

**User:** "Implement the employee creation form"

**Your Response:**
1. ✅ "Reading `/docs/FEATURES.md` → Section 2.1 Add Employee"
2. ✅ "Checking schema in `/docs/DATABASE.md` → employees table"
3. ✅ "Planning implementation..."
4. ✅ [Provide detailed implementation plan]
5. ✅ [Write the code following .antigravityrules]
6. ✅ [Include all necessary files]

## Code Requirements

### Always Include:
- Proper TypeScript types
- Zod validation schemas
- Error handling
- Loading states
- Success feedback (toast)
- Comments for complex logic
- Responsive design (mobile-first)

### Pattern to Follow:
```typescript
// 1. Imports
import { createClient } from '@/lib/supabase/server'
import { employeeSchema } from '@/lib/validations/employee'

// 2. Type definitions
type Props = { ... }

// 3. Component
export default async function Component({ params }: Props) {
  // 4. Data fetching (if server component)
  const data = await fetchData()
  
  // 5. Render
  return (
    <div>
      {/* Clean, semantic HTML */}
    </div>
  )
}
```

## Testing Checklist

For every feature you implement, verify:
- [ ] TypeScript compiles without errors
- [ ] Component renders without errors
- [ ] Form validation works
- [ ] Server action/API works
- [ ] Database query is efficient
- [ ] RLS policies are applied
- [ ] Error states display properly
- [ ] Loading states are shown
- [ ] Success feedback is given
- [ ] Mobile responsive
- [ ] Follows design system

## Communication Style

When implementing:
1. Confirm you've read the docs
2. Explain your approach
3. Show the code
4. Highlight key decisions
5. List any assumptions
6. Provide testing steps

## Common Tasks

### Task: Create a new page
1. Check routing in docs
2. Decide if Server or Client Component
3. Create page.tsx
4. Add layout if needed
5. Implement data fetching
6. Add loading.tsx
7. Add error.tsx

### Task: Create a form
1. Define Zod schema
2. Create form component ('use client')
3. Use React Hook Form
4. Create Server Action for submission
5. Handle errors and success
6. Add to page

### Task: Add API endpoint
1. Create route.ts in api folder
2. Validate inputs
3. Perform operation
4. Return proper response
5. Handle errors

## What NOT to Do

❌ Don't skip reading documentation
❌ Don't use `any` type
❌ Don't skip error handling
❌ Don't forget loading states
❌ Don't ignore mobile responsiveness
❌ Don't hardcode values
❌ Don't skip validation
❌ Don't forget RLS policies

## When You're Stuck

1. Re-read the relevant doc section
2. Check similar existing code
3. Review .antigravityrules
4. Ask for clarification
5. Break problem into smaller pieces

## Success Criteria

A feature is complete when:
- ✅ Meets requirements from `/docs/FEATURES.md`
- ✅ Follows patterns from `/docs/ARCHITECTURE.md`
- ✅ Uses schema from `/docs/DATABASE.md`
- ✅ Follows rules in `/.antigravityrules`
- ✅ Has no TS/runtime errors
- ✅ Is mobile responsive
- ✅ Has proper error handling
- ✅ Has loading states
- ✅ Provides user feedback

## Ready?

When I give you a task, follow this process:
1. 📖 Read relevant documentation
2. 📋 Plan your approach
3. 💻 Implement with quality
4. ✅ Verify completeness

Let's build an amazing HRM SaaS! 🚀