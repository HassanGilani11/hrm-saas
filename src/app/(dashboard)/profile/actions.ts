'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ProfileFormValues } from '@/components/profile/profile-form'

export async function getProfileAction() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        throw new Error('Unauthorized')
    }

    const { data: employee, error } = await supabase
        .from('employees')
        .select(`
            *,
            departments!employees_department_id_fkey(name),
            designations(name)
        `)
        .eq('user_id', user.id)
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
        // Check if it's a "row not found" error (e.g. for new users who might not have an employee record yet, though the trigger should handle this)
        return null
    }

    return employee
}

export async function updateProfileAction(data: ProfileFormValues) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const { error } = await supabase
            .from('employees')
            .update({
                first_name: data.firstName,
                last_name: data.lastName,
                phone: data.phone,
                profile_image_url: data.profileImageUrl,
                current_address: { full: data.currentAddress },
                permanent_address: { full: data.permanentAddress },
            })
            .eq('user_id', user.id)

        if (error) {
            console.error('Update profile db error:', error)
            return { success: false, error: 'Failed to update profile' }
        }

        revalidatePath('/profile')
        // Also revalidate layout to update header avatar if changed
        revalidatePath('/', 'layout')

        return { success: true }
    } catch (error) {
        console.error('Update profile error:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}
