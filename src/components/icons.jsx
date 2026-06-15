// Lucide-style line icons. Fixed 24x24 viewBox, sized via className (w-6 h-6).
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const LogoMark = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="28" height="28" rx="8" fill="currentColor" />
    <path
      d="M10 11h12M10 16h8M10 21h5"
      stroke="white"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
)

export const Bolt = ({ className = 'w-6 h-6' }) => (
  <svg {...base} className={className}>
    <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
  </svg>
)

export const Layers = ({ className = 'w-6 h-6' }) => (
  <svg {...base} className={className}>
    <path d="m12 2 9 5-9 5-9-5 9-5Z" />
    <path d="m3 12 9 5 9-5" />
    <path d="m3 17 9 5 9-5" />
  </svg>
)

export const Shield = ({ className = 'w-6 h-6' }) => (
  <svg {...base} className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

export const Sparkles = ({ className = 'w-6 h-6' }) => (
  <svg {...base} className={className}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <path d="m6.3 6.3 2.4 2.4M15.3 15.3l2.4 2.4M17.7 6.3l-2.4 2.4M8.7 15.3l-2.4 2.4" />
  </svg>
)

export const Chart = ({ className = 'w-6 h-6' }) => (
  <svg {...base} className={className}>
    <path d="M3 3v18h18" />
    <path d="m7 14 3-3 3 3 5-6" />
  </svg>
)

export const Users = ({ className = 'w-6 h-6' }) => (
  <svg {...base} className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" />
  </svg>
)

export const Check = ({ className = 'w-5 h-5' }) => (
  <svg {...base} className={className}>
    <path d="m20 6-11 11-5-5" />
  </svg>
)

export const ArrowRight = ({ className = 'w-5 h-5' }) => (
  <svg {...base} className={className}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
)

export const Star = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
  </svg>
)

export const Menu = ({ className = 'w-6 h-6' }) => (
  <svg {...base} className={className}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

export const Close = ({ className = 'w-6 h-6' }) => (
  <svg {...base} className={className}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)
