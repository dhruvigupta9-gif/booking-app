import { google } from 'googleapis'
import { prisma } from './prisma'

const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'

async function getAuthorizedClient(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user?.googleAccessToken || !user?.googleRefreshToken) {
        throw new Error('Google Calendar not connected')
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID!,
        process.env.GOOGLE_CLIENT_SECRET!,
        REDIRECT_URI
    )

    oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken,
    })

    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.access_token) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    googleAccessToken: tokens.access_token,
                    ...(tokens.refresh_token ? { googleRefreshToken: tokens.refresh_token } : {}),
                },
            })
        }
    })

    return oauth2Client
}

export async function getFreeBusySlots(userId: string, date: string, durationMinutes: number = 60) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    const oauth2Client = await getAuthorizedClient(userId)
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    let busySlots: { start?: string | null; end?: string | null }[] = []

    try {
        const freeBusyResponse = await calendar.freebusy.query({
            requestBody: {
                timeMin: startOfDay.toISOString(),
                timeMax: endOfDay.toISOString(),
                items: [{ id: 'primary' }],
            },
        })
        busySlots = freeBusyResponse.data.calendars?.primary?.busy ?? []
    } catch (err: any) {
        if (err?.code === 401 || err?.response?.status === 401) {
            throw new Error('Google Calendar access expired — please reconnect your calendar')
        }
        throw err
    }

    const workStartHour = user.workStartHour ?? 9
    const workEndHour = user.workEndHour ?? 17

    const allSlots = generateTimeSlots(date, workStartHour, workEndHour, durationMinutes)

    const now = new Date()

    const freeSlots = allSlots.filter(slot => {
        const slotStart = new Date(slot.start)
        const slotEnd = new Date(slot.end)

        if (slotStart.getTime() <= now.getTime()) return false

        const overlapsBusy = busySlots.some(busy => {
            if (!busy.start || !busy.end) return false
            const busyStart = new Date(busy.start).getTime()
            const busyEnd = new Date(busy.end).getTime()
            return slotStart.getTime() < busyEnd && slotEnd.getTime() > busyStart
        })

        return !overlapsBusy
    })

    return freeSlots
}

export async function createCalendarEvent(
    userId: string,
    booking: { clientName: string; clientEmail: string; startTime: Date; endTime: Date; type: string }
) {
    const oauth2Client = await getAuthorizedClient(userId)
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const event = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
            summary: `${booking.type === 'work' ? 'Work' : 'Personal'} session with ${booking.clientName}`,
            description: `Booked via Schedulr. Client email: ${booking.clientEmail}`,
            start: { dateTime: booking.startTime.toISOString() },
            end: { dateTime: booking.endTime.toISOString() },
            attendees: [{ email: booking.clientEmail }],
        },
    })

    return event.data.id
}

// Generates candidate start times stepped by `durationMinutes`, each slot
// lasting exactly `durationMinutes` long, within the host's working hours.
function generateTimeSlots(date: string, workStartHour: number, workEndHour: number, durationMinutes: number) {
    const slots = []
    const start = new Date(date)
    start.setHours(workStartHour, 0, 0, 0)

    const end = new Date(date)
    end.setHours(workEndHour, 0, 0, 0)

    const current = new Date(start)

    while (current.getTime() + durationMinutes * 60000 <= end.getTime()) {
        const slotStart = new Date(current)
        const slotEnd = new Date(current)
        slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes)

        slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            label: slotStart.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            }),
        })
        current.setMinutes(current.getMinutes() + durationMinutes)
    }

    return slots
}