'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { deleteSalaryStructureAction } from "@/app/(dashboard)/payroll/structures/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Structure {
    id: string
    name: string
    description: string | null
    components: any
    is_active: boolean
}

export function SalaryStructuresList({ structures }: { structures: Structure[] }) {
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const router = useRouter()

    const handleDelete = async () => {
        if (!deletingId) return

        const result = await deleteSalaryStructureAction(deletingId)
        if (result.success) {
            toast.success('Structure deleted successfully')
            setDeletingId(null)
            router.refresh()
        } else {
            toast.error(result.error || 'Failed to delete structure')
        }
    }

    if (structures.length === 0) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-dashed text-center">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                    <h3 className="mt-4 text-lg font-semibold">No structures added</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground">
                        Create your first salary structure to start assigning salaries.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {structures.map((structure) => {
                const earnings = structure.components.earnings || []
                const deductions = structure.components.deductions || []

                return (
                    <Card key={structure.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-medium">
                                    {structure.name}
                                </CardTitle>
                                <CardDescription className="line-clamp-1">
                                    {structure.description || 'No description'}
                                </CardDescription>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => router.push(`/payroll/structures/${structure.id}/edit`)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => setDeletingId(structure.id)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="mb-1 text-xs font-semibold text-muted-foreground">Earnings</div>
                                    <div className="flex flex-wrap gap-1">
                                        {earnings.map((e: any, i: number) => (
                                            <Badge key={i} variant="secondary" className="text-xs">
                                                {e.name} ({e.amount_type === 'percentage' ? `${e.value}%` : 'Fixed'})
                                            </Badge>
                                        ))}
                                        {earnings.length === 0 && <span className="text-xs text-muted-foreground">None</span>}
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-1 text-xs font-semibold text-muted-foreground">Deductions</div>
                                    <div className="flex flex-wrap gap-1">
                                        {deductions.map((d: any, i: number) => (
                                            <Badge key={i} variant="outline" className="text-xs">
                                                {d.name} ({d.amount_type === 'percentage' ? `${d.value}%` : 'Fixed'})
                                            </Badge>
                                        ))}
                                        {deductions.length === 0 && <span className="text-xs text-muted-foreground">None</span>}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}

            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the salary structure.
                            You cannot delete a structure if it is assigned to employees.
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
