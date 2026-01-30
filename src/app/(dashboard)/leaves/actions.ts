'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const leaveSchema = z.object({
    leaveTypeId: z.string().uuid(),
    startDate: z.string().transform(str => new Date(str)),
    endDate: z.string().transform(str => new Date(str)),
    reason: z.string().min(5),
    isHalfDay: z.boolean().default(false)
}).refine(data => data.endDate >= data.startDate, {
    message: "End date must be after or equal to start date",
    path: ["endDate"]
})

export async function applyLeaveAction(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // Get current user and employee record
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { success: false, error: 'Unauthorized' }
    }

    const { data: employee } = await supabase
        .from('employees')
        .select('id, organization_id')
        .eq('user_id', user.id)
        .single() as { data: any, error: any }

    if (!employee) {
        return { success: false, error: 'Employee record not found' }
    }

    const rawData = {
        leaveTypeId: formData.get('leaveTypeId'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        reason: formData.get('reason'),
        isHalfDay: formData.get('isHalfDay') === 'on'
    }

    const validated = leaveSchema.safeParse(rawData)

    if (!validated.success) {
        const formatted = validated.error.format()
        const errorMessage = formatted._errors?.[0] ||
            Object.values(formatted).flatMap((e: any) => e?._errors || [])[0] ||
            'Invalid form data'

        return {
            success: false,
            error: errorMessage
        }
    }

    const { startDate, endDate, isHalfDay } = validated.data

    // Calculate days
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    let distinctDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    if (isHalfDay) {
        distinctDays = 0.5
    }

    // Insert leave request
    const { error: insertError } = await (supabase
        .from('leaves') as any)
        .insert({
            organization_id: employee.organization_id,
            employee_id: employee.id,
            leave_type_id: validated.data.leaveTypeId,
            start_date: validated.data.startDate.toISOString().split('T')[0],
            end_date: validated.data.endDate.toISOString().split('T')[0],
            days: distinctDays,
            is_half_day: isHalfDay,
            reason: validated.data.reason,
            status: 'PENDING'
        })

    if (insertError) {
        console.error('Leave application error:', insertError)
        return { success: false, error: 'Failed to apply for leave' }
    }

    revalidatePath('/leaves')
    return { success: true, message: 'Leave application submitted successfully' }
}

// ----------------------------------------------------------------------
// HOLIDAY ACTIONS
// ----------------------------------------------------------------------

const holidaySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    date: z.string().transform(str => new Date(str)),
    type: z.enum(['PUBLIC', 'COMPANY', 'RESTRICTED']),
    description: z.string().optional()
})

export async function createHolidayAction(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // 1. Auth & Perms Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: employee } = await supabase
        .from('employees')
        .select('organization_id')
        .eq('user_id', user.id)
        .single() as { data: any, error: any }

    // Only HR_ADMIN or SUPER_ADMIN (checked via role enum usually, but for now strict check)
    // Assuming 'role' in employees table mirrors users role or we check users table. 
    // Let's check the users table for role as per previous patterns if employee doesnt have role.
    // Actually, in LeavesPage we fetch role from 'users'. Let's do that here for safety.

    const { data: userData } = await supabase
        .from('users')
        .select('role, organization_id')
        .eq('id', user.id)
        .single() as { data: any, error: any }

    if (!userData || !['HR_ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
        return { success: false, error: 'Permission denied. Admins only.' }
    }

    // 2. Validation
    const rawData = {
        name: formData.get('name'),
        date: formData.get('date'),
        type: formData.get('type'),
        description: formData.get('description'),
    }

    const validated = holidaySchema.safeParse(rawData)
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message }
    }

    // 3. Insert
    const { error } = await (supabase
        .from('holidays') as any)
        .insert({
            organization_id: userData.organization_id,
            name: validated.data.name,
            date: validated.data.date.toISOString().split('T')[0],
            type: validated.data.type,
            description: validated.data.description || null
        })

    if (error) {
        console.error('Create holiday error:', error)
        return { success: false, error: 'Failed to create holiday' }
    }

    revalidatePath('/leaves')
    return { success: true, message: 'Holiday created successfully' }
}

