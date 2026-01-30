import { z } from 'zod'

// Emergency contact schema
const emergencyContactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    relationship: z.string().min(2, 'Relationship is required'),
    phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
})

// Address schema
const addressSchema = z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
})

// Main employee form schema
export const employeeFormSchema = z.object({
    // Personal Information
    profileImageUrl: z.string().optional().nullable(),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
    dateOfBirth: z.date().max(new Date(), 'Date of birth cannot be in the future'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    bloodGroup: z.string().optional(),
    maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']),

    // Employment Information
    departmentId: z.string().uuid('Invalid department'),
    designationId: z.string().uuid('Invalid designation'),
    managerId: z.union([z.string().uuid(), z.literal('none'), z.literal('')]).optional().nullable(),
    employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']),
    joiningDate: z.date(),
    confirmationDate: z.date().optional().nullable(),

    // Address Information
    currentAddress: z.string().min(10, 'Address must be at least 10 characters'),
    permanentAddress: z.string().min(10, 'Address must be at least 10 characters'),
    sameAsCurrent: z.boolean().optional(),

    // Emergency Contacts (at least 1 required)
    emergencyContacts: z.array(emergencyContactSchema).min(1, 'At least one emergency contact is required'),
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>
