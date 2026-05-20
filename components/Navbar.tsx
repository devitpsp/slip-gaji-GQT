import { FileText } from 'lucide-react'
import Link from 'next/link'

export function Navbar() {
  return (
    <header className="navbar no-print">
      <div className="navbar__inner">
        <Link className="navbar__brand" href="/">
          <span className="navbar__logo"><FileText size={18} /></span>
          <span>Slip Gaji Generator</span>
        </Link>
        <nav className="navbar__links" aria-label="Navigasi utama">
          <Link className="navbar__link" href="/">Home</Link>
          <Link className="navbar__link" href="/settings">Settings</Link>
        </nav>
      </div>
    </header>
  )
}
