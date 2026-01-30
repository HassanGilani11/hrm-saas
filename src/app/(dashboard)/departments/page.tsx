import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DepartmentList } from '@/components/settings/department-list'

export default async function DepartmentsPage() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) redirect('/login')

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (!userData) redirect('/login')

    const { data: departments } = await supabase
        .from('departments')
        .select('*')
        .eq('organization_id', userData.organization_id)
        .order('name')

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Departments</h3>
                <p className="text-sm text-muted-foreground">
                    Manage the departments in your organization.
                </p>
            </div>

            <DepartmentList
                initialDepartments={departments || []}
            />
        </div>
    )
}
