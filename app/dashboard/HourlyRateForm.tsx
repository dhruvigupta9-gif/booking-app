'use client'

import { useState } from 'react'

export default function HourlyRateForm({ currentRate }: { currentRate: number | null }) {
    const [rate, setRate] = useState(currentRate?.toString() || '')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    async function handleSave() {
        setSaving(true)
        setError('')

        const res = await fetch('/api/user/rate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hourlyRate: parseFloat(rate) }),
        })

        const data = await res.json()

        if (!res.ok) {
            setError(data.error || 'Something went wrong')
            setSaving(false)
            return
        }

        window.location.reload()
    }

    return (
        <div className="flex gap-2">
            <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    placeholder="e.g. 500"
                    className="border rounded pl-7 pr-3 py-2 w-full"
                />
            </div>
            <button
                onClick={handleSave}
                disabled={saving || !rate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
                {saving ? 'Saving...' : 'Save'}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    )
}