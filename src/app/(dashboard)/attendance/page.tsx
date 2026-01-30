import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AttendanceDashboard } from '@/components/attendance/attendance-dashboard'

export default async function AttendancePage() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) redirect('/login')

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!userData) redirect('/login')

    const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!employee) {
        return <div>Employee record not found.</div>
    }

    const today = new Date().toISOString().split('T')[0]

    // Parallel fetch
    const [
        { data: todayAttendance },
        { data: recentLogs }
    ] = await Promise.all([
        // 1. Fetch Today's Attendance Logs (All sessions)
        supabase
            .from('attendances')
            .select('*')
            .eq('employee_id', employee.id)
            .eq('date', today)
            .order('check_in', { ascending: true }),

        // 2. Fetch Recent Logs (Last 30 days)
        supabase
            .from('attendances')
            .select('*')
            .eq('employee_id', employee.id)
            .neq('date', today) // Exclude today as it's fetched separately
            .order('date', { ascending: false })
            .limit(30)
    ])

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Attendance</h2>
                <p className="text-muted-foreground">
                    Track your daily work hours and check-in/out.
                </p>
            </div>

            <AttendanceDashboard
                todayLogs={todayAttendance || []}
                recentLogs={recentLogs || []}
                employeeId={employee.id}
            />
        </div>
    )
}
