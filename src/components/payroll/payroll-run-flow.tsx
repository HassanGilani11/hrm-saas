'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calculator, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { processPayrollAction, finalizePayrollAction } from "@/app/(dashboard)/payroll/run/actions"
import { toast } from "sonner"

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

const YEARS = ["2025", "2026", "2027"]

export function PayrollRunFlow() {
    const [step, setStep] = useState(1) // 1: Select Date, 2: Review, 3: Success
    const [loading, setLoading] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [payrollRecords, setPayrollRecords] = useState<any[]>([])

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const res = await processPayrollAction(selectedMonth, selectedYear)
            if (res.success) {
                setPayrollRecords(res.data || [])
                setStep(2)
            } else {
                toast.error(res.error || "Failed to process payroll")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    const handleFinalize = async () => {
        setLoading(true)
        try {
            const res = await finalizePayrollAction(selectedMonth, selectedYear)
            if (res.success) {
                setStep(3)
            } else {
                toast.error(res.error || "Failed to finalize")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    if (step === 1) {
        return (
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Select Period</CardTitle>
                    <CardDescription>Choose the month and year to process payroll for.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Month</Label>
                            <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map((m, i) => (
                                        <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Year</Label>
                            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {YEARS.map((y) => (
                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button className="w-full" onClick={handleGenerate} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
                        Generate Payroll Draft
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (step === 2) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Review Payroll: {MONTHS[selectedMonth - 1]} {selectedYear}</CardTitle>
                            <CardDescription>Review the calculated salaries before finalizing.</CardDescription>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">
                                ${payrollRecords.reduce((acc, r) => acc + (r.net_salary || 0), 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">Total Net Payout</div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Gross Salary</TableHead>
                                    <TableHead>Deductions</TableHead>
                                    <TableHead>Net Salary</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payrollRecords.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>
                                            <div className="font-medium">{record.employee.first_name} {record.employee.last_name}</div>
                                            <div className="text-xs text-muted-foreground">{record.employee.employee_id}</div>
                                        </TableCell>
                                        <TableCell>${parseFloat(record.gross_salary).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <span className="text-destructive">
                                                -${payrollRecords.filter(r => r.id === record.id).reduce((acc, r) => {
                                                    const deds = r.deductions || {}
                                                    return Object.values(deds).reduce((a: any, d: any) => a + d.amount, 0)
                                                }, 0).toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-bold">${parseFloat(record.net_salary).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button onClick={handleFinalize} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        Finalize & Approve
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Card className="max-w-md mx-auto text-center py-12">
            <CardContent className="space-y-4">
                <div className="mx-auto bg-green-100 text-green-600 rounded-full h-16 w-16 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-green-600">Payroll Finalized!</h3>
                <p className="text-muted-foreground">
                    Salaries for {MONTHS[selectedMonth - 1]} {selectedYear} have been processed and approved.
                </p>
                <Button className="w-full" onClick={() => setStep(1)}>Run Another</Button>
            </CardContent>
        </Card>
    )
}
