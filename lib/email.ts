import { Resend } from 'resend'
import { Booking, User } from '@prisma/client'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBookingConfirmationToClient(
    booking: Booking,
    host: User
) {
    const hostName = host.username || host.name || 'Host'
    const date = new Date(booking.startTime).toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        timeZone: 'Asia/Kolkata',
    })
    const time = new Date(booking.startTime).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true,
        timeZone: 'Asia/Kolkata',
    })

    await resend.emails.send({
        from: 'Schedulr <onboarding@resend.dev>',
        to: booking.clientEmail,
        subject: `Your booking with ${hostName} is received`,
        html: `
        <h2>Booking received!</h2>
        <p>Hi ${booking.clientName}</p>
        <p> Your booking request with <strong>${hostName}</strong> has been received.</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p>We will notify you once it is confirmed.</p>
        <p>Thanks for using Schedulr</p>
        `,
    })
}

export async function sendBookingNotificationToHost(
    booking: Booking,
    host: User
) {
    const hostName = host.username || host.name || 'Host'
    const date = new Date(booking.startTime).toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        timeZone: 'Asia/Kolkata',
    })
    const time = new Date(booking.startTime).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true,
        timeZone: 'Asia/Kolkata',
    })

    await resend.emails.send({
        from: 'Schedulr <onboarding@resend.dev>',
        to: host.email,
        subject: `New booking request from ${booking.clientName}`,
        html: `
        <h2>New Booking Request</h2>
        <p>Hi ${hostName}</p>
        <p> You have received a new booking request from <strong>${booking.clientName}</strong></p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Type:</strong> ${booking.type}</p>
        <p>Log in to your Schedulr dashboard to approve or reject this booking.</p>
        `,
    })
}

export async function sendBookingStatusUpdate(
    clientEmail: string,
    clientName: string,
    hostName: string,
    status: string,
    date: string,
    time: string
) {
    await resend.emails.send({
        from: "Schedulr <onboarding@resend.dev>",
        to: clientEmail,
        subject: `Booking ${status}`,
        html: `
        <h2>Booking ${status === 'approved' ? 'Approved' : 'Rejected'}</h2>
        <p>Hi ${clientName}</p>
        <p>Your booking with <strong>${hostName}</strong> has been ${status}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        ${status === 'approved' ? '<p>See you then</p>' : '<p>Feel free to book another slot.</p>'}
        <p>Thanks for using Schedulr</p>
        `,
    })
}

// Tells the client whether their refund succeeded or is stuck/failed,
// so they aren't left wondering what's happening with their money.
export async function sendRefundStatusUpdate(
    clientEmail: string,
    clientName: string,
    hostName: string,
    refundSucceeded: boolean
) {
    await resend.emails.send({
        from: 'Schedulr <onboarding@resend.dev>',
        to: clientEmail,
        subject: refundSucceeded ? 'Your refund has been processed' : 'Refund delayed for your booking',
        html: refundSucceeded
            ? `
            <h2>Refund Processed</h2>
            <p>Hi ${clientName}</p>
            <p>Your booking with <strong>${hostName}</strong> was declined, and your payment has been refunded.</p>
            <p>The refunded amount should reflect in your account within a few business days, depending on your bank.</p>
            <p>Thanks for using Schedulr</p>
            `
            : `
            <h2>Refund Delayed</h2>
            <p>Hi ${clientName}</p>
            <p>Your booking with <strong>${hostName}</strong> was declined. We attempted to process your refund automatically, but it did not go through immediately.</p>
            <p>Our team has been notified and will process your refund manually. We apologize for the delay — you do not need to take any action right now.</p>
            <p>Thanks for your patience.</p>
            `,
    })
}