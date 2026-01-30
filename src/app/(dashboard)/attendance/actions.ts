'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface LocationData {
    latitude: number
    longitude: number
    accuracy?: number
}

export async function checkInAction(employeeId: string, notes?: string, location?: LocationData) {
    const supabase = await createClient()
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    // Get user's organization_id
    const { data: userData, error: userError } = await supabase
        .from('employees')
        .select('organization_id')
        .eq('id', employeeId)
        .single()

    if (userError || !userData) {
        return { success: false, error: 'Employee not found' }
    }

    // Check if there is an OPEN session
    const { data: openSession } = await supabase
        .from('attendances')
        .select('id')
        .eq('employee_id', employeeId)
        .is('check_out', null)
        .single()

    if (openSession) {
        return { success: false, error: 'You are already checked in.' }
    }

    const { error } = await supabase
        .from('attendances')
        .insert({
            organization_id: userData.organization_id,
            employee_id: employeeId,
            date: today,
            check_in: now.toISOString(),
            status: 'PRESENT',
            notes: notes || null,
            check_in_location: location || null
        })

    if (error) {
        console.error('Check-in error:', error)
        return { success: false, error: 'Failed to check in' }
    }

    revalidatePath('/attendance')
    return { success: true }
}

export async function checkOutAction(employeeId: string, notes?: string, location?: LocationData) {
    const supabase = await createClient()
    const now = new Date()

    // Find the latest OPEN session
    const { data: openSession, error: fetchError } = await supabase
        .from('attendances')
        .select('id, check_in')
        .eq('employee_id', employeeId)
        .is('check_out', null)
        .order('check_in', { ascending: false })
        .limit(1)
        .single()

    if (fetchError || !openSession) {
        return { success: false, error: 'No active check-in found.' }
    }

    // Calculate working hours
    const checkInTime = new Date(openSession.check_in)
    const durationMs = now.getTime() - checkInTime.getTime()
    const workingHours = (durationMs / (1000 * 60 * 60)).toFixed(2)

    // Append notes if they exist, or just set them if previous were null. 
    // Usually check-out notes might be separate or appended. 
    // checking data structure... 'notes' is text. 
    // We can append " | Check-out: [notes]" if exists, or just overwrite/append.
    // Let's assume we append for now or just update. 
    // Actually, simply updating 'notes' might overwrite check-in notes if we are not careful.
    // Let's fetch existing notes first if we want to append, or just use a new column if schema supported it.
    // Schema only has one 'notes' column. I will append.

    const { data: currentNotes } = await supabase
        .from('attendances')
        .select('notes')
        .eq('id', openSession.id)
        .single()

    let finalNotes = currentNotes?.notes || ''
    if (notes) {
        finalNotes = finalNotes ? `${finalNotes}\n[Out]: ${notes}` : `[Out]: ${notes}`
    }

    const { error } = await supabase
        .from('attendances')
        .update({
            check_out: now.toISOString(),
            working_hours: parseFloat(workingHours),
            notes: finalNotes,
            check_out_location: location || null
        })
        .eq('id', openSession.id)

    if (error) {
        console.error('Check-out error:', error)
        return { success: false, error: 'Failed to check out' }
    }

    revalidatePath('/attendance')
    return { success: true }
}
