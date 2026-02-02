
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

/*
// Debugging check:
type RealTable = Database['public']['Tables']['attendances']
type RealInsert = RealTable['Insert']
const r: RealInsert = { 
    organization_id: '123', 
    employee_id: '123', 
    date: '2025-01-01', 
    status: 'PRESENT' 
}
*/

const supabaseReal = createClient<Database>('', '')

async function testReal() {
    // Logic from actions.ts
    // If this works, HEADERS POP!
    await supabaseReal.from('attendances').insert({
        organization_id: '123',
        employee_id: '123',
        date: '2025-01-01',
        status: 'PRESENT'
    })

    // Check getting user
    const { data: user } = await supabaseReal.from('employees').select('organization_id').single()
    if (user) {
        console.log(user.organization_id)
    }
}
