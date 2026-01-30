import { getProfileAction } from '@/app/(dashboard)/profile/actions'
import { ProfileForm } from '@/components/profile/profile-form'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
    const employee = await getProfileAction()

    if (!employee) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                    <h3 className="mb-2 font-medium">Profile Not Found</h3>
                    <p className="text-sm">
                        Could not find user data. This usually happens if the account setup trigger didn't run.
                    </p>
                    <div className="mt-4 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">Troubleshooting steps:</p>
                        <ol className="list-decimal pl-5 mt-2 space-y-1">
                            <li>Ensure you have run <code className="bg-muted px-1 rounded">database/migrations/setup_auth_trigger.sql</code> in your Supabase SQL Editor.</li>
                            <li>Try signing up with a <strong>new account</strong> after running the migration.</li>
                        </ol>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">My Profile</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your personal information and view your employment details.
                </p>
            </div>
            <div className="p-6 border rounded-lg bg-card bg-white shadow-sm">
                <ProfileForm initialData={employee} />
            </div>
        </div>
    )
}
