import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DesignationList } from '@/components/settings/designation-list'

export default async function DesignationsPage() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) redirect('/login')

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (!userData) redirect('/login')

    const { data: designations } = await supabase
        .from('designations')
        .select('*')
        .eq('organization_id', userData.organization_id)
        .order('level') // Ordered by level (hierarchy)

    const { data: departments } = await supabase
        .from('departments')
        .select('id, name')
        .eq('organization_id', userData.organization_id)
        .eq('is_active', true)
        .order('name')

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Designations</h3>
                <p className="text-sm text-muted-foreground">
                    Manage job titles and hierarchy levels.
                </p>
            </div>

            <DesignationList
                initialDesignations={designations || []}
                departments={departments || []}
            />
        </div>
    )
}
