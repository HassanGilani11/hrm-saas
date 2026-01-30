import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Mail, Phone, Calendar, MapPin, Users, Briefcase, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface EmployeeDetailPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EmployeeDetailPage(props: EmployeeDetailPageProps) {
    const params = await props.params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect('/login')
    }

    // Get user's organization
    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single() as any

    if (!userData) {
        redirect('/login')
    }

    const organizationId = userData.organization_id

    // Fetch employee with all related data
    const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select(`
            *,
            department:department_id(id, name),
            designation:designation_id(id, name),
            manager:manager_id(id, first_name, last_name, employee_id)
        `)
        .eq('id', params.id)
        .eq('organization_id', organizationId)
        .single() as any

    if (employeeError || !employee) {
        redirect('/employees')
    }

    // Check if user can edit/delete
    const canEdit = ['SUPER_ADMIN', 'HR_ADMIN'].includes(userData.role)
    const canDelete = userData.role === 'SUPER_ADMIN'

    // Format date helper
    const formatDate = (date: string | null) => {
        if (!date) return 'N/A'
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    // Status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800'
            case 'INACTIVE': return 'bg-gray-100 text-gray-800'
            case 'ON_LEAVE': return 'bg-yellow-100 text-yellow-800'
            case 'RESIGNED': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-6">
                <Link href="/employees">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Employees
                    </Button>
                </Link>

                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-6">
                        {/* Profile Image */}
                        <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted">
                            {employee.profile_image_url ? (
                                <Image
                                    src={employee.profile_image_url}
                                    alt={`${employee.first_name} ${employee.last_name}`}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-semibold">
                                    {employee.first_name[0]}{employee.last_name[0]}
                                </div>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {employee.first_name} {employee.last_name}
                            </h1>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <span>{employee.employee_id}</span>
                                <span>•</span>
                                <span>{employee.designation?.name}</span>
                                <span>•</span>
                                <Badge className={getStatusColor(employee.status)}>
                                    {employee.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {canEdit && (
                            <Link href={`/employees/${employee.id}/edit`}>
                                <Button>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                        {canDelete && (
                            <Button variant="destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{employee.email}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{employee.phone}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Date of Birth</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{formatDate(employee.date_of_birth)}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Gender</p>
                                <p className="font-medium mt-1">{employee.gender}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Blood Group</p>
                                <p className="font-medium mt-1">{employee.blood_group || 'N/A'}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Marital Status</p>
                                <p className="font-medium mt-1">{employee.marital_status}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Employment Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Employment Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Department</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{employee.department?.name}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Designation</p>
                                <p className="font-medium mt-1">{employee.designation?.name}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Employment Type</p>
                                <p className="font-medium mt-1">{employee.employment_type}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Reporting Manager</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">
                                        {employee.manager
                                            ? `${employee.manager.first_name} ${employee.manager.last_name}`
                                            : 'N/A'
                                        }
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Joining Date</p>
                                <p className="font-medium mt-1">{formatDate(employee.joining_date)}</p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Confirmation Date</p>
                                <p className="font-medium mt-1">{formatDate(employee.confirmation_date)}</p>
                            </div>

                            {employee.resignation_date && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Resignation Date</p>
                                    <p className="font-medium mt-1">{formatDate(employee.resignation_date)}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Address Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Address Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Current Address</p>
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                    <p className="font-medium">
                                        {(() => {
                                            const addr = employee.current_address
                                            if (!addr) return 'Not provided'
                                            if (typeof addr === 'string') return addr
                                            if (typeof addr === 'object' && 'full' in addr) return (addr as any).full
                                            return JSON.stringify(addr)
                                        })()}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Permanent Address</p>
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                    <p className="font-medium">
                                        {(() => {
                                            const addr = employee.permanent_address
                                            if (!addr) return 'Not provided'
                                            if (typeof addr === 'string') return addr
                                            if (typeof addr === 'object' && 'full' in addr) return (addr as any).full
                                            return JSON.stringify(addr)
                                        })()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Emergency Contacts */}
                    {employee.emergency_contacts && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Emergency Contacts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {(() => {
                                    let contacts: any[] = []
                                    if (Array.isArray(employee.emergency_contacts)) {
                                        contacts = employee.emergency_contacts
                                    } else if (typeof employee.emergency_contacts === 'string') {
                                        try { contacts = JSON.parse(employee.emergency_contacts) } catch { }
                                    }

                                    if (contacts.length === 0) return <p className="text-muted-foreground">No emergency contacts</p>

                                    return (
                                        <div className="space-y-4">
                                            {contacts.map((contact, i) => (
                                                <div key={i} className="grid gap-1 border-b last:border-0 pb-3 last:pb-0">
                                                    <p className="font-medium">{contact.name} <span className="text-muted-foreground text-sm">({contact.relationship})</span></p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                        <Phone className="h-3 w-3" />
                                                        {contact.phone}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                })()}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Stats & Quick Info */}
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge className={`${getStatusColor(employee.status)} mt-1`}>
                                    {employee.status}
                                </Badge>
                            </div>

                            <Separator />

                            <div>
                                <p className="text-sm text-muted-foreground">Tenure</p>
                                <p className="font-medium mt-1">
                                    {Math.floor(
                                        (new Date().getTime() - new Date(employee.joining_date).getTime())
                                        / (1000 * 60 * 60 * 24 * 365)
                                    )} years
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Leave Balance - Placeholder */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Leave Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Leave balance information will be displayed here
                            </p>
                        </CardContent>
                    </Card>

                    {/* Recent Activity - Placeholder */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                No recent activity
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
