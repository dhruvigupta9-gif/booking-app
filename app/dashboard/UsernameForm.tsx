'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UsernameForm({ currentUsername }: { currentUsername?: string | null }) {
    const [isEditing, setIsEditing] = useState(!currentUsername) // agar username nahi hai, seedha edit mode
    const [username, setUsername] = useState(currentUsername || '')
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

        setLoading(false)
        setIsEditing(false)
        router.refresh()
    }

    // View mode: username already set, dikhao with Edit button
    if (!isEditing && currentUsername) {
        return (
            <div className="flex items-center gap-3">
                <div>
                    <p className="text-sm text-gray-500">Your booking link</p>
                    <p className="font-medium">getschedulr.vercel.app/book/{currentUsername}</p>
                </div>
                <button
                    onClick={() => {
                        setUsername(currentUsername)
                        setIsEditing(true)
                    }}
                    className="text-blue-600 text-sm hover:underline"
                >
                    Edit
                </button>
            </div>
        )
    }

    // Edit mode
    return (
        <div>
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
                {currentUsername && (
                    <button
                        onClick={() => {
                            setUsername(currentUsername)
                            setIsEditing(false)
                            setError('')
                        }}
                        className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                )}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    )
}