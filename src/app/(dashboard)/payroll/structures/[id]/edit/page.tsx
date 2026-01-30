import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditStructureForm from './edit-form'

export default async function EditStructurePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: structure } = await supabase
        .from('salary_structures')
        .select('*')
        .eq('id', id)
        .single()

    if (!structure) notFound()

    return <EditStructureForm structure={structure} />
}
