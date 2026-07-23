import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import { FluidNav } from '@/components/layout/fluid-nav'
import { SiteBackground } from '@/components/layout/site-background'
import { AudioProvider } from '@/components/audio/audio-provider'
import { TopRightWidget } from '@/components/layout/top-right-widget'
import { NavProvider } from '@/components/layout/nav-context'
import './globals.css'

const display = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'God Of College — Fantasy Novel',
  description: 'Kisah Baydar, mantan Raja Harem PAUD yang terlempar ke ITK, mendapat System Skill SSS+ Loli Hunter, dan berjuang melawan Organisasi PAUD Dunia demi menjadi Dewa.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans text-[#e5e5e5] antialiased selection:bg-moonstone-blue/30 overflow-x-hidden">
        <AudioProvider>
          <NavProvider>
            <SiteBackground />
            <FluidNav />
            <TopRightWidget />
            <main className="relative z-10 min-h-screen">
              {children}
            </main>
            <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.015]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
          </NavProvider>
        </AudioProvider>
      </body>
    </html>
  )
}
