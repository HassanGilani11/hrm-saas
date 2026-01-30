import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OrganizationForm } from '@/components/settings/organization-form'
import { Suspense } from 'react'

export default async function OrganizationSettingsPage() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) redirect('/login')

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (!userData) redirect('/login')

    const { data: organization } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', userData.organization_id)
        .single()

    if (!organization) return <div>Organization not found</div>

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Organization Profile</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your company details and contact information.
                </p>
            </div>
            <div className="p-0.5"> {/* Fix for potential margin collapse/border clipping */}
                <Suspense fallback={<div>Loading form...</div>}>
                    <OrganizationForm
                        initialData={{
                            name: organization.name,
                            email: organization.email,
                            phone: organization.phone || '',
                            address: organization.address?.full || '',
                            slug: organization.slug
                        }}
                        isReadOnly={!['SUPER_ADMIN', 'HR_ADMIN'].includes(userData.role)}
                    />
                </Suspense>
            </div>
        </div>
    )
}
