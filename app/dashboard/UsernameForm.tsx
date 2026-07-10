'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UsernameForm() {
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    async function handleSubmit() {
        if (!username) return
        setLoading(true)
        setError('')

        const res = await fetch('/api/user/username', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        })

        const data = await res.json()

        if (!res.ok) {
            setError(data.error || 'Something went wrong')
            setLoading(false)
            return
        }

        router.refresh()
    }

    return (
        <div className="flex gap-2">
            <input
                type="text"
                placeholder="e.g. dhruvvi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border rounded px-3 py-2 flex-1"
            />
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Saving...' : 'Save'}
            </button>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    )
}