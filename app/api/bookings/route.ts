import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { sendBookingConfirmationToClient, sendBookingNotificationToHost } from '@/lib/email'

export async function POST(req: Request) {
    const { hostId, clientName, clientEmail, startTime, duration, type } = await req.json()

    if (!hostId || !clientName || !clientEmail || !startTime || !duration || !type) {
        return Response.json({ error: 'Missing fields' }, { status: 400 })
    }

    const allowedDurations = [15, 30, 45, 60]
    if (!allowedDurations.includes(Number(duration))) {
        return Response.json({ error: 'Invalid duration' }, { status: 400 })
    }

    const host = await prisma.user.findUnique({ where: { id: hostId } })
    if (!host) {
        return Response.json({ error: 'Host not found' }, { status: 404 })
    }

    const start = new Date(startTime)
    const end = new Date(start)
    end.setMinutes(end.getMinutes() + Number(duration))

    // ---- PERSONAL: create immediately, no payment ----
    if (type === 'personal') {
        const booking = await prisma.booking.create({
            data: {
                hostId, clientName, clientEmail,
                startTime: start,
                endTime: end,
                type,
                approvalStatus: 'pending',
                paymentStatus: 'n/a',
            },
        })

        await sendBookingConfirmationToClient(booking, host)
        await sendBookingNotificationToHost(booking, host)

        return Response.json({ booking })
    }

    // ---- WORK: needs payment before it's confirmed ----
    if (type === 'work') {
        if (!host.hourlyRate) {
            return Response.json({ error: 'This host has not set an hourly rate yet' }, { status: 400 })
        }

        // Price is proportional to duration, e.g. a 30-min session costs
        // half the hourly rate.
        const amount = Math.round(host.hourlyRate * (Number(duration) / 60) * 100) // cents

        const booking = await prisma.booking.create({
            data: {
                hostId, clientName, clientEmail,
                startTime: start,
                endTime: end,
                type,
                approvalStatus: 'pending',
                paymentStatus: 'unpaid',
                amount,
            },
        })

        const origin = new URL(req.url).origin

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: { name: `${duration}-min session with ${host.name || host.username}` },
                    unit_amount: amount,
                },
                quantity: 1,
            }],
            customer_email: clientEmail,
            metadata: { bookingId: booking.id },
            success_url: `${origin}/book/${host.username}?paid=true`,
            cancel_url: `${origin}/book/${host.username}?paid=false`,
        })

        await prisma.booking.update({
            where: { id: booking.id },
            data: { stripeSessionId: session.id },
        })

        return Response.json({ checkoutUrl: session.url })
    }

    return Response.json({ error: 'Invalid booking type' }, { status: 400 })
}