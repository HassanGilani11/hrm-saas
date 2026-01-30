'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Search, X, Filter, Download } from 'lucide-react'
import { Department, Designation } from '@/types/database.types'
import { exportToCSV } from '@/lib/utils/export'
import { toast } from 'sonner'

interface EmployeeFiltersProps {
    departments: Department[]
    designations: Designation[]
    employeesData: any[] // For export
}

export function EmployeeFilters({ departments, designations, employeesData }: EmployeeFiltersProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Local state for search to handle debounce or simple enter key
    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [department, setDepartment] = useState(searchParams.get('department') || 'all')
    const [designation, setDesignation] = useState(searchParams.get('designation') || 'all')
    const [status, setStatus] = useState(searchParams.get('status') || 'all')
    const [employmentType, setEmploymentType] = useState(searchParams.get('type') || 'all')

    // Effect to debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(window.location.search)
            if (search) {
                params.set('search', search)
            } else {
                params.delete('search')
            }
            const newQuery = params.toString()
            const currentQuery = searchParams.toString()

            // Only push if query actually changed
            if (newQuery !== currentQuery) {
                router.push(`${pathname}?${newQuery}`)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [search, router, pathname]) // Removed searchParams to prevent loop

    // Handle search input change
    const handleSearch = (term: string) => {
        setSearch(term)
    }

    // Apply filters directly
    const applyFilter = (name: string, value: string) => {
        const params = new URLSearchParams(window.location.search)
        if (value && value !== 'all') {
            params.set(name, value)
        } else {
            params.delete(name)
        }
        // When filtering, we might want to preserve search or not. 
        // Current implementation is relying on URL state + local state sync.
        // It's safer to read current URL params.

        router.push(`${pathname}?${params.toString()}`)
    }

    // Clear all filters
    const clearFilters = () => {
        setSearch('')
        setDepartment('all')
        setDesignation('all')
        setStatus('all')
        setEmploymentType('all')
        router.push(pathname)
    }

    // Handle Export
    const handleExport = () => {
        try {
            // Prepare data for export
            const exportData = employeesData.map(emp => ({
                EmployeeID: emp.employee_id,
                FirstName: emp.first_name,
                LastName: emp.last_name,
                Email: emp.email,
                Phone: emp.phone,
                Department: emp.department?.name || 'N/A',
                Designation: emp.designation?.name || 'N/A',
                Status: emp.status,
                EmploymentType: emp.employment_type,
                JoiningDate: emp.joining_date,
                Manager: emp.manager ? `${emp.manager.first_name} ${emp.manager.last_name}` : 'N/A'
            }))

            exportToCSV(exportData, `employees_export_${new Date().toISOString().split('T')[0]}`)
            toast.success('Employees exported successfully')
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Failed to export employees')
        }
    }

    return (
        <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, or ID..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>

                {/* Filters Group 1 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-1">
                    <Select value={department} onValueChange={(val) => { setDepartment(val); applyFilter('department', val) }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={designation} onValueChange={(val) => { setDesignation(val); applyFilter('designation', val) }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Designation" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Designations</SelectItem>
                            {designations.map((desig) => (
                                <SelectItem key={desig.id} value={desig.id}>
                                    {desig.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 flex-1 md:flex-none md:w-auto">
                    <Select value={status} onValueChange={(val) => { setStatus(val); applyFilter('status', val) }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                            <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                            <SelectItem value="RESIGNED">Resigned</SelectItem>
                            <SelectItem value="TERMINATED">Terminated</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={employmentType} onValueChange={(val) => { setEmploymentType(val); applyFilter('type', val) }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="FULL_TIME">Full Time</SelectItem>
                            <SelectItem value="PART_TIME">Part Time</SelectItem>
                            <SelectItem value="CONTRACT">Contract</SelectItem>
                            <SelectItem value="INTERN">Intern</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={clearFilters} className="w-full">
                        <X className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                </div>

                <Button variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                </Button>
            </div>
        </div>
    )
}
