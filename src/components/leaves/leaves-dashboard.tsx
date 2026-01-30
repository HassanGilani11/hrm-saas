'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react'
import { approveLeaveAction, rejectLeaveAction } from '@/app/(dashboard)/leaves/actions'
import { toast } from 'sonner'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LeaveApplicationForm } from './leave-application-form'
import { HolidayDialog } from './holiday-dialog'
import { DeleteHolidayDialog } from './delete-holiday-dialog'

interface LeavesDashboardProps {
    balances: any[]
    requests: any[]
    leaveTypes: any[]
    holidays: any[]
    adminRequests?: any[]
    employeeId: string
    role?: string
}

export function LeavesDashboard({
    balances,
    requests,
    leaveTypes,
    holidays,
    adminRequests = [],
    employeeId,
    role
}: LeavesDashboardProps) {
    const [isApplyOpen, setIsApplyOpen] = useState(false)
    const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedHoliday, setSelectedHoliday] = useState<any>(null)
    const [processingId, setProcessingId] = useState<string | null>(null)

    const isAdmin = role === 'HR_ADMIN' || role === 'SUPER_ADMIN'

    const handleEditHoliday = (holiday: any) => {
        setSelectedHoliday(holiday)
        setIsHolidayDialogOpen(true)
    }

    const handleDeleteHoliday = (holiday: any) => {
        setSelectedHoliday(holiday)
        setIsDeleteDialogOpen(true)
    }

    const handleCloseHolidayDialog = () => {
        setIsHolidayDialogOpen(false)
        setSelectedHoliday(null)
    }

    const handleApprove = async (requestId: string) => {
        setProcessingId(requestId)
        try {
            const result = await approveLeaveAction(requestId)
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error('Failed to approve leave')
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (requestId: string) => {
        setProcessingId(requestId)
        try {
            const result = await rejectLeaveAction(requestId)
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error('Failed to reject leave')
        } finally {
            setProcessingId(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* Balances Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {balances.map((balance) => (
                    <Card key={balance.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {balance.leave_type.name}
                            </CardTitle>
                            <span className="text-muted-foreground text-xs">{balance.leave_type.code}</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{balance.available}</div>
                            <p className="text-xs text-muted-foreground">
                                Available out of {balance.allocated}
                            </p>
                        </CardContent>
                    </Card>
                ))}
                {balances.length === 0 && (
                    <Card className="col-span-full border-dashed">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">No Leave Balances</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Leave balances have not been assigned yet.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Tabs defaultValue={isAdmin && adminRequests.length > 0 ? "requests" : "history"} className="space-y-4">
                <div className="flex justify-between items-center">
                    <TabsList>
                        {isAdmin && (
                            <TabsTrigger value="requests" className="relative">
                                Requests
                                {adminRequests.length > 0 && (
                                    <span className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                                        {adminRequests.length}
                                    </span>
                                )}
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="history">Leave History</TabsTrigger>
                        <TabsTrigger value="holidays">Holidays</TabsTrigger>
                    </TabsList>

                    <div className="flex gap-2">
                        {isAdmin && (
                            <Button variant="outline" onClick={() => setIsHolidayDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Holiday
                            </Button>
                        )}
                        <Button onClick={() => setIsApplyOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Apply Leave
                        </Button>
                    </div>
                </div>

                {isAdmin && (
                    <TabsContent value="requests" className="space-y-4">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Days</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {adminRequests.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No pending requests.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        adminRequests.map((req) => (
                                            <TableRow key={req.id}>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {req.employee.first_name} {req.employee.last_name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {req.employee.designation?.title || 'No Designation'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{req.leave_type.name}</TableCell>
                                                <TableCell>
                                                    {format(new Date(req.start_date), 'MMM d')} - {format(new Date(req.end_date), 'MMM d, yyyy')}
                                                </TableCell>
                                                <TableCell>{req.days}</TableCell>
                                                <TableCell className="max-w-[200px] truncate" title={req.reason}>
                                                    {req.reason}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleApprove(req.id)}
                                                        disabled={!!processingId}
                                                    >
                                                        <Check className="mr-1 h-3 w-3" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleReject(req.id)}
                                                        disabled={!!processingId}
                                                    >
                                                        <X className="mr-1 h-3 w-3" />
                                                        Reject
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                )}

                <TabsContent value="history" className="space-y-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Days</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Applied On</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No leave history found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    requests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell className="font-medium">
                                                {request.leave_type.name}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(request.start_date), 'MMM d, yyyy')} - {format(new Date(request.end_date), 'MMM d, yyyy')}
                                            </TableCell>
                                            <TableCell>{request.days}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        request.status === 'APPROVED' ? 'default' :
                                                            request.status === 'REJECTED' ? 'destructive' :
                                                                'secondary'
                                                    }
                                                >
                                                    {request.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {format(new Date(request.created_at), 'MMM d, yyyy')}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="holidays">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Holiday</TableHead>
                                    <TableHead>Day</TableHead>
                                    <TableHead>Type</TableHead>
                                    {isAdmin && <TableHead className="w-[70px]"></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {holidays.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={isAdmin ? 5 : 4} className="h-24 text-center">
                                            No upcoming holidays.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    holidays.map((holiday) => (
                                        <TableRow key={holiday.id}>
                                            <TableCell className="font-medium">
                                                {format(new Date(holiday.date), 'MMM d, yyyy')}
                                            </TableCell>
                                            <TableCell>{holiday.name}</TableCell>
                                            <TableCell>{format(new Date(holiday.date), 'EEEE')}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{holiday.type}</Badge>
                                            </TableCell>
                                            {isAdmin && (
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleEditHoliday(holiday)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => handleDeleteHoliday(holiday)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Apply Leave Dialog */}
            <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Apply for Leave</DialogTitle>
                    </DialogHeader>
                    <LeaveApplicationForm
                        leaveTypes={leaveTypes}
                        onSuccess={() => setIsApplyOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Add/Edit Holiday Dialog */}
            <Dialog open={isHolidayDialogOpen} onOpenChange={(open) => !open && handleCloseHolidayDialog()}>
                <DialogContent>
                    <HolidayDialog
                        holiday={selectedHoliday}
                        onSuccess={handleCloseHolidayDialog}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Holiday Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    {selectedHoliday && (
                        <DeleteHolidayDialog
                            holiday={selectedHoliday}
                            onSuccess={() => setIsDeleteDialogOpen(false)}
                            onCancel={() => setIsDeleteDialogOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
