'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { deleteHolidayAction } from '@/app/(dashboard)/leaves/actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface DeleteHolidayDialogProps {
    holiday: any
    onSuccess: () => void
    onCancel: () => void
}

export function DeleteHolidayDialog({ holiday, onSuccess, onCancel }: DeleteHolidayDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteHolidayAction(holiday.id)
            if (result.success) {
                toast.success(result.message)
                onSuccess()
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error('Failed to delete holiday')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-4">
            <DialogHeader>
                <DialogTitle>Delete Holiday</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete <strong>{holiday.name}</strong>? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
                    Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete
                </Button>
            </DialogFooter>
        </div>
    )
}
