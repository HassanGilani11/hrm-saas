'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function assignSalaryAction(data: {
    employee_id: string
    base_salary: number
    structure_id: string
    payment_method: string
}) {
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

        const { error } = await supabase
            .from('employee_salary_settings')
            .upsert({
                organization_id: userData.organization_id,
                employee_id: data.employee_id,
                salary_structure_id: data.structure_id || null, // Convert "" to null
                base_salary: data.base_salary,
                payment_method: data.payment_method,
                effective_date: new Date().toISOString(),
            }, {
                onConflict: 'organization_id, employee_id'
            })

        if (error) {
            console.error('Database Error:', error)
            return { success: false, error: 'Failed to assign salary' }
        }

        revalidatePath('/payroll/employees')
        return { success: true }

    } catch (error) {
        console.error('Server Action Error:', error)
        return { success: false, error: 'Internal Server Error' }
    }
}
