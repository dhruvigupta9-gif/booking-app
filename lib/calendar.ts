import { google } from 'googleapis'
import { prisma } from './prisma'

export async function getFreeBusySlots(userId: string, date: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    })

    if (!user?.googleAccessToken)
        throw new Error('Google Calendar not connected')

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID!,
        process.env.GOOGLE_CLIENT_SECRET!,
        'http://localhost:3000/api/auth/google/callback'
    )

    oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken,
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const freeBusyResponse = await calendar.freebusy.query({
        requestBody: {
            timeMin: startOfDay.toISOString(),
            timeMax: endOfDay.toISOString(),
            items: [{ id: 'primary' }],
        },
    })

    const busySlots = freeBusyResponse.data.calendars?.primary?.busy ?? []

    const allSlots = generateTimeSlots(date)

    const freeSlots = allSlots.filter(slot => {
        return !busySlots.some(busy => {
            const slotStart = new Date(slot.start).getTime()
            const slotEnd = new Date(slot.end).getTime()
            const busyStart = new Date(busy.start!).getTime()
            const busyEnd = new Date(busy.end!).getTime()
            return slotStart < busyEnd && slotEnd > busyStart
        })
    })

    return freeSlots
}

function generateTimeSlots(date: string) {
    const slots = []
    const start = new Date(date)
    start.setHours(9, 0, 0, 0)

    const end = new Date(date)
    end.setHours(17, 0, 0, 0)

    const current = new Date(start)

    while (current < end) {
        const slotStart = new Date(current)
        const slotEnd = new Date(current)
        slotEnd.setMinutes(slotEnd.getMinutes() + 60)

        slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            label: slotStart.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            }),
        })
        current.setMinutes(current.getMinutes() + 60)
    }

    return slots
}