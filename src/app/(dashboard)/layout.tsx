import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Users } from 'lucide-react'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { Header } from '@/components/layout/header'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect('/login')
    }

    // Fetch employee data for header (avatar)
    const { data: employee } = await supabase
        .from('employees')
        .select('first_name, last_name, profile_image_url')
        .eq('user_id', user.id)
        .single()


    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
        { href: '/organization', label: 'Organization', icon: 'Settings' },
        { href: '/departments', label: 'Departments', icon: 'Users' },
        { href: '/designations', label: 'Designations', icon: 'Users' },
        { href: '/employees', label: 'Employees', icon: 'Users' },
        { href: '/attendance', label: 'Attendance', icon: 'Clock' },
        { href: '/leaves', label: 'Leaves', icon: 'Calendar' },
        {
            href: '/payroll',
            label: 'Payroll',
            icon: 'DollarSign',
            subItems: [
                { href: '/payroll/structures', label: 'Structures' },
                { href: '/payroll/employees', label: 'Salary Assignments' },
                { href: '/payroll/run', label: 'Run Payroll' },
            ]
        },
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card border-border">
                <div className="flex h-full flex-col gap-2">
                    {/* Logo/Brand */}
                    <div className="flex h-14 items-center border-b px-6">
                        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                            <Users className="h-6 w-6 text-primary" />
                            <span className="text-lg">HRM SaaS</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <SidebarNav items={navItems} />
                </div>
            </aside>

            {/* Main Content */}
            <div className="pl-64 flex flex-col min-h-screen">
                <Header user={user} employee={employee} />
                <main className="flex-1 p-8">{children}</main>
            </div>
        </div>
    )
}
