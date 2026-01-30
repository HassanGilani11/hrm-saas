'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const designationSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    level: z.coerce.number().min(1, 'Level must be at least 1'),
    departmentId: z.string().optional(),
    isActive: z.boolean().default(true),
})

export type DesignationFormValues = z.infer<typeof designationSchema>

async function getAuthenticatedUserOrganization() {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) throw new Error('Unauthorized')

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (!userData) throw new Error('Organization not found')
    if (!['SUPER_ADMIN', 'HR_ADMIN'].includes(userData.role)) throw new Error('Permission denied')

    return { supabase, organizationId: userData.organization_id }
}

export async function createDesignationAction(data: DesignationFormValues) {
    try {
        const { supabase, organizationId } = await getAuthenticatedUserOrganization()

        const validated = designationSchema.parse(data)

        const { error } = await supabase
            .from('designations')
            .insert({
                organization_id: organizationId,
                name: validated.name,
                description: validated.description,
                level: validated.level,
                department_id: validated.departmentId || null,
                is_active: validated.isActive,
            })

        if (error) throw new Error(error.message)

        revalidatePath('/designations')
        return { success: true }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function updateDesignationAction(originalId: string, data: DesignationFormValues) {
    try {
        const { supabase, organizationId } = await getAuthenticatedUserOrganization()
        const validated = designationSchema.parse(data)

        const { error } = await supabase
            .from('designations')
            .update({
                name: validated.name,
                description: validated.description,
                level: validated.level,
                department_id: validated.departmentId || null,
                is_active: validated.isActive,
                updated_at: new Date().toISOString()
            })
            .eq('id', originalId)
            .eq('organization_id', organizationId)

        if (error) throw new Error(error.message)

        revalidatePath('/designations')
        return { success: true }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function deleteDesignationAction(id: string) {
    try {
        const { supabase, organizationId } = await getAuthenticatedUserOrganization()

        // Check if employees exist in this designation
        const { count, error: countError } = await supabase
            .from('employees')
            .select('id', { count: 'exact', head: true })
            .eq('designation_id', id)
            .eq('organization_id', organizationId)

        if (countError) throw new Error(countError.message)
        if (count && count > 0) throw new Error(`Cannot delete designation. ${count} employees are assigned to it.`)

        const { error } = await supabase
            .from('designations')
            .delete()
            .eq('id', id)
            .eq('organization_id', organizationId)

        if (error) throw new Error(error.message)

        revalidatePath('/designations')
        return { success: true }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}
