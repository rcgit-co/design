import { ArrowRight, Check, Star } from './icons.jsx'

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40">
      {/* soft brand background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-0 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-brand-100 blur-3xl opacity-60" />
        <div className="absolute right-10 top-40 h-64 w-64 rounded-full bg-accent-400/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <a
          href="#features"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 transition-colors duration-200 hover:bg-brand-100"
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-accent-500" />
          New: AI summaries for every project
          <ArrowRight className="h-4 w-4" />
        </a>

        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl">
          Work flows better,{' '}
          <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
            together
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
          Flowboard is the all-in-one workspace where teams plan, track, and ship
          work — without the chaos of switching between five different tools.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#pricing"
            className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent-500/20 transition-colors duration-200 hover:bg-accent-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 sm:w-auto"
          >
            Start free — no card needed
            <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
          <a
            href="#how"
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 transition-colors duration-200 hover:border-brand-300 hover:text-brand-600 sm:w-auto"
          >
            See how it works
          </a>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500 sm:flex-row">
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 text-brand-600" /> 14-day free trial
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 text-brand-600" /> Cancel anytime
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="flex text-accent-500" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4" />
              ))}
            </span>
            4.9/5 from 2,000+ teams
          </span>
        </div>

        {/* product mockup */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-300/40">
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-slate-300" />
                <span className="h-3 w-3 rounded-full bg-slate-300" />
                <span className="h-3 w-3 rounded-full bg-slate-300" />
              </div>
              <MockBoard />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MockBoard() {
  const columns = [
    { title: 'Backlog', tint: 'bg-slate-100', cards: 3 },
    { title: 'In progress', tint: 'bg-brand-50', cards: 2 },
    { title: 'Review', tint: 'bg-accent-400/10', cards: 2 },
    { title: 'Done', tint: 'bg-brand-100', cards: 3 },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 bg-white p-4 text-left sm:grid-cols-4 sm:p-6">
      {columns.map((col) => (
        <div key={col.title} className="rounded-lg bg-slate-50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {col.title}
            </span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-400">
              {col.cards}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: col.cards }).map((_, i) => (
              <div
                key={i}
                className={`rounded-md ${col.tint} p-2.5 shadow-sm`}
              >
                <div className="h-2 w-3/4 rounded-full bg-slate-300/70" />
                <div className="mt-1.5 h-2 w-1/2 rounded-full bg-slate-200" />
                <div className="mt-2.5 flex items-center gap-1">
                  <span className="h-4 w-4 rounded-full bg-brand-300" />
                  <span className="h-4 w-4 rounded-full bg-accent-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
