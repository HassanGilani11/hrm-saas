import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EmployeeForm from '@/components/employees/employee-form'
import { Database } from '@/types/database.types'

type Department = Database['public']['Tables']['departments']['Row']
type Designation = Database['public']['Tables']['designations']['Row']
type Employee = Database['public']['Tables']['employees']['Row']

interface EditEmployeePageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditEmployeePage(props: EditEmployeePageProps) {
    const params = await props.params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect('/login')
    }

    // Get user's organization and role
    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (!userData) {
        redirect('/login')
    }

    // Check if user can edit employees
    const canEdit = ['SUPER_ADMIN', 'HR_ADMIN'].includes(userData.role)
    if (!canEdit) {
        redirect('/employees')
    }

    const organizationId = userData.organization_id

    // Fetch employee data
    const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select(`
            *,
            department:department_id(id, name),
            designation:designation_id(id, name)
        `)
        .eq('id', params.id)
        .eq('organization_id', organizationId)
        .single()

    if (employeeError || !employee) {
        redirect('/employees')
    }

    // Fetch departments for dropdown
    const { data: departments } = await supabase
        .from('departments')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('name') as { data: Department[] | null }

    // Fetch designations for dropdown
    const { data: designations } = await supabase
        .from('designations')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('name') as { data: Designation[] | null }

    // Fetch potential managers (all employees except current one)
    const { data: managers } = await supabase
        .from('employees')
        .select('*')
        .eq('organization_id', organizationId)
        .neq('id', params.id)
        .eq('status', 'ACTIVE')
        .order('first_name') as { data: Employee[] | null }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Edit Employee</h1>
                <p className="text-muted-foreground mt-2">
                    Update employee information
                </p>
            </div>

            <EmployeeForm
                mode="edit"
                employeeId={params.id}
                initialData={employee}
                departments={departments || []}
                designations={designations || []}
                managers={managers || []}
            />
        </div>
    )
}
