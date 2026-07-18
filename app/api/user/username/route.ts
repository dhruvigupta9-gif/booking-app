import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    const { userId } = await auth()
    if (!userId) return Response.json({ error: 'Not logged in' }, { status: 401 })
    const { username } = await req.json()

    if (!username || username.length < 3) return Response.json({ error: 'Username must be at least 3 characters' }, { status: 400 })
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return Response.json({ error: 'Username can only contain letters, numbers, and underscores' }, { status: 400 })

    const existing = await prisma.user.findUnique({
        where: { username },
    })
    if (existing) {
        return Response.json({ error: 'Username already taken' }, { status: 400 })
    }

    await prisma.user.upsert({
        where: { id: userId },
        update: { username },
        create: {
            id: userId,
            email: "",
            username,
        },
    });

    return Response.json({ success: true })
}