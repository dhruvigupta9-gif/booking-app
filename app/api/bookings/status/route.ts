import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    const { userId } = await auth()

    if (!userId) {
        return Response.json({ error: 'Not logged in' }, { status: 401 })
    }

    const { bookingId, status } = await req.json()

    if (!bookingId || !status) {
        return Response.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (!['approved', 'rejected'].includes(status)) {
        return Response.json({ error: 'Invalid status' }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
    })

    if (!booking) {
        return Response.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.hostId !== userId) {
        return Response.json({ error: 'Not authorized' }, { status: 403 })
    }

    const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { status },
    })

    return Response.json({ booking: updated })
}