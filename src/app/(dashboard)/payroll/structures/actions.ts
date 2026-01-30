'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const componentSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.enum(['earning', 'deduction']),
    amount_type: z.enum(['fixed', 'percentage']),
    value: z.number().min(0, 'Value must be positive'),
    is_taxable: z.boolean().default(true)
})

const structureSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    components: z.object({
        earnings: z.array(componentSchema),
        deductions: z.array(componentSchema)
    })
})

export async function createSalaryStructureAction(prevState: any, formData: FormData) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const { data: userData } = await supabase
            .from('users')
            .select('organization_id')
            .eq('id', user.id)
            .single()

        if (!userData) return { success: false, error: 'User data not found' }

        // Parse JSON components from hidden input or construct from form data
        // For complex nested forms, it's often easier to parse a JSON string sent from client
        const rawJson = formData.get('data') as string
        const rawData = JSON.parse(rawJson)

        const validated = structureSchema.safeParse(rawData)

        if (!validated.success) {
            return {
                success: false,
                error: validated.error.errors[0]?.message || 'Invalid data'
            }
        }

        const { error } = await supabase
            .from('salary_structures')
            .insert({
                organization_id: userData.organization_id,
                name: validated.data.name,
                description: validated.data.description,
                components: validated.data.components,
                is_active: true
            })

        if (error) {
            console.error('Database Error:', error)
            return { success: false, error: 'Failed to create structure' }
        }

        revalidatePath('/payroll/structures')
        return { success: true }

    } catch (error) {
        console.error('Server Action Error:', error)
        return { success: false, error: 'Internal Server Error' }
    }
}

export async function updateSalaryStructureAction(id: string, prevState: any, formData: FormData) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const { data: userData } = await supabase
            .from('users')
            .select('organization_id')
            .eq('id', user.id)
            .single()

        if (!userData) return { success: false, error: 'User data not found' }

        const rawJson = formData.get('data') as string
        const rawData = JSON.parse(rawJson)

        const validated = structureSchema.safeParse(rawData)

        if (!validated.success) {
            return {
                success: false,
                error: validated.error.errors[0]?.message || 'Invalid data'
            }
        }

        const { error } = await supabase
            .from('salary_structures')
            .update({
                name: validated.data.name,
                description: validated.data.description,
                components: validated.data.components,
            })
            .eq('id', id)
            .eq('organization_id', userData.organization_id)

        if (error) {
            console.error('Database Error:', error)
            return { success: false, error: 'Failed to update structure' }
        }

        revalidatePath('/payroll/structures')
        return { success: true }

    } catch (error) {
        console.error('Server Action Error:', error)
        return { success: false, error: 'Internal Server Error' }
    }
}

export async function deleteSalaryStructureAction(id: string) {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const { data: userData } = await supabase
            .from('users')
            .select('organization_id, role')
            .eq('id', user.id)
            .single()

        if (!userData || !['HR_ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
            return { success: false, error: 'Permission denied' }
        }

        // Check if structure is in use
        const { count } = await supabase
            .from('employee_salary_settings')
            .select('*', { count: 'exact', head: true })
            .eq('salary_structure_id', id)

        if (count && count > 0) {
            return { success: false, error: 'Cannot delete structure as it is assigned to employees' }
        }

        const { error } = await supabase
            .from('salary_structures')
            .delete()
            .eq('id', id)
            .eq('organization_id', userData.organization_id)

        if (error) {
            console.error('Database Error:', error)
            return { success: false, error: 'Failed to delete structure' }
        }

        revalidatePath('/payroll/structures')
        return { success: true }

    } catch (error) {
        console.error('Server Action Error:', error)
        return { success: false, error: 'Internal Server Error' }
    }
}
