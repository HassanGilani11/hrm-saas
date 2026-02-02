'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const organizationSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    address: z.string().optional(),
})

export type OrganizationFormValues = z.infer<typeof organizationSchema>

export async function updateOrganizationAction(data: OrganizationFormValues) {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        return { success: false, error: 'Unauthorized' }
    }

    // Get user's organization
    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (!userData) {
        return { success: false, error: 'Organization not found' }
    }

    // Check permissions
    if (!['SUPER_ADMIN', 'HR_ADMIN'].includes(userData.role)) {
        return { success: false, error: 'Permission denied' }
    }

    // Validate data
    const validated = organizationSchema.safeParse(data)
    if (!validated.success) {
        return { success: false, error: (validated.error as any).errors[0].message }
    }

    // Update organization
    const { error: updateError } = await supabase
        .from('organizations')
        .update({
            name: validated.data.name,
            email: validated.data.email,
            phone: validated.data.phone,
            address: validated.data.address ? { full: validated.data.address } : null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userData.organization_id)

    if (updateError) {
        return { success: false, error: updateError.message }
    }

    revalidatePath('/organization')

    return { success: true }
}
