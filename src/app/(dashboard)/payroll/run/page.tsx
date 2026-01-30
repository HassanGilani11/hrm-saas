import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PayrollRunFlow } from '@/components/payroll/payroll-run-flow'

export default async function PayrollRunPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (!userData || !['HR_ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
        return <div>Access Denied</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Run Monthly Payroll</h2>
                <p className="text-muted-foreground">
                    Generate and review monthly salary records for your organization.
                </p>
            </div>

            <PayrollRunFlow />
        </div>
    )
}
