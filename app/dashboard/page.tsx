import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import UsernameForm from './UsernameForm'

export default async function DashboardPage() {
    const { userId } = await auth()

    if (!userId) {
        redirect('/sign-in')
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    })

    return (
        <main className="min-h-screen p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Schedulr Dashboard</h1>
                <UserButton />
            </div>

            <div className="grid grid-cols-1 gap-4 max-w-2xl">

                <div className="border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-2">Your Booking Link</h2>
                    {user?.username ? (
                        <div>
                            <p className="text-gray-500 mb-2">Share this link with clients:</p>
                            <div className="bg-gray-100 rounded p-3 font-mono text-sm">
                                http://localhost:3000/book/{user.username}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="text-gray-500 mb-4">Set a username to get your public booking link.</p>
                            <UsernameForm />
                        </div>
                    )}
                </div>

                <div className="border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-2">Google Calendar</h2>
                    {user?.googleAccessToken ? (
                        <p className="text-green-600">✅ Google Calendar connected</p>
                    ) : (
                        <div>
                            <p className="text-gray-500 mb-4">Connect your Google Calendar to show free slots.</p>
                            <Link
                                href="/api/auth/google"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Connect Google Calendar
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </main>
    )
}