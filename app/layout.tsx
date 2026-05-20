import type { Metadata } from 'next'
import './globals.css'
import '@/styles/print.css'
import { Navbar } from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Slip Gaji Generator',
  description: 'Generate slip gaji dari file Excel',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <div className="app-shell">
          <Navbar />
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  )
}
