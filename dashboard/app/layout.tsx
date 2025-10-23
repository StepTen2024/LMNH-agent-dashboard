import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LMNH Dashboard - Look Mum No Hands! 🚴‍♂️',
  description: 'Real-time dashboard for LMNH autonomous coding agent',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon', sizes: '32x32' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/apple-icon', sizes: '180x180' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

