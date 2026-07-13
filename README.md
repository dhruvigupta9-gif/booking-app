# Schedulr

A calendar-synced booking and payment app. Hosts connect their Google Calendar, share a public booking link, and clients can book available slots. Built with Next.js, Prisma, Supabase, Clerk, and Google Calendar API.

---

## Features

- Sign up and login with Clerk authentication
- Connect Google Calendar to sync free and busy slots
- Public booking page where clients pick available time slots
- Personal bookings require host approval only
- Work bookings require approval and payment (Stripe - coming soon)
- Host dashboard to view, approve, and reject bookings
- Email notifications for both host and client via Resend
- All bookings stored in PostgreSQL via Supabase

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | Full-stack framework (frontend + backend) |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Clerk | Authentication |
| Prisma 6 | Database ORM |
| Supabase | PostgreSQL database hosting |
| Google Calendar API | Reading free/busy slots |
| Resend | Email notifications |
| Stripe | Payments (coming soon) |

---

## Project Structure

booking-app/
├── app/
│   ├── dashboard/         ← Host dashboard (protected)
│   ├── book/[username]/   ← Public booking page
│   ├── sign-in/           ← Clerk sign in
│   ├── sign-up/           ← Clerk sign up
│   └── api/
│       ├── auth/google/   ← Google OAuth flow
│       ├── bookings/      ← Create and update bookings
│       ├── slots/         ← Free/busy slots API
│       ├── user/          ← User settings
│       └── webhooks/      ← Clerk webhook receiver
├── lib/
│   ├── prisma.ts          ← Database client
│   ├── calendar.ts        ← Google Calendar helper
│   └── email.ts           ← Email helper
└── prisma/
└── schema.prisma      ← Database schema

---

## Database Schema

### User
- id, email, name, username
- hourlyRate (for work bookings)
- googleAccessToken, googleRefreshToken
- createdAt

### Booking
- id, hostId, clientName, clientEmail
- startTime, endTime
- type (personal or work)
- status (pending, approved, rejected, paid)
- createdAt

---

## Environment Variables

Create a `.env` file in the root with these values:
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=

---

## How to Run Locally

1. Clone the repository
2. Install dependencies — `npm install`
3. Set up environment variables in `.env`
4. Push database schema — `npx prisma db push`
5. Start development server — `npm run dev`
6. Visit `http://localhost:3000`

---

## How It Works

### Host flow
1. Signs up → automatically saved to database via Clerk webhook
2. Connects Google Calendar from dashboard
3. Sets a username to get public booking link
4. Shares link with clients
5. Receives email when someone books
6. Approves or rejects bookings from dashboard
7. Client receives email about decision

### Client flow
1. Visits host's public booking link
2. Picks a date → free slots load from Google Calendar
3. Selects a time slot
4. Enters name, email, and booking type
5. Submits booking → receives confirmation email
6. Receives approval or rejection email from host

---

## Current Status

- Authentication ✅
- Google Calendar sync ✅
- Public booking page ✅
- Host dashboard ✅
- Email notifications ✅
- Stripe payments ⏳ Coming soon
- Deployment ⏳ Coming soon
