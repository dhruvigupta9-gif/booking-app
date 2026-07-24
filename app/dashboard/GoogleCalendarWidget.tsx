import { getUpcomingEvents } from '@/lib/calendar'

interface Props {
    userId: string
    isConnected: boolean
}

export default async function GoogleCalendarWidget({ userId, isConnected }: Props) {
    if (!isConnected) {
        return (
            <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-2">Google Calendar</h2>
                <p className="text-gray-500 text-sm">
                    Connect your Google Calendar to see your upcoming events here.
                </p>
            </div>
        )
    }

    let events: Awaited<ReturnType<typeof getUpcomingEvents>> = []
    let error = ''

    try {
        events = await getUpcomingEvents(userId, 8)
    } catch (err: any) {
        error = err?.message || 'Failed to load calendar events'
    }

    return (
        <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming on Your Calendar</h2>

            {error && (
                <p className="text-red-500 text-sm">{error}</p>
            )}

            {!error && events.length === 0 && (
                <p className="text-gray-500 text-sm">No upcoming events found.</p>
            )}

            {!error && events.length > 0 && (
                <div className="space-y-3">
                    {events.map(event => (
                        <div key={event.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                            <p className="font-medium text-sm">{event.title}</p>
                            <p className="text-gray-500 text-xs mt-1">
                                {event.isAllDay
                                    ? formatAllDay(event.start)
                                    : `${formatDateTime(event.start)} — ${formatTimeOnly(event.end)}`}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function formatDateTime(iso: string | null) {
    if (!iso) return ''
    const d = new Date(iso)
    const datePart = d.toLocaleDateString('en-IN', {
        weekday: 'short', month: 'short', day: 'numeric',
        timeZone: 'Asia/Kolkata',
    })
    const timePart = d.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true,
        timeZone: 'Asia/Kolkata',
    })
    return `${datePart}, ${timePart}`
}

function formatTimeOnly(iso: string | null) {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true,
        timeZone: 'Asia/Kolkata',
    })
}

function formatAllDay(iso: string | null) {
    if (!iso) return 'All day'
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', {
        weekday: 'short', month: 'short', day: 'numeric',
        timeZone: 'Asia/Kolkata',
    }) + ' (All day)'
}