import { auth } from '@clerk/nextjs/server'
import { getFreeBusySlots } from '@/lib/calendar'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')
    const date = url.searchParams.get('date')
    const durationParam = url.searchParams.get('duration')

    if (!userId || !date) {
        return Response.json({ error: 'Missing userId or date' }, { status: 400 })
    }

    const allowedDurations = [15, 30, 45, 60]
    const duration = allowedDurations.includes(Number(durationParam)) ? Number(durationParam) : 60

    const user = await prisma.user.findUnique({
        where: { id: userId },
    })

    if (!user) {
        return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const slots = await getFreeBusySlots(userId, date, duration)

    return Response.json({ slots })
}