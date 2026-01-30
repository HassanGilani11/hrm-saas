'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { updateProfileAction } from '@/app/(dashboard)/profile/actions'
import { ImageUpload } from '@/components/ui/image-upload'

// Simplified schema for self-edit
const profileFormSchema = z.object({
    profileImageUrl: z.string().nullable().optional(),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
    currentAddress: z.string().optional(),
    permanentAddress: z.string().optional(),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
    initialData: any
}

export function ProfileForm({ initialData }: ProfileFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const defaultValues: ProfileFormValues = {
        profileImageUrl: initialData?.profile_image_url || null,
        firstName: initialData?.first_name || '',
        lastName: initialData?.last_name || '',
        phone: initialData?.phone || '',
        currentAddress: initialData?.current_address?.full || '',
        permanentAddress: initialData?.permanent_address?.full || '',
    }

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues,
    })

    const handleSubmit = async (data: ProfileFormValues) => {
        setIsSubmitting(true)
        try {
            const result = await updateProfileAction(data)
            if (result.success) {
                toast.success('Profile updated successfully')
            } else {
                toast.error(result.error || 'Failed to update profile')
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                {/* Profile Image */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Profile Picture</h3>
                    <FormField
                        control={form.control}
                        name="profileImageUrl"
                        render={({ field }) => (
                            <FormItem>
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
                </div>

                {/* Personal Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
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
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Doe" {...field} />
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
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1234567890" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input value={initialData?.email || ''} disabled className="bg-muted" />
                            </FormControl>
                            <FormDescription>Email cannot be changed.</FormDescription>
                        </FormItem>
                    </div>
                </div>

                {/* Work Info (Read Only) */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Work Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <FormLabel>Department</FormLabel>
                            <Input value={initialData?.departments?.name || 'N/A'} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <FormLabel>Designation</FormLabel>
                            <Input value={initialData?.designations?.name || 'N/A'} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <FormLabel>Employment Type</FormLabel>
                            <Input value={initialData?.employment_type?.replace('_', ' ') || 'N/A'} disabled className="bg-muted" />
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Address</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <FormField
                            control={form.control}
                            name="currentAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Full address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="permanentAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Permanent Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Full address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    )
}
