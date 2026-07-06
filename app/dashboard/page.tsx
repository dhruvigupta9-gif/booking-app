import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
    const { userId } = await auth()

    if (!userId) {
        redirect('/sign-in')
    }

    return (
        <main className="min-h-screen p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Schedulr Dashboard</h1>
                <UserButton />
            </div>

            <div className="grid grid-cols-1 gap-4 max-w-2xl">
                <div className="border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-2">Google Calendar</h2>
                    <p className="text-gray-500 mb-4">
                        Connect your Google Calendar so Schedulr can read your free and busy slots.
                    </p>
                    <Link
                        href="/api/auth/google"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Connect Google Calendar
                    </Link>
                </div>
            </div>
        </main>
    )
}