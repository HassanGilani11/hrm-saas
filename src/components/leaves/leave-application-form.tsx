'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { applyLeaveAction } from '@/app/(dashboard)/leaves/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface LeaveApplicationFormProps {
    leaveTypes: any[]
    onSuccess: () => void
}

const initialState = {
    success: false,
    error: '',
    message: ''
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Submitting...' : 'Apply Leave'}
        </Button>
    )
}

export function LeaveApplicationForm({ leaveTypes, onSuccess }: LeaveApplicationFormProps) {
    const [state, formAction] = useActionState(applyLeaveAction as any, initialState)
    const [isHalfDay, setIsHalfDay] = useState(false)

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message)
            onSuccess()
        } else if (state?.error) {
            toast.error(state.error)
        }
    }, [state, onSuccess])

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="leaveTypeId">Leave Type</Label>
                <Select name="leaveTypeId" required>
                    <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                        {leaveTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                                {type.name} ({type.code})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input type="date" name="startDate" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endDate" className={isHalfDay ? 'text-muted-foreground' : ''}>End Date</Label>
                    <Input type="date" name="endDate" required disabled={isHalfDay} />
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="isHalfDay"
                    name="isHalfDay"
                    checked={isHalfDay}
                    onCheckedChange={(checked) => setIsHalfDay(checked as boolean)}
                />
                <Label htmlFor="isHalfDay">Half Day</Label>
            </div>

            <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea name="reason" placeholder="Reason for leave..." required />
            </div>

            <div className="flex justify-end">
                <SubmitButton />
            </div>
        </form>
    )
}
