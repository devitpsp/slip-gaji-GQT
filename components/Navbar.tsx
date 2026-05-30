'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/settings', label: 'Settings' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="navbar no-print">
      <div className="navbar__inner">
        <Link className="navbar__brand" href="/">
          <span className="navbar__logo">
            <Image src="/GQT-icon.png" alt="GQT" width={28} height={28} priority />
          </span>
          <span>Slip Gaji Generator</span>
        </Link>
        <nav className="navbar__links" aria-label="Navigasi utama">
          {LINKS.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)

            return (
              <Link key={link.href} className={`navbar__link${active ? ' navbar__link--active' : ''}`} href={link.href} aria-current={active ? 'page' : undefined}>
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
