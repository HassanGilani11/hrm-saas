'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { OrganizationFormValues } from '@/components/settings/organization-form'

export async function getOrganizationAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    // Get user's organization
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (userError || !userData) {
        throw new Error('User data not found')
    }

    const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', userData.organization_id)
        .single()

    if (orgError) {
        throw new Error('Organization not found')
    }

    return orgData
}

export async function updateOrganizationAction(data: OrganizationFormValues) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        // Get user's organization to ensure ownership/access
        const { data: userData } = await supabase
            .from('users')
            .select('organization_id, role')
            .eq('id', user.id)
            .single()

        if (!userData || userData.role !== 'SUPER_ADMIN') {
            // Optional: Enforce role check if needed
            // return { success: false, error: 'Permission denied' }
        }

        const { error } = await supabase
            .from('organizations')
            .update({
                name: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address, // updated_at trigger handles timestamp
            })
            .eq('id', userData?.organization_id)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath('/settings')
        return { success: true }
    } catch (error) {
        console.error('Update org error:', error)
        return { success: false, error: 'Failed to update organization' }
    }
}
