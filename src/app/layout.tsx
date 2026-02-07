import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sportshunt - Scoreboard',
  description: 'Professional multi-sport scoreboard application for live match scoring',
  icons: {
    icon: '/SportshuntScoring/logo.jpeg',
    apple: '/SportshuntScoring/logo.jpeg',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#111827',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sportshunt',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
