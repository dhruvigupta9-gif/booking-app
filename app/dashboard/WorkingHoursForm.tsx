'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
    initialStartHour: number
    initialEndHour: number
}

// Start time: 9am–5pm (17:00). End time: 4pm (16:00)–9pm (21:00).
const START_HOURS = Array.from({ length: 9 }, (_, i) => i + 9)   // 9..17
const END_HOURS = Array.from({ length: 6 }, (_, i) => i + 16)    // 16..21

function formatHour(hour: number) {
    const date = new Date()
    date.setHours(hour, 0, 0, 0)
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export default function WorkingHoursForm({ initialStartHour, initialEndHour }: Props) {
    const [startHour, setStartHour] = useState(initialStartHour)
    const [endHour, setEndHour] = useState(initialEndHour)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [saved, setSaved] = useState(false)
    const router = useRouter()

    async function handleSave() {
        setLoading(true)
        setError('')
        setSaved(false)

        const res = await fetch('/api/user/hours', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workStartHour: startHour, workEndHour: endHour }),
        })

        const data = await res.json()

        if (!res.ok) {
            setError(data.error || 'Something went wrong')
            setLoading(false)
            return
        }

        setSaved(true)
        setLoading(false)
        router.refresh()
    }

    return (
        <div className="border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Working Hours</h2>
            <p className="text-sm text-gray-500">
                Clients will only see available slots within these hours.
            </p>

            <div className="flex gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                    <select
                        value={startHour}
                        onChange={(e) => setStartHour(Number(e.target.value))}
                        className="border rounded px-3 py-2 w-full"
                    >
                        {START_HOURS.map((h) => (
                            <option key={h} value={h}>{formatHour(h)}</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">End Time</label>
                    <select
                        value={endHour}
                        onChange={(e) => setEndHour(Number(e.target.value))}
                        className="border rounded px-3 py-2 w-full"
                    >
                        {END_HOURS.map((h) => (
                            <option key={h} value={h}>{formatHour(h)}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save'}
                </button>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {saved && <p className="text-green-600 text-sm">Working hours updated!</p>}
        </div>
    )
}