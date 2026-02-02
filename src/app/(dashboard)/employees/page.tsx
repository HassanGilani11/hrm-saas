import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { EmployeeFilters } from '@/components/employees/employee-filters'
import { EmployeeListActions } from '@/components/employees/employee-list-actions'

interface EmployeesPageProps {
    searchParams: Promise<{
        search?: string
        department?: string
        designation?: string
        status?: string
        type?: string
    }>
}

export default async function EmployeesPage(props: EmployeesPageProps) {
    const searchParams = await props.searchParams
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

    // Fetch departments and designations for filters
    const { data: departments = [] } = await supabase
        .from('departments')
        .select('id, name')
        .eq('organization_id', organizationId)
        .order('name') as any

    const { data: designations = [] } = await supabase
        .from('designations')
        .select('id, name')
        .eq('organization_id', organizationId)
        .order('name') as any

    // Build query for employees
    let query = supabase
        .from('employees')
        .select(`
            id,
            employee_id,
            first_name,
            last_name,
            email,
            phone,
            status,
            employment_type,
            joining_date,
            department:department_id(name),
            designation:designation_id(name),
            manager:manager_id(first_name, last_name)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

    // Apply filters
    if (searchParams.search) {
        const searchTerm = searchParams.search
        // Simple search on name, email, or employee_id
        // Note: Supabase 'or' syntax can be tricky with foreign tables, so we stick to local columns
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,employee_id.ilike.%${searchTerm}%`)
    }

    if (searchParams.department && searchParams.department !== 'all') {
        query = query.eq('department_id', searchParams.department)
    }

    if (searchParams.designation && searchParams.designation !== 'all') {
        query = query.eq('designation_id', searchParams.designation)
    }

    if (searchParams.status && searchParams.status !== 'all') {
        query = query.eq('status', searchParams.status as any)
    }

    if (searchParams.type && searchParams.type !== 'all') {
        query = query.eq('employment_type', searchParams.type as any)
    }

    const { data: employees = [], error: employeesError } = await query as any

    const canCreateEmployee = ['SUPER_ADMIN', 'HR_ADMIN'].includes(userData.role)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Employees</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your organization's employees
                    </p>
                </div>
                {canCreateEmployee && (
                    <Link href="/employees/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Employee
                        </Button>
                    </Link>
                )}
            </div>

            <EmployeeFilters
                departments={departments || []}
                designations={designations || []}
                employeesData={employees || []}
            />

            {!employees || employees.length === 0 ? (
                <div className="bg-card rounded-lg border p-12 text-center">
                    <h3 className="text-lg font-semibold mb-2">No employees found</h3>
                    <p className="text-muted-foreground mb-6">
                        {Object.keys(searchParams).length > 0
                            ? "Try adjusting your search or filters"
                            : "Get started by adding your first employee"}
                    </p>
                    {canCreateEmployee && !Object.keys(searchParams).length && (
                        <Link href="/employees/new">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Employee
                            </Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="bg-card rounded-lg border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold">Employee ID</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">Department</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">Designation</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                                <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {employees.map((employee: any) => (
                                <tr key={employee.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium">{employee.employee_id}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <Link
                                            href={`/employees/${employee.id}`}
                                            className="hover:underline hover:text-primary font-medium"
                                        >
                                            {employee.first_name} {employee.last_name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{employee.email}</td>
                                    <td className="px-6 py-4 text-sm">
                                        {employee.department?.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {employee.designation?.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${employee.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-800'
                                                : employee.status === 'INACTIVE'
                                                    ? 'bg-gray-100 text-gray-800'
                                                    : employee.status === 'ON_LEAVE'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {employee.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right">
                                        <EmployeeListActions
                                            employeeId={employee.id}
                                            userRole={userData.role}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
