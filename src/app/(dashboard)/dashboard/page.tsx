import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Users, UserCheck, Calendar, Briefcase, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect('/login')
    }

    // Get user's organization
    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (!userData) {
        redirect('/login')
    }

    const organizationId = userData.organization_id

    // Fetch stats in parallel
    const [
        { count: totalEmployees },
        { count: activeEmployees },
        { count: onLeaveEmployees },
        { count: totalDepartments },
        { count: totalDesignations }
    ] = await Promise.all([
        supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId),
        supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId)
            .eq('status', 'ACTIVE'),
        supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId)
            .eq('status', 'ON_LEAVE'),
        supabase
            .from('departments')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId),
        supabase
            .from('designations')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId)
    ])

    const stats = [
        {
            title: 'Total Employees',
            value: totalEmployees || 0,
            icon: Users,
            description: 'All registered employees',
        },
        {
            title: 'Active Employees',
            value: activeEmployees || 0,
            icon: UserCheck,
            description: 'Currently working',
        },
        {
            title: 'On Leave',
            value: onLeaveEmployees || 0,
            icon: Calendar,
            description: 'Employees on leave',
        },
        {
            title: 'Departments',
            value: totalDepartments || 0,
            icon: Briefcase,
            description: 'Organization units',
        },
        {
            title: 'Designations',
            value: totalDesignations || 0,
            icon: Award,
            description: 'Job roles defined',
        },
    ]

    return (
        <div className="space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome to your HRM overview.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Welcome Message / Quick Actions Placeholder */}
            <div className="bg-muted/50 rounded-xl border p-8 text-center sm:text-left">
                <h2 className="text-2xl font-bold mb-2">Welcome to HRM SaaS!</h2>
                <p className="text-muted-foreground max-w-2xl">
                    Your organization is set up and ready to go. You can manage employees, track attendance, and configure payroll from the sidebar.
                </p>
            </div>
        </div>
    )
}
