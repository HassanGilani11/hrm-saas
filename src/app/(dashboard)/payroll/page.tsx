import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Banknote, History, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function PayrollDashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single() as { data: any, error: any }

    if (!userData || !['HR_ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
        return <div>Access Denied</div>
    }

    // Fetch stats
    const [
        { count: totalEmployees },
        { count: assignedSalaries },
        { data: recentSalaries }
    ] = await Promise.all([
        supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', userData.organization_id)
            .eq('status', 'ACTIVE'),
        supabase
            .from('employee_salary_settings')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', userData.organization_id),
        supabase
            .from('salaries')
            .select(`
                id,
                month,
                year,
                net_salary,
                status,
                employee:employees(first_name, last_name)
            `)
            .eq('organization_id', userData.organization_id)
            .order('created_at', { ascending: false })
            .limit(5)
    ])

    const stats = [
        {
            title: 'Active Employees',
            value: totalEmployees || 0,
            icon: Users,
            description: 'Employees eligible for payroll'
        },
        {
            title: 'Salaries Assigned',
            value: assignedSalaries || 0,
            icon: Banknote,
            description: 'Employees with pay structures'
        },
        {
            title: 'Pending Assignment',
            value: (totalEmployees || 0) - (assignedSalaries || 0),
            icon: History,
            description: 'Need salary configuration',
            color: 'text-yellow-600'
        }
    ]

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Payroll Overview</h2>
                    <p className="text-muted-foreground">
                        Manage your organization's compensation and payouts.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/payroll/run">
                        <Button>Run Payroll</Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <Icon className={`h-4 w-4 ${stat.color || 'text-muted-foreground'}`} />
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Link href="/payroll/employees" className="block">
                            <Button variant="outline" className="w-full justify-start h-16 text-left font-normal">
                                <div className="flex flex-col">
                                    <span className="font-semibold">Salary Assignments</span>
                                    <span className="text-xs text-muted-foreground">Assign pay structures to employees</span>
                                </div>
                            </Button>
                        </Link>
                        <Link href="/payroll/structures" className="block">
                            <Button variant="outline" className="w-full justify-start h-16 text-left font-normal">
                                <div className="flex flex-col">
                                    <span className="font-semibold">Manage Structures</span>
                                    <span className="text-xs text-muted-foreground">Define earnings and deductions</span>
                                </div>
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentSalaries && recentSalaries.length > 0 ? (
                                recentSalaries.map((salary: any) => (
                                    <div key={salary.id} className="flex items-center gap-4">
                                        <div className="rounded-full bg-green-100 p-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                Payroll Generated: {new Date(0, salary.month - 1).toLocaleString('default', { month: 'long' })} {salary.year}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {salary.employee?.first_name} {salary.employee?.last_name} - ${parseFloat(salary.net_salary).toLocaleString()}
                                            </p>
                                        </div>
                                        <Badge variant={salary.status === 'APPROVED' ? 'default' : 'secondary'}>
                                            {salary.status}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No recent payroll activity.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
