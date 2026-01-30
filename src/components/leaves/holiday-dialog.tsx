'use client'

import { useActionState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createHolidayAction, updateHolidayAction } from '@/app/(dashboard)/leaves/actions'
import { toast } from 'sonner'
import { useFormStatus } from 'react-dom'

interface HolidayDialogProps {
    holiday?: any
    onSuccess: () => void
}

const initialState = {
    success: false,
    error: '',
    message: ''
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Saving...' : (isEditing ? 'Update Holiday' : 'Add Holiday')}
        </Button>
    )
}

export function HolidayDialog({ holiday, onSuccess }: HolidayDialogProps) {
    const isEditing = !!holiday

    // Bind the holiday ID if editing
    const action = isEditing
        ? updateHolidayAction.bind(null, holiday.id)
        : createHolidayAction

    const [state, formAction] = useActionState(action, initialState)

    useEffect(() => {
        if (state.success) {
            toast.success(state.message)
            onSuccess()
        } else if (state.error) {
            toast.error(state.error)
        }
    }, [state, onSuccess])

    return (
        <form action={formAction} className="space-y-4">
            <DialogHeader>
                <DialogTitle>{isEditing ? 'Edit Holiday' : 'Add New Holiday'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Holiday Name</Label>
                    <Input
                        id="name"
                        name="name"
                        defaultValue={holiday?.name}
                        placeholder="e.g. New Year's Day"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            name="date"
                            type="date"
                            defaultValue={holiday?.date ? new Date(holiday.date).toISOString().split('T')[0] : ''}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select name="type" defaultValue={holiday?.type || "PUBLIC"}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PUBLIC">Public Holiday</SelectItem>
                                <SelectItem value="COMPANY">Company Holiday</SelectItem>
                                <SelectItem value="RESTRICTED">Restricted Holiday</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                        id="description"
                        name="description"
                        defaultValue={holiday?.description}
                        placeholder="Additional details..."
                    />
                </div>
            </div>

            <DialogFooter>
                <SubmitButton isEditing={isEditing} />
            </DialogFooter>
        </form>
    )
}
