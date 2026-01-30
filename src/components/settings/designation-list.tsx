'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, Search, MoreHorizontal } from 'lucide-react'
import { DesignationForm } from './designation-form'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { deleteDesignationAction } from '@/app/(dashboard)/designations/actions'
import { toast } from 'sonner'

import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Designation {
    id: string
    name: string
    description?: string | null
    level: number | null
    department_id?: string | null
    is_active: boolean | null
}

interface Department {
    id: string
    name: string
}

interface DesignationListProps {
    initialDesignations: Designation[]
    departments: Department[]
}

export function DesignationList({ initialDesignations, departments }: DesignationListProps) {
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    const handleDelete = async () => {
        if (!deletingId) return

        const result = await deleteDesignationAction(deletingId)
        if (result.success) {
            toast.success('Designation deleted')
            setDeletingId(null)
        } else {
            toast.error(result.error || 'Failed to delete designation')
        }
    }

    const filteredDesignations = initialDesignations.filter(designation => {
        const matchesSearch = designation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (designation.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === 'all'
            ? true
            : statusFilter === 'active'
                ? designation.is_active
                : !designation.is_active

        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search designations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Designation
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Designation</DialogTitle>
                            <DialogDescription>
                                Create a new designation/role.
                            </DialogDescription>
                        </DialogHeader>
                        <DesignationForm
                            departments={departments}
                            onSuccess={() => setIsAddOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Level</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredDesignations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No designations found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredDesignations.map((designation) => {
                                const deptName = departments.find(d => d.id === designation.department_id)?.name
                                return (
                                    <TableRow key={designation.id}>
                                        <TableCell>{designation.level || '-'}</TableCell>
                                        <TableCell className="font-medium">{designation.name}</TableCell>
                                        <TableCell>{deptName || 'All Departments'}</TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={designation.description || ''}>
                                            {designation.description || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={designation.is_active ? "default" : "secondary"}>
                                                {designation.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => setEditingDesignation(designation)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => setDeletingId(designation.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingDesignation} onOpenChange={(open) => !open && setEditingDesignation(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Designation</DialogTitle>
                        <DialogDescription>
                            Edit designation details.
                        </DialogDescription>
                    </DialogHeader>
                    {editingDesignation && (
                        <DesignationForm
                            initialData={{
                                name: editingDesignation.name,
                                description: editingDesignation.description || undefined,
                                level: editingDesignation.level || 1,
                                departmentId: editingDesignation.department_id || undefined,
                                isActive: editingDesignation.is_active || false
                            }}
                            departments={departments}
                            designationId={editingDesignation.id}
                            onSuccess={() => setEditingDesignation(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the designation.
                            You cannot delete a designation if employees are assigned to it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
