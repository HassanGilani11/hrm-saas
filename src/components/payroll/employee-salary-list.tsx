'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Wallet, Pencil } from "lucide-react"
import { assignSalaryAction } from "@/app/(dashboard)/payroll/employees/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Employee {
    id: string
    first_name: string
    last_name: string
    employee_id: string
    salary_settings: any[]
}

export function EmployeeSalaryList({ employees, structures }: { employees: Employee[], structures: any[] }) {
    const router = useRouter()
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        base_salary: '',
        structure_id: '',
        payment_method: 'BANK_TRANSFER'
    })

    const handleOpenDialog = (employee: Employee) => {
        const settings = employee.salary_settings?.[0]
        setSelectedEmployee(employee)
        setFormData({
            base_salary: settings?.base_salary?.toString() || '',
            structure_id: settings?.salary_structure_id || '',
            payment_method: settings?.payment_method || 'BANK_TRANSFER'
        })
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!selectedEmployee) return
        setLoading(true)

        try {
            const structure_id = formData.structure_id === "" ? null : formData.structure_id;

            const res = await assignSalaryAction({
                employee_id: selectedEmployee.id,
                ...formData,
                structure_id: structure_id as string, // Cast for type safety but it's handled on server
                base_salary: parseFloat(formData.base_salary)
            })

            if (res.success) {
                toast.success('Salary assigned successfully')
                setIsDialogOpen(false)
                router.refresh()
            } else {
                toast.error(res.error || 'Failed to assign salary')
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Salary Structure</TableHead>
                        <TableHead>Base Salary</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employees.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                No active employees found. Please ensure you have added employees and set them to "ACTIVE" status.
                            </TableCell>
                        </TableRow>
                    ) : (
                        employees.map((emp) => {
                            const settings = emp.salary_settings?.[0]
                            const structureName = structures?.find(s => s.id === settings?.salary_structure_id)?.name

                            return (
                                <TableRow key={emp.id}>
                                    <TableCell>
                                        <div className="font-medium">{emp.first_name} {emp.last_name}</div>
                                        <div className="text-xs text-muted-foreground">{emp.employee_id}</div>
                                    </TableCell>
                                    <TableCell>
                                        {structureName ? (
                                            <Badge variant="secondary">{structureName}</Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs italic">Not Assigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {settings?.base_salary ? (
                                            <span className="font-mono">${parseFloat(settings.base_salary).toLocaleString()}</span>
                                        ) : (
                                            '—'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {settings?.payment_method?.replace('_', ' ') || '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(emp)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            {settings ? 'Update' : 'Assign'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    )}
                </TableBody>
            </Table>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Salary: {selectedEmployee?.first_name} {selectedEmployee?.last_name}</DialogTitle>
                        <DialogDescription>
                            Set the base salary and structure for this employee.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Salary Structure</Label>
                            <Select
                                value={formData.structure_id}
                                onValueChange={(v) => setFormData({ ...formData, structure_id: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a structure" />
                                </SelectTrigger>
                                <SelectContent>
                                    {structures.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Base Salary (CTC/Monthly)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={formData.base_salary}
                                onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Select
                                value={formData.payment_method}
                                onValueChange={(v) => setFormData({ ...formData, payment_method: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
