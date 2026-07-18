import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createCalendarEvent } from '@/lib/calendar'
import { sendBookingStatusUpdate } from '@/lib/email'

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
        include: { host: true },
    })

    if (!booking) {
        return Response.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.hostId !== userId) {
        return Response.json({ error: 'Not authorized' }, { status: 403 })
    }

    const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { approvalStatus: status },
    })

    // Write to Google Calendar only when approving a personal booking.
    // Work bookings get written to the calendar from the Stripe webhook
    // instead, since they also require payment before being confirmed.
    if (status === 'approved' && booking.type === 'personal') {
        try {
            await createCalendarEvent(booking.hostId, {
                clientName: booking.clientName,
                clientEmail: booking.clientEmail,
                startTime: booking.startTime,
                endTime: booking.endTime,
                type: booking.type,
            })
        } catch (err) {
            console.log('Failed to create calendar event:', err)
            // Don't fail the whole request just because the calendar write
            // failed — the booking is still approved in your DB either way.
        }
    }

    const date = new Date(booking.startTime).toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })

    const time = new Date(booking.startTime).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true
    })

    try {
        await sendBookingStatusUpdate(
            booking.clientEmail,
            booking.clientName,
            booking.host.name || booking.host.email,
            status,
            date,
            time
        )
    } catch (err) {
        console.log('Email sending failed:', err)
    }

    return Response.json({ booking: updated })
}