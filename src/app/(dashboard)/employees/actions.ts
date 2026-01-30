'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { employeeFormSchema, type EmployeeFormValues } from '@/lib/validations/employee'
import { generateEmployeeId, formatDateForDb } from '@/lib/utils'
import type { EmployeeInsert } from '@/types/database.types'

export async function createEmployeeAction(data: EmployeeFormValues) {
    try {
        // 1. Create Supabase client
        const supabase = await createClient()

        // 2. Get current user and organization
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return { success: false, error: 'Unauthorized. Please log in.' }
        }

        // Get user's organization
        const { data: userData, error: orgError } = await supabase
            .from('users')
            .select('organization_id')
            .eq('id', user.id)
            .single()

        if (orgError || !userData) {
            return { success: false, error: 'Could not find your organization.' }
        }

        const organizationId = userData.organization_id

        // 3. Validate the form data
        const validatedData = employeeFormSchema.parse(data)

        // 4. Generate employee ID
        // Get the last employee ID for this organization
        const { data: lastEmployee } = await supabase
            .from('employees')
            .select('employee_id')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        const employeeId = generateEmployeeId(lastEmployee?.employee_id)

        // 5. Prepare employee data for insertion
        const employeeData: EmployeeInsert = {
            organization_id: organizationId,
            employee_id: employeeId,
            profile_image_url: validatedData.profileImageUrl || null,
            first_name: validatedData.firstName,
            last_name: validatedData.lastName,
            email: validatedData.email,
            phone: validatedData.phone,
            date_of_birth: formatDateForDb(validatedData.dateOfBirth),
            gender: validatedData.gender,
            blood_group: validatedData.bloodGroup || null,
            marital_status: validatedData.maritalStatus,
            department_id: validatedData.departmentId,
            designation_id: validatedData.designationId,
            manager_id: (validatedData.managerId && validatedData.managerId !== 'none') ? validatedData.managerId : null,
            employment_type: validatedData.employmentType,
            joining_date: formatDateForDb(validatedData.joiningDate),
            confirmation_date: validatedData.confirmationDate
                ? formatDateForDb(validatedData.confirmationDate)
                : null,
            status: 'ACTIVE',
            current_address: { full: validatedData.currentAddress },
            permanent_address: { full: validatedData.permanentAddress },
            emergency_contacts: validatedData.emergencyContacts,
        }

        // 6. Insert employee into database
        const { data: newEmployee, error: insertError } = await supabase
            .from('employees')
            .insert(employeeData)
            .select()
            .single()

        if (insertError) {
            console.error('Employee insertion error:', insertError)

            // Check for unique constraint violations
            if (insertError.code === '23505') {
                if (insertError.message.includes('email')) {
                    return { success: false, error: 'An employee with this email already exists.' }
                }
                if (insertError.message.includes('employee_id')) {
                    return { success: false, error: 'Employee ID conflict. Please try again.' }
                }
            }

            return { success: false, error: 'Failed to create employee. Please try again.' }
        }

        // 7. Initialize leave balances for the new employee
        // Get all active leave types for the organization
        const { data: leaveTypes, error: leaveTypesError } = await supabase
            .from('leave_types')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('is_active', true)

        if (leaveTypesError) {
            console.error('Leave types fetch error:', leaveTypesError)
            // Continue anyway - leave balances can be initialized later
        } else if (leaveTypes && leaveTypes.length > 0) {
            const currentYear = new Date().getFullYear()

            const leaveBalances = leaveTypes.map(leaveType => ({
                organization_id: organizationId,
                employee_id: newEmployee.id,
                leave_type_id: leaveType.id,
                year: currentYear,
                allocated: leaveType.default_days,
                used: 0,
                pending: 0,
                available: leaveType.default_days,
            }))

            const { error: balanceError } = await supabase
                .from('leave_balances')
                .insert(leaveBalances)

            if (balanceError) {
                console.error('Leave balance initialization error:', balanceError)
                // Continue anyway - this can be fixed manually
            }
        }

        // 8. TODO: Send invitation email to the employee
        // This would be implemented with an email service like Resend or SendGrid

        // 9. Revalidate relevant pages
        revalidatePath('/employees')
        revalidatePath('/payroll/employees')
        revalidatePath('/dashboard')

        return {
            success: true,
            data: {
                id: newEmployee.id,
                employeeId: newEmployee.employee_id,
                name: `${newEmployee.first_name} ${newEmployee.last_name}`,
            }
        }
    } catch (error) {
        console.error('Create employee error:', error)

        if (error instanceof Error) {
            return { success: false, error: error.message }
        }

        return { success: false, error: 'An unexpected error occurred.' }
    }
}

