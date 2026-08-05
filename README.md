# Schedulr

Schedulr is a scheduling and booking platform inspired by Calendly. It lets users connect their Google Calendar, share a public booking link, and allow others to schedule meetings based on their real-time availability.

I built this project to learn how real-world scheduling systems work and to gain hands-on experience with calendar integrations, authentication, payments, and full-stack development.

---

## Features

* Sign up and log in with Clerk authentication
* Connect Google Calendar and sync availability automatically
* Share a public booking page with a custom username
* Book meetings based on real-time free slots
* Personal bookings that require host approval
* Work bookings that require approval and payment
* Host dashboard to manage bookings
* Email notifications for hosts and clients
* PostgreSQL database hosted on Supabase
* Stripe integration for paid bookings

---

## Tech Stack

| Technology          | Usage                |
| ------------------- | -------------------- |
| Next.js 16          | Frontend and backend |
| TypeScript          | Development          |
| Tailwind CSS        | Styling              |
| Clerk               | Authentication       |
| Prisma              | Database ORM         |
| Supabase            | PostgreSQL Database  |
| Google Calendar API | Availability sync    |
| Stripe              | Payments             |
| Brevo / Resend      | Email notifications  |
| Vercel              | Deployment           |

---

## How It Works

### For Hosts

1. Create an account and sign in.
2. Connect your Google Calendar.
3. Choose a username to generate your booking link.
4. Share the link with others.
5. Receive booking requests and manage them from the dashboard.
6. Approve or reject requests and notify clients automatically.

### For Clients

1. Open the host's booking page.
2. Choose an available date and time.
3. Enter your details and submit the booking request.
4. Receive email updates about the booking status.

---

## Live Demo

🌐 https://getschedulr.vercel.app

Try creating an account, connecting Google Calendar, and booking a session through a public booking page.

---

## Current Status

Schedulr is currently in **demo mode**.

The core functionality is working, but I'm still testing and polishing a few things before making it publicly available. Most testing so far has been done using my own accounts, and Stripe is running in test mode.

If you'd like to try the payment flow, you can use Stripe's test card:

```text
Card Number: 4242 4242 4242 4242
Expiry Date: Any future date
CVC: Any 3 digits
ZIP Code: Any 5 digits
```

No real money will be charged.

---

## What I Learned

This project taught me a lot about building and deploying a full-stack application from scratch, including:

* OAuth and Google Calendar integration
* Database design with Prisma and PostgreSQL
* Authentication and user management
* Stripe payment flows and webhooks
* Handling third-party APIs
* Deploying and managing a production-style application

---

## Author

**Dhruvvi Gupta**

Built independently as a personal project to learn full-stack development and solve a real scheduling problem.
