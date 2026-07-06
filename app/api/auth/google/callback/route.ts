import { google } from 'googleapis'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    'http://localhost:3000/api/auth/google/callback'
)

export async function GET(req: Request) {
    const { userId } = await auth()

    if (!userId) {
        return redirect('/sign-in')
    }

    const url = new URL(req.url)
    const code = url.searchParams.get('code')

    if (!code) {
        return redirect('/dashboard?error=no_code')
    }

    const { tokens } = await oauth2Client.getToken(code)

    await prisma.user.update({
        where: { id: userId },
        data: {
            googleAccessToken: tokens.access_token ?? null,
            googleRefreshToken: tokens.refresh_token ?? null,
        },
    })

    return redirect('/dashboard?success=calendar_connected')
}