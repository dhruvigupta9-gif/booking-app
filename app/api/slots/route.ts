import { auth } from '@clerk/nextjs/server'
import { getFreeBusySlots } from '@/lib/calendar'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')
    const date = url.searchParams.get('date')

    if (!userId || !date) {
        return Response.json({ error: 'Missing userId or date' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    })

    if (!user) {
        return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const slots = await getFreeBusySlots(userId, date)

    return Response.json({ slots })
}