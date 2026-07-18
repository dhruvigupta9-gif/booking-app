import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    const { userId } = await auth()

    if (!userId) {
        return Response.json({ error: 'Not logged in' }, { status: 401 })
    }

    const { workStartHour, workEndHour } = await req.json()

    if (
        typeof workStartHour !== 'number' ||
        typeof workEndHour !== 'number' ||
        workStartHour < 9 || workStartHour > 15 ||
        workEndHour < 16 || workEndHour > 21
    ) {
        return Response.json({ error: 'Invalid hours' }, { status: 400 })
    }

    if (workEndHour <= workStartHour) {
        return Response.json({ error: 'End hour must be after start hour' }, { status: 400 })
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { workStartHour, workEndHour },
    })

    return Response.json({ user: updated })
}