import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EmployeeSalaryList } from '@/components/payroll/employee-salary-list'
import { Employee } from '@/types/database.types'

export default async function EmployeePayrollPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single() as { data: { organization_id: string, role: string } | null }

    if (!userData || !['HR_ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
        return <div>Access Denied</div>
    }

    console.log('PAYROLL DEBUG - Fetching for Org ID:', userData.organization_id)

    // Fetch employees with explicit columns similar to employees/page.tsx
    const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id, employee_id, first_name, last_name, status, organization_id')
        .eq('organization_id', userData.organization_id)
        .eq('status', 'ACTIVE') as { data: any[] | null, error: any }

    if (employeesError) {
        console.error('PAYROLL ERROR - Employees Fetch:', JSON.stringify(employeesError, null, 2))
    }

    console.log('PAYROLL DEBUG - Raw Employees Count:', employees?.length || 0)
    if (employees && employees.length > 0) {
        console.log('PAYROLL DEBUG - First Employee Sample:', {
            id: employees[0].id,
            name: `${employees[0].first_name} ${employees[0].last_name}`,
            orgId: employees[0].organization_id
        })
    }

    // Fetch structures
    const { data: structures, error: structuresError } = await supabase
        .from('salary_structures')
        .select('id, name')
        .eq('organization_id', userData.organization_id)
        .eq('is_active', true) as { data: { id: string, name: string }[] | null, error: any }

    if (structuresError) {
        console.error('PAYROLL ERROR - Structures Fetch:', JSON.stringify(structuresError, null, 2))
    }

    // Fetch salary settings separately if employees exist
    let employeesWithSettings: any[] = []
    if (employees && employees.length > 0) {
        const { data: settings, error: settingsError } = await supabase
            .from('employee_salary_settings')
            .select('*')
            .eq('organization_id', userData.organization_id) as { data: any[] | null, error: any }

        if (settingsError) {
            console.error('PAYROLL ERROR - Settings Fetch:', JSON.stringify(settingsError, null, 2))
        }

        console.log('PAYROLL DEBUG - Settings Found:', settings?.length || 0)

        // Merge settings back into employees
        employeesWithSettings = employees.map(emp => ({
            ...emp,
            salary_settings: settings?.filter(s => s.employee_id === emp.id) || []
        }))
    }

    console.log('PAYROLL DEBUG - Final Employees to List:', employeesWithSettings.length)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Employee Salary Details</h2>
                <p className="text-muted-foreground">
                    Assign and manage salary structures for your active employees.
                </p>
            </div>

            <EmployeeSalaryList
                employees={employeesWithSettings}
                structures={structures || []}
            />
        </div>
    )
}
