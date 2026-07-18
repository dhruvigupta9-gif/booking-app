import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createCalendarEvent } from '@/lib/calendar'
import { sendBookingConfirmationToClient, sendBookingNotificationToHost } from '@/lib/email'

export async function POST(req: Request) {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
        return new Response('Missing signature', { status: 400 })
    }

    let event
    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err) {
        console.log('STRIPE WEBHOOK VERIFICATION ERROR:', err)
        return new Response('Invalid signature', { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as { metadata?: { bookingId?: string } }
        const bookingId = session.metadata?.bookingId

        if (bookingId) {
            const booking = await prisma.booking.update({
                where: { id: bookingId },
                data: { paymentStatus: 'paid' },
            })

            // Work bookings need BOTH payment AND approval before hitting the
            // calendar. Only create the event here if the host has already
            // approved it — otherwise the approval route will pick it up later.
            if (booking.approvalStatus === 'approved' && !booking.calendarEventId) {
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
                }
            }

            const host = await prisma.user.findUnique({ where: { id: booking.hostId } })
            if (host) {
                await sendBookingConfirmationToClient(booking, host)
                await sendBookingNotificationToHost(booking, host)
            }
        }
    }

    return new Response('Webhook received', { status: 200 })
}