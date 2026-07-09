import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    const { hostId, clientName, clientEmail, startTime, endTime, type } = await req.json()

    if (!hostId || !clientName || !clientEmail || !startTime || !endTime || !type) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const booking = await prisma.booking.create({
        data: {
            hostId,
            clientName,
            clientEmail,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            type,
            status: 'pending',
        },
    })

    return Response.json({ booking })
}