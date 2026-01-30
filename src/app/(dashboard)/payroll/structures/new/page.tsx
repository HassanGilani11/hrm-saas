'use client'

import { useActionState, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Save } from 'lucide-react'
import { createSalaryStructureAction } from '../actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type ComponentType = 'earning' | 'deduction'
type AmountType = 'fixed' | 'percentage'

interface SalaryComponent {
    id: string
    name: string
    type: ComponentType
    amount_type: AmountType
    value: number
    is_taxable: boolean
}

const DEFAULT_EARNINGS: SalaryComponent[] = [
    { id: '1', name: 'Basic Salary', type: 'earning', amount_type: 'percentage', value: 40, is_taxable: true },
    { id: '2', name: 'HRA', type: 'earning', amount_type: 'percentage', value: 20, is_taxable: true },
]

export default function NewStructurePage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [earnings, setEarnings] = useState<SalaryComponent[]>(DEFAULT_EARNINGS)
    const [deductions, setDeductions] = useState<SalaryComponent[]>([])

    const addComponent = (type: ComponentType) => {
        const newComponent: SalaryComponent = {
            id: Math.random().toString(36).substr(2, 9),
            name: '',
            type,
            amount_type: 'fixed',
            value: 0,
            is_taxable: true
        }
        if (type === 'earning') setEarnings([...earnings, newComponent])
        else setDeductions([...deductions, newComponent])
    }

    const removeComponent = (type: ComponentType, id: string) => {
        if (type === 'earning') setEarnings(earnings.filter(c => c.id !== id))
        else setDeductions(deductions.filter(c => c.id !== id))
    }

    const updateComponent = (type: ComponentType, id: string, field: keyof SalaryComponent, val: any) => {
        const updater = (prev: SalaryComponent[]) => prev.map(c => c.id === id ? { ...c, [field]: val } : c)
        if (type === 'earning') setEarnings(updater(earnings))
        else setDeductions(updater(deductions))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const payload = {
            name,
            description,
            components: {
                earnings: earnings.map(({ id, ...rest }) => rest), // Remove temp ID
                deductions: deductions.map(({ id, ...rest }) => rest)
            }
        }

        const formData = new FormData()
        formData.append('data', JSON.stringify(payload))

        const result = await createSalaryStructureAction(null, formData)

        if (result.success) {
            toast.success('Salary structure created')
            router.push('/payroll/structures')
        } else {
            toast.error(result.error || 'Failed to create')
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Create Salary Structure</h2>
                <p className="text-muted-foreground">Define a new salary template.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Structure Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Standard Full-Time"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desc">Description</Label>
                            <Textarea
                                id="desc"
                                placeholder="Brief description..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Earnings */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base">Earnings</CardTitle>
                            <Button type="button" size="sm" variant="outline" onClick={() => addComponent('earning')}>
                                <Plus className="h-4 w-4 mr-2" /> Add
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {earnings.map((c) => (
                                <div key={c.id} className="rounded-lg border p-3 space-y-3 bg-muted/30">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                placeholder="Name (e.g. Basic)"
                                                value={c.name}
                                                onChange={e => updateComponent('earning', c.id, 'name', e.target.value)}
                                                className="h-8"
                                                required
                                            />
                                            <div className="flex gap-2">
                                                <Select
                                                    value={c.amount_type}
                                                    onValueChange={v => updateComponent('earning', c.id, 'amount_type', v)}
                                                >
                                                    <SelectTrigger className="h-8 w-[110px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="percentage">% of Base</SelectItem>
                                                        <SelectItem value="fixed">Fixed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    type="number"
                                                    placeholder="Val"
                                                    value={c.value}
                                                    onChange={e => updateComponent('earning', c.id, 'value', parseFloat(e.target.value))}
                                                    className="h-8 flex-1"
                                                    min={0}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive"
                                            onClick={() => removeComponent('earning', c.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {earnings.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No earnings defined</p>}
                        </CardContent>
                    </Card>

                    {/* Deductions */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base">Deductions</CardTitle>
                            <Button type="button" size="sm" variant="outline" onClick={() => addComponent('deduction')}>
                                <Plus className="h-4 w-4 mr-2" /> Add
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {deductions.map((c) => (
                                <div key={c.id} className="rounded-lg border p-3 space-y-3 bg-muted/30">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                placeholder="Name (e.g. Tax)"
                                                value={c.name}
                                                onChange={e => updateComponent('deduction', c.id, 'name', e.target.value)}
                                                className="h-8"
                                                required
                                            />
                                            <div className="flex gap-2">
                                                <Select
                                                    value={c.amount_type}
                                                    onValueChange={v => updateComponent('deduction', c.id, 'amount_type', v)}
                                                >
                                                    <SelectTrigger className="h-8 w-[110px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="percentage">% of Base</SelectItem>
                                                        <SelectItem value="fixed">Fixed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    type="number"
                                                    placeholder="Val"
                                                    value={c.value}
                                                    onChange={e => updateComponent('deduction', c.id, 'value', parseFloat(e.target.value))}
                                                    className="h-8 flex-1"
                                                    min={0}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive"
                                            onClick={() => removeComponent('deduction', c.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {deductions.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No deductions defined</p>}
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        Save Structure
                    </Button>
                </div>
            </form>
        </div>
    )
}
