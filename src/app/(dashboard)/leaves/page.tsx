import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LeavesDashboard } from '@/components/leaves/leaves-dashboard'

export default async function LeavesPage() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) redirect('/login')

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (!userData) redirect('/login')

    // Get current employee record
    const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!employee) {
        // If user is admin but not an employee (unlikely but possible), handles gracefully?
        // Or maybe redirect to setup? For now let's assume they are an employee or handle edge case.
        return <div>Employee record not found. Please contact support.</div>
    }

    const year = new Date().getFullYear()

    // Parallel data fetching
    const [
        { data: balances },
        { data: requests },
        { data: leaveTypes },
        { data: holidays },
        { data: adminRequests }
    ] = (await Promise.all([
        // 1. Fetch Leave Balances
        supabase
            .from('leave_balances')
            .select(`
                *,
                leave_type:leave_types(name, code, is_paid)
            `)
            .eq('employee_id', employee.id)
            .eq('year', year),

        // 2. Fetch Recent Leave Requests
        supabase
            .from('leaves')
            .select(`
                *,
                leave_type:leave_types(name, code)
            `)
            .eq('employee_id', employee.id)
            .order('created_at', { ascending: false }),

        // 3. Fetch Active Leave Types (for applying)
        supabase
            .from('leave_types')
            .select('*')
            .eq('organization_id', userData.organization_id)
            .eq('is_active', true),

        // 4. Fetch Holidays
        supabase
            .from('holidays')
            .select('*')
            .eq('organization_id', userData.organization_id)
            .gte('date', `${year}-01-01`)
            .lte('date', `${year}-12-31`)
            .order('date'),

        // 5. Fetch Pending Requests (Admin Only)
        ['HR_ADMIN', 'SUPER_ADMIN'].includes(userData.role)
            ? supabase
                .from('leaves')
                .select(`
                    *,
                    leave_type:leave_types(name, code),
                    employee:employees!leaves_employee_id_fkey(
                        first_name, 
                        last_name, 
                        designation:designation_id(name)
                    )
                `)
                .eq('organization_id', userData.organization_id)
                .eq('status', 'PENDING')
                .order('created_at', { ascending: true })
            : Promise.resolve({ data: [] })
    ])) as any[]

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Leaves & Holidays</h2>
                <p className="text-muted-foreground">
                    View your leave balance, apply for leaves, and check holidays.
                </p>
            </div>

            <LeavesDashboard
                balances={balances || []}
                requests={requests || []}
                leaveTypes={leaveTypes || []}
                holidays={holidays || []}
                adminRequests={adminRequests || []}
                employeeId={employee.id}
                role={userData.role}
            />

        </div>
    )
}
