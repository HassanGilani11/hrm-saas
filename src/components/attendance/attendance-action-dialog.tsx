'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MapPin, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface LocationData {
    latitude: number
    longitude: number
    accuracy?: number
}

interface AttendanceActionDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    title: string
    onConfirm: (notes: string, location: LocationData | undefined) => Promise<void>
    isPending: boolean
    actionType: 'in' | 'out'
}

export function AttendanceActionDialog({
    isOpen,
    onOpenChange,
    title,
    onConfirm,
    isPending,
    actionType
}: AttendanceActionDialogProps) {
    const [notes, setNotes] = useState('')
    const [location, setLocation] = useState<LocationData | undefined>(undefined)
    const [locationError, setLocationError] = useState('')
    const [loadingLocation, setLoadingLocation] = useState(false)

    // Reset state when dialog opens
    useEffect(() => {
        if (isOpen) {
            setNotes('')
            setLocation(undefined)
            setLocationError('')
            getLocation()
        }
    }, [isOpen])

    const getLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser')
            return
        }

        setLocation(undefined)
        setLoadingLocation(true)
        setLocationError('')

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                })
                setLoadingLocation(false)
            },
            (error) => {
                console.error('Location error:', error)
                let errorMessage = 'Unable to retrieve your location'
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = 'Location permission denied'
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errorMessage = 'Location information is unavailable'
                } else if (error.code === error.TIMEOUT) {
                    errorMessage = 'The request to get user location timed out'
                }
                setLocationError(errorMessage)
                setLoadingLocation(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        )
    }

    const handleSubmit = () => {
        onConfirm(notes, location)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Location</Label>
                        <div className="flex items-center space-x-2 text-sm">
                            {loadingLocation ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-muted-foreground">Fetching location...</span>
                                </>
                            ) : location ? (
                                <div className="text-green-600 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>
                                        Captured: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                    </span>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={getLocation}
                                        className="h-auto p-0 ml-2 text-muted-foreground hover:text-primary"
                                    >
                                        Refresh
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-destructive flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{locationError || 'Location not captured'}</span>
                                    <Button variant="link" size="sm" onClick={getLocation} className="h-auto p-0">Retry</Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder={actionType === 'in' ? "Late arrival due to traffic..." : "Leaving early for appointment..."}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className={actionType === 'in' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Confirming...
                            </>
                        ) : (
                            'Confirm'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
