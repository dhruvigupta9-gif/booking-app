import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    const { userId } = await auth()
    if (!userId) {
        return Response.json({ error: 'Not logged in' }, { status: 401 })
    }

    const { hourlyRate } = await req.json()

    if (typeof hourlyRate !== 'number' || hourlyRate <= 0) {
        return Response.json({ error: 'Invalid rate' }, { status: 400 })
    }

    const user = await prisma.user.update({
        where: { id: userId },
        data: { hourlyRate },
    })

    return Response.json({ user })
}