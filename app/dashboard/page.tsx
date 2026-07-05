import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const {userId} = await auth()
    if(!userId) redirect('/sign-in')


return (
    <main className="min-h-screen p-8">

        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Schedulr Dashboard</h1>
            <UserButton />
        </div>
        <p  className="text-gray-500">Welcome to your Schedulr dashboard!</p>
    
    </main>
)
}