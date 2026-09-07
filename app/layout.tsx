import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'EagleEye — AI Global Cyber Intelligence',
  description: 'AI global cyber intelligence and ransomware defense command center.'
}

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>
}
