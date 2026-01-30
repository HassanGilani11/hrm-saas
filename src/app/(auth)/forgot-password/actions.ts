'use server'

import { createClient } from '@/lib/supabase/server'
// import { headers } from 'next/headers'

export async function forgotPasswordAction(formData: FormData) {
    const email = formData.get('email') as string
    const supabase = await createClient()

    // Dynamically determining the origin might be flaky in some envs, 
    // but typically headers().get('origin') works. 
    // For now, using a relative path which Supabase resolves against the Site URL 
    // or hardcoding if needed. 
    // Ideally user has configured Site URL in Supabase.

    // Using a relative path for redirect to typical Next.js auth callback
    // The callback route should handle the token details.
    // Or pointing directly to the update password page if using hash fragment flow (PKCE default).

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`,
    })

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}
