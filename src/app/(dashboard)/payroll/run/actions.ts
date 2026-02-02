'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function processPayrollAction(month: number, year: number) {
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

        // 1. Fetch all employees with salary settings
        const { data: settings } = await supabase
            .from('employee_salary_settings')
            .select(`
                employee_id,
                base_salary,
                structure:salary_structures(components)
            `)
            .eq('organization_id', userData.organization_id)

        if (!settings || settings.length === 0) {
            return { success: false, error: 'No employees have salary settings assigned.' }
        }

        const salariesToInsert: any[] = []
        const skippedEmployees: string[] = []

        settings.forEach((s: any) => {
            const structure = s.structure

            if (!structure) {
                skippedEmployees.push(s.employee_id)
                return
            }

            const baseSalary = parseFloat(s.base_salary)
            const earningsRaw = structure.components?.earnings || []
            const deductionsRaw = structure.components?.deductions || []

            const earnings: any = {}
            let totalEarnings = 0

            earningsRaw.forEach((e: any) => {
                const amount = e.amount_type === 'percentage'
                    ? (baseSalary * (e.value / 100))
                    : e.value
                earnings[e.name] = { amount, type: e.amount_type, value: e.value }
                totalEarnings += amount
            })

            const deductions: any = {}
            let totalDeductions = 0
            deductionsRaw.forEach((d: any) => {
                const amount = d.amount_type === 'percentage'
                    ? (baseSalary * (d.value / 100))
                    : d.value
                deductions[d.name] = { amount, type: d.amount_type, value: d.value }
                totalDeductions += amount
            })

            const netSalary = totalEarnings - totalDeductions

            salariesToInsert.push({
                organization_id: userData.organization_id,
                employee_id: s.employee_id,
                month,
                year,
                basic_salary: baseSalary,
                earnings,
                deductions,
                gross_salary: totalEarnings,
                net_salary: netSalary,
                status: 'DRAFT'
            })
        })

        if (salariesToInsert.length === 0) {
            return {
                success: false,
                error: 'Values calculation failed. Check if employees have valid salary structures assigned.',
                skippedEmployees
            }
        }

        // 2. Upsert salaries for the selected month/year
        const { data, error } = await supabase
            .from('salaries')
            .upsert(salariesToInsert, {
                onConflict: 'organization_id, employee_id, month, year'
            })
            .select(`
                *,
                employee:employees(first_name, last_name, employee_id)
            `)

        if (error) {
            console.error('Database Error:', error)
            return { success: false, error: 'Failed to generate payroll' }
        }

        return { success: true, data, skippedEmployees }

    } catch (error) {
        console.error('Server Action Error:', error)
        return { success: false, error: 'Internal Server Error' }
    }
}

export async function finalizePayrollAction(month: number, year: number) {
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

        const { count, error } = await supabase
            .from('salaries')
            .update({ status: 'APPROVED' }, { count: 'exact' })
            .eq('organization_id', userData.organization_id)
            .eq('month', month)
            .eq('year', year)
            .eq('status', 'DRAFT')

        if (error) {
            console.error('Database Error:', error)
            return { success: false, error: 'Failed to finalize payroll' }
        }

        return { success: true, count }
    } catch (error) {
        return { success: false, error: 'Internal Server Error' }
    }
}
