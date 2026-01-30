'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CalendarIcon, Loader2, Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

import { employeeFormSchema, type EmployeeFormValues } from '@/lib/validations/employee'
import type { Department, Designation, Employee } from '@/types/database.types'
import { cn } from '@/lib/utils'
import { createEmployeeAction, updateEmployeeAction } from '@/app/(dashboard)/employees/actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageUpload } from '@/components/ui/image-upload'
interface EmployeeFormProps {
    mode?: 'create' | 'edit'
    employeeId?: string
    initialData?: any
    departments: { id: string; name: string }[]
    designations: { id: string; name: string }[]
    managers: { id: string; first_name: string; last_name: string; employee_id: string }[]
}

export default function EmployeeForm({
    mode = 'create',
    employeeId,
    initialData,
    departments,
    designations,
    managers
}: EmployeeFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeFormSchema),
        defaultValues: {
            profileImageUrl: initialData?.profile_image_url || null,
            firstName: initialData?.first_name || '',
            lastName: initialData?.last_name || '',
            email: initialData?.email || '',
            phone: initialData?.phone || '',
            dateOfBirth: initialData?.date_of_birth ? new Date(initialData.date_of_birth) : undefined,
            gender: (initialData?.gender as 'MALE' | 'FEMALE' | 'OTHER') || 'MALE',
            bloodGroup: initialData?.blood_group || '',
            maritalStatus: (initialData?.marital_status as 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED') || 'SINGLE',
            departmentId: initialData?.department_id || '',
            designationId: initialData?.designation_id || '',
            managerId: initialData?.manager_id || 'none',
            employmentType: (initialData?.employment_type as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN') || 'FULL_TIME',
            joiningDate: initialData?.joining_date ? new Date(initialData.joining_date) : new Date(),
            confirmationDate: initialData?.confirmation_date ? new Date(initialData.confirmation_date) : null,
            currentAddress: initialData?.current_address?.full || '',
            permanentAddress: initialData?.permanent_address?.full || '',
            sameAsCurrent: false,
            emergencyContacts: initialData?.emergency_contacts
                ? (typeof initialData.emergency_contacts === 'string'
                    ? JSON.parse(initialData.emergency_contacts)
                    : initialData.emergency_contacts)
                : [{ name: '', relationship: '', phone: '' }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'emergencyContacts',
    })

    const sameAsCurrent = form.watch('sameAsCurrent')
    const currentAddress = form.watch('currentAddress')

    // Auto-fill permanent address when "same as current" is checked
    if (sameAsCurrent && currentAddress !== form.getValues('permanentAddress')) {
        form.setValue('permanentAddress', currentAddress)
    }

    const handleSubmit = async (data: EmployeeFormValues) => {
        setIsSubmitting(true)
        try {
            let result
            if (mode === 'edit' && employeeId) {
                result = await updateEmployeeAction(employeeId, data)
            } else {
                result = await createEmployeeAction(data)
            }

            if (result.success) {
                toast.success(mode === 'edit' ? 'Employee updated successfully!' : 'Employee created successfully!')
                router.refresh() // Refresh to get latest data
                router.push('/employees')
            } else {
                toast.error(result.error || `Failed to ${mode === 'edit' ? 'update' : 'create'} employee`)
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
            console.error('Form submission error:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                {/* Personal Information */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Personal Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="profileImageUrl"
                            render={({ field }) => (
                                <FormItem className="col-span-full">
                                    <FormLabel>Profile Image</FormLabel>
                                    <FormControl>
                                        <ImageUpload
                                            value={field.value}
                                            onChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email *</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="john.doe@company.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="1234567890" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date of Birth *</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full pl-3 text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}
                                                >
                                                    {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gender *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="MALE">Male</SelectItem>
                                            <SelectItem value="FEMALE">Female</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="bloodGroup"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Blood Group</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select blood group" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="A+">A+</SelectItem>
                                            <SelectItem value="A-">A-</SelectItem>
                                            <SelectItem value="B+">B+</SelectItem>
                                            <SelectItem value="B-">B-</SelectItem>
                                            <SelectItem value="AB+">AB+</SelectItem>
                                            <SelectItem value="AB-">AB-</SelectItem>
                                            <SelectItem value="O+">O+</SelectItem>
                                            <SelectItem value="O-">O-</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="maritalStatus"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Marital Status *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select marital status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="SINGLE">Single</SelectItem>
                                            <SelectItem value="MARRIED">Married</SelectItem>
                                            <SelectItem value="DIVORCED">Divorced</SelectItem>
                                            <SelectItem value="WIDOWED">Widowed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Employment Information */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Employment Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="departmentId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="designationId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Designation *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select designation" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {designations.map((desig) => (
                                                <SelectItem key={desig.id} value={desig.id}>
                                                    {desig.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="managerId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reporting Manager</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value || undefined}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select manager (optional)" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {managers.map((manager) => (
                                                <SelectItem key={manager.id} value={manager.id}>
                                                    {manager.first_name} {manager.last_name} ({manager.employee_id})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="employmentType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Employment Type *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select employment type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                            <SelectItem value="PART_TIME">Part Time</SelectItem>
                                            <SelectItem value="CONTRACT">Contract</SelectItem>
                                            <SelectItem value="INTERN">Intern</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="joiningDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Joining Date *</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full pl-3 text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}
                                                >
                                                    {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmationDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Confirmation Date (Optional)</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full pl-3 text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}
                                                >
                                                    {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value || undefined}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Address Information</h2>

                    <div className="grid grid-cols-1 gap-4">
                        <FormField
                            control={form.control}
                            name="currentAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Address *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter complete address"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="sameAsCurrent"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Permanent address is same as current address
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="permanentAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Permanent Address *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter complete address"
                                            className="resize-none"
                                            disabled={sameAsCurrent}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Emergency Contacts */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Emergency Contacts</h2>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ name: '', relationship: '', phone: '' })}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Contact
                        </Button>
                    </div>

                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold">Contact {index + 1}</h3>
                                {fields.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`emergencyContacts.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Contact name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`emergencyContacts.${index}.relationship`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Relationship *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Spouse, Parent" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`emergencyContacts.${index}.phone`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="1234567890" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Form Actions */}
                <div className="flex gap-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting
                            ? (mode === 'edit' ? 'Updating...' : 'Creating...')
                            : (mode === 'edit' ? 'Update Employee' : 'Create Employee')}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    )
}
