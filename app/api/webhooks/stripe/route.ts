import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createCalendarEvent } from '@/lib/calendar'
import { sendBookingStatusUpdate, sendRefundStatusUpdate } from '@/lib/email'
import { stripe } from '@/lib/stripe'

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

    const hostName = booking.host.username || booking.host.name || booking.host.email

    // Write to Google Calendar when a booking gets approved:
    // - Personal bookings never need payment, so create the event right away.
    // - Work bookings need BOTH payment and approval. Since payment usually
    //   happens before the host reviews the request, the Stripe webhook's
    //   "approved already" check rarely fires — so we also create the event
    //   here if payment is already done by the time of approval.
    if (status === 'approved' && !booking.calendarEventId) {
        const shouldCreateEvent =
            booking.type === 'personal' ||
            (booking.type === 'work' && booking.paymentStatus === 'paid')

        if (shouldCreateEvent) {
            try {
                const eventId = await createCalendarEvent(booking.hostId, {
                    clientName: booking.clientName,
                    clientEmail: booking.clientEmail,
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                    type: booking.type,
                })
                await prisma.booking.update({
                    where: { id: bookingId },
                    data: { calendarEventId: eventId ?? undefined },
                })
            } catch (err) {
                console.log('Failed to create calendar event:', err)
                // Don't fail the whole request just because the calendar write
                // failed — the booking is still approved in your DB either way.
            }
        }
    }

    // Refund the client automatically if a paid "work" booking gets rejected.
    // Without this, the client's money would stay charged even though the
    // host declined the session. We also email the client either way, so
    // they know the refund succeeded or that it's being handled manually.
    if (status === 'rejected' && booking.type === 'work' && booking.paymentStatus === 'paid') {
        let refundSucceeded = false

        try {
            if (!booking.stripeSessionId) {
                throw new Error('No Stripe session id on this booking, cannot refund')
            }

            const session = await stripe.checkout.sessions.retrieve(booking.stripeSessionId)
            const paymentIntentId = session.payment_intent as string

            if (!paymentIntentId) {
                throw new Error('No payment_intent found on Stripe session')
            }

            await stripe.refunds.create({
                payment_intent: paymentIntentId,
            })

            await prisma.booking.update({
                where: { id: bookingId },
                data: { paymentStatus: 'refunded' },
            })

            refundSucceeded = true
        } catch (err) {
            console.log('Refund failed:', err)
            // This failure needs to be visible somewhere (logs/alerting) so
            // a human can issue the refund manually if it doesn't happen
            // automatically. The client is still told via email below.
        }

        try {
            await sendRefundStatusUpdate(
                booking.clientEmail,
                booking.clientName,
                hostName,
                refundSucceeded
            )
        } catch (err) {
            console.log('Refund status email failed to send:', err)
        }
    }

    const date = new Date(booking.startTime).toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        timeZone: 'Asia/Kolkata',
    })

    const time = new Date(booking.startTime).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true,
        timeZone: 'Asia/Kolkata',
    })

    try {
        await sendBookingStatusUpdate(
            booking.clientEmail,
            booking.clientName,
            hostName,
            status,
            date,
            time
        )
    } catch (err) {
        console.log('Email sending failed:', err)
    }

    return Response.json({ booking: updated })
}