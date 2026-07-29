'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
    intervalSeconds?: number
}

export default function AutoRefresh({ intervalSeconds = 10 }: Props) {
    const router = useRouter()

    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh()
        }, intervalSeconds * 1000)


        function handleVisibility() {
            if (document.visibilityState === 'visible') {
                router.refresh()
            }
        }
        document.addEventListener('visibilitychange', handleVisibility)

        return () => {
            clearInterval(interval)
            document.removeEventListener('visibilitychange', handleVisibility)
        }
    }, [router, intervalSeconds])

    return null
}