export async function updateHolidayAction(holidayId: string, prevState: any, formData: FormData) {
    const supabase = await createClient()

    // 1. Auth & Perms
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!userData || !['HR_ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
        return { success: false, error: 'Permission denied' }
    }

    // 2. Validation
    const rawData = {
        name: formData.get('name'),
        date: formData.get('date'),
        type: formData.get('type'),
        description: formData.get('description'),
    }

    const validated = holidaySchema.safeParse(rawData)
    if (!validated.success) {
        return { success: false, error: validated.error.issues[0].message }
    }

    // 3. Update
    const { error } = await supabase
        .from('holidays')
        .update({
            name: validated.data.name,
            date: validated.data.date.toISOString().split('T')[0],
            type: validated.data.type,
            description: validated.data.description || null
        })
        .eq('id', holidayId)

    if (error) {
        console.error('Update holiday error:', error)
        return { success: false, error: 'Failed to update holiday' }
    }

    revalidatePath('/leaves')
    return { success: true, message: 'Holiday updated successfully' }
}

export async function deleteHolidayAction(holidayId: string) {
    const supabase = await createClient()

    // 1. Auth & Perms
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!userData || !['HR_ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
        return { success: false, error: 'Permission denied' }
    }

    // 2. Delete
    const { error } = await supabase
        .from('holidays')
        .delete()
        .eq('id', holidayId)

    if (error) {
        console.error('Delete holiday error:', error)
        return { success: false, error: 'Failed to delete holiday' }
    }

    revalidatePath('/leaves')
    return { success: true, message: 'Holiday deleted successfully' }
}

// ----------------------------------------------------------------------
// LEAVE APPROVAL ACTIONS
// ----------------------------------------------------------------------

export async function approveLeaveAction(requestId: string, comment?: string) {
    const supabase = await createClient()

    // 1. Auth & Perms
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!userData || !['HR_ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
        return { success: false, error: 'Permission denied' }
    }

    // 2. Fetch Request Details
    const { data: request, error: fetchError } = await supabase
        .from('leaves')
        .select('*')
        .eq('id', requestId)
        .single()

    if (fetchError || !request) {
        return { success: false, error: 'Request not found' }
    }

    if (request.status !== 'PENDING') {
        return { success: false, error: 'Request is not pending' }
    }

    // 3. Update Status
    // NOTE: Balances table tracks 'used'. We need to update that.
    // Assuming 'pending' in balance is auto-calculated or managed. 
    // Actually, based on previous artifacts, balance table has 'used'. 
    // We should increment 'used'. 

    // First, update leave status
    const { error: updateError } = await supabase
        .from('leaves')
        .update({
            status: 'APPROVED',
            // approved_by: user.id, // If column exists
            // approval_comment: comment // If column exists
        })
        .eq('id', requestId)

    if (updateError) {
        console.error('Approve error:', updateError)
        return { success: false, error: 'Failed to approve leave' }
    }

    // 4. Update Balance (Increment Used)
    if (request.status === 'PENDING') {
        // Fetch current balance
        const { data: balance } = await supabase
            .from('leave_balances')
            .select('*')
            .eq('employee_id', request.employee_id)
            .eq('leave_type_id', request.leave_type_id)
            .eq('year', new Date(request.start_date).getFullYear()) // Assuming year match
            .single()

        if (balance) {
            const { error: balanceError } = await supabase
                .from('leave_balances')
                .update({
                    used: balance.used + request.days
                })
                .eq('id', balance.id)

            if (balanceError) console.error('Failed to update balance stats', balanceError)
        }
    }

    revalidatePath('/leaves')
    return { success: true, message: 'Leave approved successfully' }
}

export async function rejectLeaveAction(requestId: string, comment?: string) {
    const supabase = await createClient()

    // 1. Auth & Perms
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!userData || !['HR_ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
        return { success: false, error: 'Permission denied' }
    }

    // 2. Update Status
    const { error: updateError } = await supabase
        .from('leaves')
        .update({
            status: 'REJECTED'
        })
        .eq('id', requestId)

    if (updateError) {
        console.error('Reject error:', updateError)
        return { success: false, error: 'Failed to reject leave' }
    }

    revalidatePath('/leaves')
    return { success: true, message: 'Leave rejected' }
}
