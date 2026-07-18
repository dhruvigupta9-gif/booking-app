'use client'

import { useState } from 'react'

interface Booking {
    id: string
    clientName: string
    clientEmail: string
    startTime: Date
    endTime: Date
    type: string
    approvalStatus: string
    paymentStatus: string
    createdAt: Date
}

interface Props {
    bookings: Booking[]
}

export default function BookingsList({ bookings }: Props) {
    const [approvalStates, setApprovalStates] = useState<Record<string, string>>(
        Object.fromEntries(bookings.map((b) => [b.id, b.approvalStatus]))
    )
    const [loading, setLoading] = useState<string | null>(null)

    async function updateStatus(bookingId: string, status: string) {
        setLoading(bookingId)

        const res = await fetch('/api/bookings/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId, status }),
        })

        if (res.ok) {
            setApprovalStates((prev) => ({ ...prev, [bookingId]: status }))
        }

        setLoading(null)
    }

    if (bookings.length === 0) {
        return <p className="text-gray-500">No bookings yet.</p>
    }

    return (
        <div className="space-y-4">
            {bookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="font-semibold">{booking.clientName}</p>
                            <p className="text-sm text-gray-500">{booking.clientEmail}</p>
                        </div>

                        <div className="flex gap-2">
                            {/* Approval badge */}
                            <span className={`text-sm px-2 py-1 rounded-full ${approvalStates[booking.id] === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                approvalStates[booking.id] === 'approved' ? 'bg-green-100 text-green-700' :
                                    approvalStates[booking.id] === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                }`}>
                                {approvalStates[booking.id]}
                            </span>

                            {/* Payment badge — only meaningful for work bookings */}
                            {booking.type === 'work' && (
                                <span className={`text-sm px-2 py-1 rounded-full ${booking.paymentStatus === 'paid' ? 'bg-blue-100 text-blue-700' :
                                    booking.paymentStatus === 'unpaid' ? 'bg-orange-100 text-orange-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                    {booking.paymentStatus}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                        <p>📅 {new Date(booking.startTime).toLocaleDateString('en-IN', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}</p>
                        <p>🕐 {new Date(booking.startTime).toLocaleTimeString('en-IN', {
                            hour: '2-digit', minute: '2-digit', hour12: true
                        })} — {new Date(booking.endTime).toLocaleTimeString('en-IN', {
                            hour: '2-digit', minute: '2-digit', hour12: true
                        })}</p>
                        <p>📋 {booking.type === 'work' ? '💼 Work booking' : '👤 Personal booking'}</p>
                    </div>

                    {approvalStates[booking.id] === 'pending' && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => updateStatus(booking.id, 'approved')}
                                disabled={loading === booking.id}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading === booking.id ? 'Updating...' : 'Approve'}
                            </button>
                            <button
                                onClick={() => updateStatus(booking.id, 'rejected')}
                                disabled={loading === booking.id}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                            >
                                {loading === booking.id ? 'Updating...' : 'Reject'}
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}