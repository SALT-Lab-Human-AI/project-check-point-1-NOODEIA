import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'NOODIEA',
  description: 'AI Tutor',
  generator: 'NOODIEA',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,  // Prevent zoom to fix keyboard issues
  viewportFit: 'cover',
  userScalable: false, // Disable zoom to prevent keyboard scaling issues
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body suppressHydrationWarning style={{ backgroundColor: '#FDFBD4' }}>
        {children}
      </body>
    </html>
  )
}
