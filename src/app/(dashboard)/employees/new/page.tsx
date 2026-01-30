import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import EmployeeForm from '@/components/employees/employee-form'
import { Database } from '@/types/database.types'

type Department = Database['public']['Tables']['departments']['Row']
type Designation = Database['public']['Tables']['designations']['Row']
type Employee = Database['public']['Tables']['employees']['Row']

export default async function NewEmployeePage() {
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
        .single() as { data: { organization_id: string, role: string } | null }

    if (!userData) {
        redirect('/login')
    }

    // Check if user has permission to create employees
    const allowedRoles = ['SUPER_ADMIN', 'HR_ADMIN']
    if (!allowedRoles.includes(userData.role)) {
        redirect('/dashboard')
    }

    const organizationId = userData.organization_id

    // Fetch departments
    const { data: departments } = await supabase
        .from('departments')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('name') as { data: Department[] | null }

    // Fetch designations
    const { data: designations } = await supabase
        .from('designations')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('name') as { data: Designation[] | null }

    // Fetch active employees for manager selection
    const { data: managers } = await supabase
        .from('employees')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'ACTIVE')
        .order('first_name') as { data: Employee[] | null }

    // If no departments or designations, show error
    if (!departments || departments.length === 0 || !designations || designations.length === 0) {
        return (
            <div className="container mx-auto py-10">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-6">
                        <h2 className="text-xl font-bold mb-2">Setup Required</h2>
                        <p className="mb-4">
                            Before adding employees, please set up at least one department and designation in your organization settings.
                        </p>
                        <div className="space-y-2">
                            {(!departments || departments.length === 0) && (
                                <p className="text-sm">• No departments found</p>
                            )}
                            {(!designations || designations.length === 0) && (
                                <p className="text-sm">• No designations found</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/employees">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Add New Employee</h1>
                    <p className="text-muted-foreground text-sm">Create a new employee profile</p>
                </div>
            </div>

            <div className="bg-card rounded-lg border p-6">
                <EmployeeForm
                    departments={departments}
                    designations={designations}
                    managers={managers || []}
                />
            </div>
        </div>
    )
}
