'use client'

import { useState, useEffect, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, LogIn, LogOut, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { checkInAction, checkOutAction } from '@/app/(dashboard)/attendance/actions'
import { toast } from 'sonner'

import { AttendanceActionDialog } from './attendance-action-dialog'

interface AttendanceDashboardProps {
    todayLogs: any[]
    recentLogs: any[]
    employeeId: string
}

export function AttendanceDashboard({
    todayLogs,
    recentLogs,
    employeeId
}: AttendanceDashboardProps) {
    const [currentTime, setCurrentTime] = useState<Date | null>(null)
    const [isPending, startTransition] = useTransition()

    // Dialog states
    const [showCheckInDialog, setShowCheckInDialog] = useState(false)
    const [showCheckOutDialog, setShowCheckOutDialog] = useState(false)

    useEffect(() => {
        setCurrentTime(new Date())
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const onConfirmCheckIn = async (notes: string, location: any) => {
        startTransition(async () => {
            try {
                const result = await checkInAction(employeeId, notes, location)
                if (result.success) {
                    toast.success('Checked in successfully')
                    setShowCheckInDialog(false)
                } else {
                    toast.error(result.error)
                }
            } catch (error) {
                toast.error('Failed to check in')
            }
        })
    }

    const onConfirmCheckOut = async (notes: string, location: any) => {
        startTransition(async () => {
            try {
                const result = await checkOutAction(employeeId, notes, location)
                if (result.success) {
                    toast.success('Checked out successfully')
                    setShowCheckOutDialog(false)
                } else {
                    toast.error(result.error)
                }
            } catch (error) {
                toast.error('Failed to check out')
            }
        })
    }

    // New logic for multiple check-ins
    const lastLog = todayLogs.length > 0 ? todayLogs[todayLogs.length - 1] : null
    const isCheckedIn = lastLog && !lastLog.check_out

    const canCheckIn = !isCheckedIn
    const canCheckOut = isCheckedIn

    // Calculate total working hours
    const totalWorkingHours = todayLogs.reduce((acc, log) => {
        return acc + (Number(log.working_hours) || 0)
    }, 0).toFixed(2)

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            {/* Action Card */}
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Daily Attendance</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-6 py-6">
                    <div className="text-4xl font-mono font-bold">
                        {currentTime ? format(currentTime, 'HH:mm:ss') : '--:--:--'}
                    </div>
                    <div className="text-muted-foreground">
                        {currentTime ? format(currentTime, 'EEEE, MMMM d, yyyy') : 'Loading...'}
                    </div>

                    <div className="flex gap-4 w-full justify-center">
                        <Button
                            size="lg"
                            className="w-32 bg-green-600 hover:bg-green-700"
                            disabled={isPending || !canCheckIn}
                            onClick={() => setShowCheckInDialog(true)}
                        >
                            <LogIn className="mr-2 h-5 w-5" />
                            Check In
                        </Button>
                        <Button
                            size="lg"
                            className="w-32 bg-red-600 hover:bg-red-700"
                            variant="destructive"
                            disabled={isPending || !canCheckOut}
                            onClick={() => setShowCheckOutDialog(true)}
                        >
                            <LogOut className="mr-2 h-5 w-5" />
                            Check Out
                        </Button>
                    </div>

                    <div className="w-full space-y-2 mt-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Last Check In</span>
                            <span className="font-medium">
                                {lastLog?.check_in ? format(new Date(lastLog.check_in), 'hh:mm a') : '--:--'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Last Check Out</span>
                            <span className="font-medium">
                                {lastLog?.check_out ? format(new Date(lastLog.check_out), 'hh:mm a') : '--:--'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t">
                            <span className="text-muted-foreground font-semibold">Total Hours Today</span>
                            <span className="font-bold">
                                {totalWorkingHours} hrs
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Logs Table */}
            <Card className="lg:col-span-4">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>In</TableHead>
                                <TableHead>Out</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead>Hours</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Show today's logs first if any */}
                            {todayLogs.length > 0 && todayLogs.map(log => (
                                <TableRow key={log.id} className="bg-muted/30">
                                    <TableCell className="font-medium">
                                        Today
                                    </TableCell>
                                    <TableCell>
                                        {log.check_in ? format(new Date(log.check_in), 'hh:mm a') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {log.check_out ? format(new Date(log.check_out), 'hh:mm a') : '-'}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground w-[150px]">
                                        {log.check_in_location ? (
                                            <a
                                                href={`https://www.google.com/maps?q=${log.check_in_location.latitude},${log.check_in_location.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 hover:text-primary transition-colors"
                                            >
                                                <MapPin className="h-3 w-3" />
                                                In: View Map
                                            </a>
                                        ) : '-'}
                                        {log.check_out_location && (
                                            <a
                                                href={`https://www.google.com/maps?q=${log.check_out_location.latitude},${log.check_out_location.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 mt-1 hover:text-primary transition-colors"
                                            >
                                                <MapPin className="h-3 w-3" />
                                                Out: View Map
                                            </a>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate text-xs" title={log.notes}>
                                        {log.notes || '-'}
                                    </TableCell>
                                    <TableCell>{log.working_hours || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {log.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {recentLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">
                                        {format(new Date(log.date), 'MMM d')}
                                    </TableCell>
                                    <TableCell>
                                        {log.check_in ? format(new Date(log.check_in), 'hh:mm a') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {log.check_out ? format(new Date(log.check_out), 'hh:mm a') : '-'}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground w-[150px]">
                                        {log.check_in_location ? (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                In: {JSON.stringify(log.check_in_location).slice(0, 10)}...
                                            </div>
                                        ) : '-'}
                                        {log.check_out_location && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <MapPin className="h-3 w-3" />
                                                Out: {JSON.stringify(log.check_out_location).slice(0, 10)}...
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate text-xs" title={log.notes}>
                                        {log.notes || '-'}
                                    </TableCell>
                                    <TableCell>{log.working_hours || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={log.status === 'Tardy' ? 'destructive' : 'outline'}>
                                            {log.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AttendanceActionDialog
                isOpen={showCheckInDialog}
                onOpenChange={setShowCheckInDialog}
                title="Confirm Check In"
                onConfirm={onConfirmCheckIn}
                isPending={isPending}
                actionType="in"
            />

            <AttendanceActionDialog
                isOpen={showCheckOutDialog}
                onOpenChange={setShowCheckOutDialog}
                title="Confirm Check Out"
                onConfirm={onConfirmCheckOut}
                isPending={isPending}
                actionType="out"
            />
        </div>
    )
}
