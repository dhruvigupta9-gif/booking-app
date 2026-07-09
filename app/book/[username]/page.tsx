import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import BookingForm from './BookingForm'

interface Props {
    params: Promise<{ username: string }>
}

export default async function BookingPage({ params }: Props) {
    const { username } = await params

    const host = await prisma.user.findUnique({
        where: { username },
    })

    if (!host) notFound()

    if (!host.googleAccessToken) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2x1 font-bold mb-2">{host.name || host.email}</h1>
                    <p className="text-gray-500">This user has not connected their google calendar yet</p>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen p-8 max-w-2xl mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2">
                    Book a session with {host.name || host.username}
                </h1>
                <p className="text-gray-500">Pick a date and time that works for you</p>
            </div>
            <BookingForm hostId={host.id} hostName={host.name || host.username || ''} />
        </main>
    )
}