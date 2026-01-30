
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Manually parse .env.local
const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=')
    if (key && value) {
        env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '')
    }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

const SYNTEX_ID = '6369108c-91c3-41d4-9a2d-a3292c199450'
const PLACEHOLDER_ID = '00000000-0000-0000-0000-000000000001'

async function checkData() {
    console.log('--- Supabase Diagnostic ---')

    // Check Organizations
    const { data: orgs, error: orgError } = await supabase.from('organizations').select('*')
    console.log('Organizations:', orgError ? ('Error: ' + orgError.message) : (orgs?.length + ' found'))
    if (orgs) orgs.forEach(o => console.log(`  - ${o.name} (${o.id}) slug: ${o.slug}`))

    const tables = [
        'users',
        'employees',
        'departments',
        'designations',
        'salary_structures',
        'employee_salary_settings'
    ]

    for (const table of tables) {
        process.stdout.write(`Checking ${table}... `)

        // Try to fetch counts for known IDs
        const { count: syntexCount } = await supabase.from(table).select('*', { count: 'exact', head: true }).eq('organization_id', SYNTEX_ID)
        const { count: placeholderCount } = await supabase.from(table).select('*', { count: 'exact', head: true }).eq('organization_id', PLACEHOLDER_ID)
        const { count: totalCount } = await supabase.from(table).select('*', { count: 'exact', head: true })

        console.log(`Total: ${totalCount || 0} | Syntex: ${syntexCount || 0} | Placeholder: ${placeholderCount || 0}`)

        if (table === 'users' && totalCount && totalCount > 0) {
            const { data: users } = await supabase.from('users').select('id, email, organization_id, role')
            users?.forEach(u => console.log(`  User: ${u.email} | Org: ${u.organization_id} | Role: ${u.role}`))
        }
    }
}

checkData()