export async function updateEmployeeAction(employeeId: string, data: EmployeeFormValues) {
    try {
        const supabase = await createClient()

        // Get current user and check permissions
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return { success: false, error: 'Unauthorized. Please log in.' }
        }

        const { data: userData, error: orgError } = await supabase
            .from('users')
            .select('organization_id, role')
            .eq('id', user.id)
            .single()

        if (orgError || !userData) {
            return { success: false, error: 'Could not find your organization.' }
        }

        // Check permissions
        const canEdit = ['SUPER_ADMIN', 'HR_ADMIN'].includes(userData.role)
        if (!canEdit) {
            return { success: false, error: 'You do not have permission to edit employees.' }
        }

        const organizationId = userData.organization_id

        // Validate the form data
        const validatedData = employeeFormSchema.parse(data)

        // Prepare update data
        const updateData = {
            profile_image_url: validatedData.profileImageUrl || null,
            first_name: validatedData.firstName,
            last_name: validatedData.lastName,
            email: validatedData.email,
            phone: validatedData.phone,
            date_of_birth: formatDateForDb(validatedData.dateOfBirth),
            gender: validatedData.gender,
            blood_group: validatedData.bloodGroup || null,
            marital_status: validatedData.maritalStatus,
            department_id: validatedData.departmentId,
            designation_id: validatedData.designationId,
            manager_id: (validatedData.managerId && validatedData.managerId !== 'none') ? validatedData.managerId : null,
            employment_type: validatedData.employmentType,
            joining_date: formatDateForDb(validatedData.joiningDate),
            confirmation_date: validatedData.confirmationDate
                ? formatDateForDb(validatedData.confirmationDate)
                : null,
            current_address: { full: validatedData.currentAddress },
            permanent_address: { full: validatedData.permanentAddress },
            emergency_contacts: validatedData.emergencyContacts,
            updated_at: new Date().toISOString(),
        }

        // Update employee
        const { error: updateError } = await supabase
            .from('employees')
            .update(updateData)
            .eq('id', employeeId)
            .eq('organization_id', organizationId)

        if (updateError) {
            console.error('Update error:', updateError)
            return { success: false, error: 'Failed to update employee.' }
        }

        // Revalidate paths
        revalidatePath('/employees')
        revalidatePath(`/employees/${employeeId}`)

        return { success: true }
    } catch (error) {
        console.error('Update employee error:', error)

        if (error instanceof Error) {
            return { success: false, error: error.message }
        }

        return { success: false, error: 'An unexpected error occurred.' }
    }
}

export async function deleteEmployeeAction(employeeId: string) {
    try {
        const supabase = await createClient()

        // Get current user and check permissions
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return { success: false, error: 'Unauthorized. Please log in.' }
        }

        const { data: userData, error: orgError } = await supabase
            .from('users')
            .select('organization_id, role')
            .eq('id', user.id)
            .single()

        if (orgError || !userData) {
            return { success: false, error: 'Could not find your organization.' }
        }

        // Only SUPER_ADMIN can delete employees
        if (userData.role !== 'SUPER_ADMIN') {
            return { success: false, error: 'Only Super Admins can delete employees.' }
        }

        const organizationId = userData.organization_id

        // Soft delete: Update status to RESIGNED
        const { error: deleteError } = await supabase
            .from('employees')
            .update({
                status: 'RESIGNED',
                resignation_date: new Date().toISOString().split('T')[0],
                updated_at: new Date().toISOString(),
            })
            .eq('id', employeeId)
            .eq('organization_id', organizationId)

        if (deleteError) {
            console.error('Delete error:', deleteError)
            return { success: false, error: 'Failed to delete employee.' }
        }

        // Revalidate paths
        revalidatePath('/employees')

        return { success: true }
    } catch (error) {
        console.error('Delete employee error:', error)

        if (error instanceof Error) {
            return { success: false, error: error.message }
        }

        return { success: false, error: 'An unexpected error occurred.' }
    }
}
