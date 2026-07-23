import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import UsernameForm from './UsernameForm'
import BookingsList from './BookingsList'
import HourlyRateForm from './HourlyRateForm'
import WorkingHoursForm from './WorkingHoursForm'

export default async function DashboardPage() {
    const { userId } = await auth()

    if (!userId) {
        redirect('/sign-in')
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    })

    const bookings = await prisma.booking.findMany({
        where: { hostId: userId },
        orderBy: { createdAt: 'desc' },
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
                    {!user?.username && (
                        <p className="text-gray-500 mb-4">Set a username to get your public booking link.</p>
                    )}
                    <UsernameForm currentUsername={user?.username ?? null} />
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

                <WorkingHoursForm
                    initialStartHour={user?.workStartHour ?? 9}
                    initialEndHour={user?.workEndHour ?? 17}
                />

                <div className="border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-2">Hourly Rate</h2>
                    <p className="text-gray-500 mb-4">
                        Set your rate to accept paid &quot;work&quot; bookings. Clients pay this before a work
                        booking is created.
                    </p>
                    {user?.hourlyRate ? (
                        <div className="flex items-center justify-between">
                            <p className="text-green-600 font-semibold">
                                ✅ ₹{user.hourlyRate.toFixed(2)} / hour
                            </p>
                        </div>
                    ) : (
                        <p className="text-yellow-600 mb-2">⚠️ Not set — work bookings are disabled until you set a rate.</p>
                    )}
                    <HourlyRateForm currentRate={user?.hourlyRate ?? null} />
                </div>

                <div className="border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Your Bookings</h2>
                    <BookingsList bookings={bookings} />
                </div>

            </div>
        </main>
    )
}