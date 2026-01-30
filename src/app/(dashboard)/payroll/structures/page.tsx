import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SalaryStructuresList } from '@/components/payroll/salary-structures-list'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function SalaryStructuresPage() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) redirect('/login')

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (!userData || !['HR_ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
        return <div>Access Denied</div>
    }

    const { data: structures } = await supabase
        .from('salary_structures')
        .select('*')
        .eq('organization_id', userData.organization_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Salary Structures</h2>
                    <p className="text-muted-foreground">
                        Define salary templates with earnings and deductions.
                    </p>
                </div>
                <Link href="/payroll/structures/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Structure
                    </Button>
                </Link>
            </div>

            <SalaryStructuresList structures={structures || []} />
        </div>
    )
}
