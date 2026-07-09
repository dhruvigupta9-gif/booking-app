'use client'

import { useState } from 'react'

interface Slot {
    start: string
    end: string
    label: string
}

interface Props {
    hostId: string
    hostName: string
}

export default function BookingForm({ hostId, hostName }: Props) {
    const [date, setDate] = useState('')
    const [slots, setSlots] = useState<Slot[]>([])
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [clientName, setClientName] = useState('')
    const [clientEmail, setClientEmail] = useState('')
    const [bookingType, setBookingType] = useState<'personal' | 'work'>('personal')
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    async function fetchSlots(selectedDate: string) {
        setLoadingSlots(true)
        setSlots([])
        setSelectedSlot(null)

        const res = await fetch(`/api/slots?userId=${hostId}&date=${selectedDate}`)
        const data = await res.json()
        setSlots(data.slots || [])
        setLoadingSlots(false)
    }

    async function handleSubmit() {
        if (!selectedSlot || !clientName || !clientEmail) {
            setError('Please fill in all fields and select a time slot')
            return
        }

        setSubmitting(true)
        setError('')

        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                hostId,
                clientName,
                clientEmail,
                startTime: selectedSlot.start,
                endTime: selectedSlot.end,
                type: bookingType,
            }),
        })

        const data = await res.json()

        if (!res.ok) {
            setError(data.error || 'Something went wrong')
            setSubmitting(false)
            return
        }

        setSuccess(true)
    }

    if (success) {
        return (
            <div className="text-center p-8 border rounded-lg">
                <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-500">
                    Your booking with {hostName} has been submitted.
                    You will receive a confirmation email shortly.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">

            <div className="border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Select a Date</h2>
                <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                        setDate(e.target.value)
                        fetchSlots(e.target.value)
                    }}
                    className="border rounded px-3 py-2 w-full"
                />
            </div>

            {loadingSlots && (
                <div className="text-center text-gray-500">Loading available slots...</div>
            )}

            {slots.length > 0 && (
                <div className="border rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Select a Time</h2>
                    <div className="grid grid-cols-3 gap-2">
                        {slots.map((slot) => (
                            <button
                                key={slot.start}
                                onClick={() => setSelectedSlot(slot)}
                                className={`p-2 rounded border text-sm ${selectedSlot?.start === slot.start
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'hover:border-blue-400'
                                    }`}
                            >
                                {slot.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {slots.length === 0 && date && !loadingSlots && (
                <div className="text-center text-gray-500 border rounded-lg p-6">
                    No available slots for this date.
                </div>
            )}

            {selectedSlot && (
                <div className="border rounded-lg p-6 space-y-4">
                    <h2 className="text-lg font-semibold">Your Details</h2>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Your Name</label>
                        <input
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="John Doe"
                            className="border rounded px-3 py-2 w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Your Email</label>
                        <input
                            type="email"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="border rounded px-3 py-2 w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Booking Type</label>
                        <select
                            value={bookingType}
                            onChange={(e) => setBookingType(e.target.value as 'personal' | 'work')}
                            className="border rounded px-3 py-2 w-full"
                        >
                            <option value="personal">Personal (approval only)</option>
                            <option value="work">Work (approval + payment)</option>
                        </select>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Book Session'}
                    </button>
                </div>
            )}

        </div>
    )
}