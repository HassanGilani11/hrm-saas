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
import { updateOrganizationAction } from '@/app/(dashboard)/organization/actions'

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    address: z.string().optional(),
})

export type OrganizationFormValues = z.infer<typeof formSchema>

interface OrganizationFormProps {
    initialData: {
        name: string
        email: string
        phone: string
        address: string
        slug: string
    }
    isReadOnly?: boolean
}

export function OrganizationForm({ initialData, isReadOnly = false }: OrganizationFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<OrganizationFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData.name,
            email: initialData.email,
            phone: initialData.phone,
            address: initialData.address,
        },
    })

    async function onSubmit(data: OrganizationFormValues) {
        setIsSubmitting(true)
        try {
            const result = await updateOrganizationAction(data)
            if (result.success) {
                toast.success('Organization settings updated')
            } else {
                toast.error(result.error || 'Failed to update settings')
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                                <Input disabled={isReadOnly} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact Email</FormLabel>
                                <FormControl>
                                    <Input disabled={isReadOnly} type="email" {...field} />
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
                                    <Input disabled={isReadOnly} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Textarea disabled={isReadOnly} className="resize-none" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Organization Slug (Read-only)
                    </label>
                    <Input
                        value={initialData.slug}
                        disabled
                        className="mt-2 bg-muted/50"
                    />
                    <p className="text-[0.8rem] text-muted-foreground mt-1">
                        Used for your unique URL identifier. Cannot be changed.
                    </p>
                </div>

                {!isReadOnly && (
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                )}
            </form>
        </Form>
    )
}
