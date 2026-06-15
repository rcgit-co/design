import { useState } from 'react'
import { LogoMark, Menu, Close } from './icons.jsx'

const links = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Customers', href: '#testimonials' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-md sm:px-6"
        aria-label="Primary"
      >
        <a href="#top" className="flex items-center gap-2 text-brand-600">
          <LogoMark className="h-8 w-8" />
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Flowboard
          </span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="cursor-pointer text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-brand-600"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#"
            className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:text-brand-600"
          >
            Sign in
          </a>
          <a
            href="#pricing"
            className="cursor-pointer rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-accent-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
          >
            Start free
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="cursor-pointer rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <Close /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-slate-200 bg-white p-4 shadow-lg md:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-brand-600"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#pricing"
            onClick={() => setOpen(false)}
            className="mt-2 block cursor-pointer rounded-lg bg-accent-500 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-accent-600"
          >
            Start free
          </a>
        </div>
      )}
    </header>
  )
}
